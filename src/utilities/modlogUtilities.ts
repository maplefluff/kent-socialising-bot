import { Utility } from '@sapphire/plugin-utilities-store';
import { envParseString } from '@skyra/env-utilities';
import type { EmbedBuilder, ThreadChannel } from 'discord.js';

export class ModlogUtilities extends Utility {
	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'modlogUtilities'
		});
	}

	public async fetchMessagesThread() {
		const thread = await this.container.client.channels.fetch(envParseString('MODLOG_MESSAGES_THREAD_ID'));
		if (!thread) throw new Error('Unable to fetch messages thread');

		return thread as ThreadChannel;
	}

	public async fetchMembersThread() {
		const thread = await this.container.client.channels.fetch(envParseString('MODLOG_MEMBERS_THREAD_ID'));
		if (!thread) throw new Error('Unable to fetch members thread');

		return thread as ThreadChannel;
	}

	public async fetchRolesThread() {
		const thread = await this.container.client.channels.fetch(envParseString('MODLOG_ROLES_THREAD_ID'));
		if (!thread) throw new Error('Unable to fetch roles thread');

		return thread as ThreadChannel;
	}

	public async fetchChannelsThread() {
		const thread = await this.container.client.channels.fetch(envParseString('MODLOG_CHANNELS_THREAD_ID'));
		if (!thread) throw new Error('Unable to fetch channels thread');

		return thread as ThreadChannel;
	}

	public async sendDmToUser(userId: string, data: EmbedBuilder) {
		try {
			const user = await this.container.client.users.fetch(userId);

			await user.send({ embeds: [data] });

			return true;
		} catch (error) {
			return false;
		}
	}
}

declare module '@sapphire/plugin-utilities-store' {
	export interface Utilities {
		modlogUtilities: ModlogUtilities;
	}
}
