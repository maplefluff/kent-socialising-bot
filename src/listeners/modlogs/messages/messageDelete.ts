import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { EmbedBuilder, type Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: Events.MessageDelete
})
export class MessageDeleteListener extends Listener {
	public async run(message: Message) {
		if (message.author.bot || message.author.id === this.container.client.user?.id || message.author.system) return;

		try {
			const threadChannel = await this.container.client.utilities.modlogUtilities.fetchThreadChannel('MESSAGES');

			const deletedMessageEmbed = new EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL()
				})
				.setTitle(`Message Deleted from <#${message.channel.id}>`)
				.setDescription(
					codeBlock(message.content || 'This message had no content to display, maybe it was a join message or only had an attachment')
				);

			if (message.attachments.size > 0) {
				let attachmentInfo = '';
				message.attachments.forEach((attachment) => {
					attachmentInfo += `Filename: ${attachment.name}, Type: ${attachment.contentType}\n`;
				});
				deletedMessageEmbed.addFields({
					name: `${message.attachments.size} attachment${message.attachments.size > 1 ? 's' : ''}`,
					value: attachmentInfo
				});
			}

			return threadChannel.send({ embeds: [deletedMessageEmbed] });
		} catch (error) {
			return this.container.logger.error(error);
		}
	}
}
