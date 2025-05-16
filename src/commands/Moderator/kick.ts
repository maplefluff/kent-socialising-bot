import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import {
	ActionRowBuilder,
	ApplicationCommandType,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
	type User,
} from "discord.js";

@ApplyOptions<Command.Options>({
	description: "Kick a member, also DMs them the reason",
	requiredClientPermissions: [PermissionFlagsBits.KickMembers],
	requiredUserPermissions: [PermissionFlagsBits.KickMembers],
})
export class KickCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.setContexts(InteractionContextType.Guild)
				.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
				.addUserOption((option) =>
					option //
						.setName("user")
						.setDescription("The user to kick")
						.setRequired(true),
				),
		);

		registry.registerContextMenuCommand((builder) =>
			builder //
				.setName(this.name)
				.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
				.setContexts(InteractionContextType.Guild)
				.setType(ApplicationCommandType.User),
		);

		registry.registerContextMenuCommand((builder) =>
			builder //
				.setName(this.name)
				.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
				.setContexts(InteractionContextType.Guild)
				.setType(ApplicationCommandType.Message),
		);
		// I did all 3 command types so that users can either
		// do /kick
		// right click the users > apps > kick
		// OR
		// right click the message > apps > kick
		// this- is probably overkill but I wanted to do it anyway and worst case scenario I can just remove it later
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const user = interaction.options.getUser("user");
		if (!user)
			return interaction.reply({
				content: "Please provide a valid user",
				ephemeral: true,
			});

		return this.handleKickModal(interaction, user);
	}

	public async contextMenuRun(
		interaction: Command.ContextMenuCommandInteraction<"cached">,
	) {
		const user: any =
			interaction instanceof MessageContextMenuCommandInteraction
				? (await interaction.channel?.messages.fetch(interaction.targetId))
						?.author
				: await this.container.client.users.fetch(interaction.targetId);

		if (!user) {
			return interaction.reply({
				content: "Failed to fetch user. Please try again",
				ephemeral: true,
			});
		}

		return this.handleKickModal(interaction, user);
	}

	private async handleKickModal(
		interaction:
			| Command.ChatInputCommandInteraction
			| Command.ContextMenuCommandInteraction,
		user: User,
	) {
		const member = await interaction
			.guild!.members.fetch(user)
			.catch(() => null);
		// im just forcing it since- this command can only be ran in the server lol
		if (!member)
			return interaction.reply({
				content: "Please provide a valid user",
				ephemeral: true,
			});

		if (member.id === this.container.client.user?.id)
			return interaction.reply({
				content: "I cannot kick myself >.<",
				ephemeral: true,
			});
		if (member.id === interaction.user.id)
			return interaction.reply({
				content: "You cannot kick yourself lol",
				ephemeral: true,
			});
		if (!member.manageable || !member.kickable)
			return interaction.reply({
				content: "I cannot kick this user",
				ephemeral: true,
			});

		const reasonTextInput = new TextInputBuilder()
			.setLabel("Reason")
			.setCustomId("kick.reasonInput")
			.setPlaceholder("Please provide a reason")
			.setMinLength(1)
			.setMaxLength(512)
			.setStyle(TextInputStyle.Paragraph);
		const textInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
			reasonTextInput,
		);
		const reasonModal = new ModalBuilder()
			.setTitle(`Kick ${member.user.username}`)
			.addComponents(textInputRow)
			.setCustomId(`kick.modal.${member.id}`);

		return interaction.showModal(reasonModal);
	}
}
