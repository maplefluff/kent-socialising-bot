// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= "development";

import type { PrismaClient } from "@prisma/client";
import {
	ApplicationCommandRegistries,
	RegisterBehavior,
} from "@sapphire/framework";
import { type ArrayString, setup } from "@skyra/env-utilities";
import * as colorette from "colorette";
import { srcDir } from "#lib/constants";

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
	RegisterBehavior.BulkOverwrite,
);

// Read env var
setup(new URL(".env.local", srcDir));

// Enable colorette
colorette.createColors({ useColor: true });

declare module "@skyra/env-utilities" {
	interface Env {
		DISCORD_TOKEN: string;
		GUILD_ID: string;
		MODLOG_CHANNEL_ID: string;
		MODLOG_MESSAGES_THREAD_ID: string;
		MODLOG_MEMBERS_THREAD_ID: string;
		MODLOG_ROLES_THREAD_ID: string;
		MODLOG_CHANNELS_THREAD_ID: string;
		IGNORED_USER_IDS: ArrayString;
		VERIFY_KEY: string;
		VERIFIED_ROLE_ID: string;
	}
}

declare module "@sapphire/pieces" {
	interface Container {
		prisma: PrismaClient;
		verify_map: Map<string, Array<number>>;
	}
}
