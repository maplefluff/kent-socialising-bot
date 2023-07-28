import { Utility } from '@sapphire/plugin-utilities-store';
import { envParseString } from '@skyra/env-utilities';
import type { ThreadChannel } from 'discord.js';

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
}

declare module '@sapphire/plugin-utilities-store' {
	export interface Utilities {
		modlogUtilities: ModlogUtilities;
	}
}
