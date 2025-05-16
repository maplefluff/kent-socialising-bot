import { ApplyOptions } from "@sapphire/decorators";
import {
	InteractionHandler,
	InteractionHandlerTypes,
} from "@sapphire/framework";
import { envParseString } from "@skyra/env-utilities";
import {
	type APIEmbed,
	type ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
} from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button,
})
export class VerifyButtonHandler extends InteractionHandler {
	private readonly verifyKey = envParseString("VERIFY_KEY");
	private readonly verifiedRoleId = envParseString("VERIFIED_ROLE_ID");
	private readonly maxCodeLength = this.verifyKey.length;

	public override parse(interaction: ButtonInteraction) {
		const interactionData = interaction.customId.split(".");
		return interactionData[0] === "verify" && interactionData[1]
			? this.some(interactionData[1])
			: this.none();
	}

	public async run(interaction: ButtonInteraction<"cached">, buttonId: string) {
		if (buttonId === "start") {
			this.container.verify_map.delete(interaction.user.id);
			return interaction.reply({
				content: `Please enter the code \`${this.verifyKey}\` using the buttons below`,
				components: this.generateButtonRows(),
				flags: MessageFlags.Ephemeral,
			});
		}

		const enteredDigit = Number(buttonId);
		const existingCode =
			this.container.verify_map.get(interaction.user.id) ?? [];

		// We take "-1" because we want to just instantly check the code when the length is reached, so we push the final one below
		if (existingCode.length < this.maxCodeLength - 1) {
			existingCode.push(enteredDigit);
			this.container.verify_map.set(interaction.user.id, existingCode);

			const currentCodeDisplay = [
				...existingCode,
				...Array(this.maxCodeLength - existingCode.length).fill("_"),
			].join("");
			return interaction.update({
				content: `Your current entered code is: ${currentCodeDisplay}`,
			});
		}

		existingCode.push(enteredDigit);

		const userEnteredKey = existingCode.join("");
		this.container.verify_map.delete(interaction.user.id);

		if (userEnteredKey === this.verifyKey) {
			return this.handleSuccessfulVerification(interaction);
		}

		return this.handleFailedVerification(interaction, userEnteredKey);
	}

	private generateButtonRows() {
		const buttons = Array.from({ length: 9 }, (_, i) => ({
			type: 2,
			style: ButtonStyle.Primary,
			label: (i + 1).toString(),
			custom_id: `verify.${i + 1}`,
		}));

		const rows = [];
		for (let i = 0; i < buttons.length; i += 3) {
			rows.push({ type: 1, components: buttons.slice(i, i + 3) });
		}
		return rows;
	}

	private async handleSuccessfulVerification(
		interaction: ButtonInteraction<"cached">,
	) {
		try {
			const member = interaction.member;

			const role = await interaction.guild?.roles.fetch(this.verifiedRoleId);
			if (!role) {
				await interaction.update({
					content:
						"We ran into an internal error when attempting to verify you. Please contact an admin",
				});
				return this.sendLogMessage(
					this.generateErrorEmbed(
						interaction.user,
						"error",
						`User passed verification but i could not find the verified role with ID: ${this.verifiedRoleId}`,
					),
				);
			}

			await member.roles.add(role);
			await interaction.update({
				content: "You have been successfully verified!",
				components: [],
			});
			return this.sendLogMessage(
				new EmbedBuilder()
					.setAuthor({
						name: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle("Verification pass")
					.setDescription("User successfully passed verification")
					.setColor("Green")
					.toJSON(),
			);
		} catch (error) {
			const errorMessage = `Error adding role during verification: ${error}`;
			this.container.logger.error(errorMessage);
			this.sendLogMessage(
				this.generateErrorEmbed(interaction.user, "error", errorMessage),
			);
			return interaction.update({
				content:
					"An error occurred during verification. Please try again or contact an admin.",
				components: [],
			});
		}
	}

	private async handleFailedVerification(
		interaction: ButtonInteraction,
		enteredKey: string,
	) {
		await interaction.update({
			content: "Incorrect verification code. Please try again.",
		});
		return this.sendLogMessage(
			this.generateErrorEmbed(
				interaction.user,
				"fail",
				`User failed verification with an entered key of ${enteredKey}`,
			),
		);
	}

	private async sendLogMessage(embed: APIEmbed) {
		try {
			const channel =
				await this.container.utilities.modlogUtilities.fetchThreadChannel(
					"MEMBERS",
				);
			if (!channel?.isSendable()) {
				return this.container.logger.error(
					"Failed to send log message: Failed to fetch channel or it is not sendable",
				);
			}
			return channel.send({ embeds: [embed] });
		} catch (error) {
			return this.container.logger.error(
				"Failed to send log message due to an error",
				error,
			);
		}
	}

	private generateErrorEmbed(
		user: { username: string; displayAvatarURL: () => string },
		type: "fail" | "error",
		message: string,
	): APIEmbed {
		return new EmbedBuilder()
			.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
			.setTitle(`Verification ${type}`)
			.setDescription(message)
			.setColor("Red")
			.toJSON();
	}
}
