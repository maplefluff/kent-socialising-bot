import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import { EmbedBuilder, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: 'guildWarnAdd'
})
export class GuildWarnAddListener extends Listener {
	public async run(moderator: User, userId: string, data: { reason: string | null; didSendDm: boolean }) {
		try {
			const threadChannel = await this.container.client.utilities.modlogUtilities.fetchMembersThread();

			const warnedUser = await this.container.client.users.fetch(userId);

			return threadChannel.send({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: warnedUser.tag.split('#')[0],
							iconURL: warnedUser.displayAvatarURL()
						})
						.setTitle(`Member warned by ${moderator.tag.split('#')[0]}`)
						.addFields(
							{
								name: 'Reason',
								value: data.reason ?? 'No reason provided'
							},
							{
								name: 'DM status',
								value: data.didSendDm ? 'Sent' : 'Unable to send'
							}
						)
				]
			});
		} catch (error) {
			return this.container.logger.error(error);
		}
	}
}
