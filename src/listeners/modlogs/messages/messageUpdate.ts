import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { EmbedBuilder, type Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: Events.MessageUpdate
})
export class MessageUpdateListener extends Listener {
	public async run(oldMessage: Message, newMessage: Message) {
		if (newMessage.author.bot || newMessage.author.id === this.container.client.user?.id || newMessage.author.system) return;

		try {
			const threadChannel = await this.container.client.utilities.modlogUtilities.fetchThreadChannel('MESSAGES');

			const editedMessageEmbed = new EmbedBuilder()
				.setAuthor({
					name: newMessage.author.tag.split('#')[0],
					iconURL: newMessage.author.displayAvatarURL()
				})
				.setTitle(`Message edited from ${newMessage.url}`)
				.addFields(
					{
						name: 'Old Message',
						value: codeBlock(
							oldMessage.content || 'This message had no content to display, maybe it was a join message or only had an attachment'
						)
					},
					{
						name: 'New Message',
						value: codeBlock(
							newMessage.content || 'This message had no content to display, maybe it was a join message or only had an attachment'
						)
					}
				);

			return threadChannel.send({ embeds: [editedMessageEmbed] });
		} catch (error) {
			return this.container.logger.error(error);
		}
	}
}
