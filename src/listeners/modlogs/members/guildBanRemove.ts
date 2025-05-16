import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { AuditLogEvent, EmbedBuilder, type GuildBan } from "discord.js";

@ApplyOptions<Listener.Options>({
	event: Events.GuildBanRemove,
})
export class GuildBanRemoveListener extends Listener {
	public async run(ban: GuildBan) {
		try {
			const auditLogUnbanEvent = await ban.guild.fetchAuditLogs({
				type: AuditLogEvent.MemberBanRemove,
				limit: 1,
			});

			const threadChannel =
				await this.container.utilities.modlogUtilities.fetchThreadChannel(
					"MEMBERS",
				);

			const executor = auditLogUnbanEvent.entries.first()?.executor;

			return threadChannel.send({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: ban.user.username,
							iconURL: ban.user.displayAvatarURL(),
						})
						.setTitle(
							`Member unbanned by ${executor?.username || "Unknown moderator"}`,
						)
						.addFields(
							{
								name: "Account Created",
								value: `<t:${Math.floor(ban.user.createdTimestamp / 1000)}:R>`,
								inline: true,
							},
							{
								name: "Ban Reason",
								value: ban.reason || "No reason provided",
							},
						),
				],
			});
		} catch (error) {
			return this.container.logger.error(error);
		}
	}
}
