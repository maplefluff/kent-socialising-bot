// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-hmr/register';
import { setup } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { srcDir } from '#lib/constants';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup(new URL('.env.local', srcDir));

// Enable colorette
colorette.createColors({ useColor: true });

declare module '@skyra/env-utilities' {
	interface Env {
		DISCORD_TOKEN: string;
	}
}
