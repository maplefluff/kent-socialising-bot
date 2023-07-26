import '#lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
	defaultPrefix: '!',
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	intents: [
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds
	],
	hmr: {
		enabled: envParseString('NODE_ENV') !== 'production'
	}
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login(envParseString('DISCORD_TOKEN'));
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

await main();
