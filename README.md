# Kent socialising moderation bot

This here is the moderation bot for the discord server `Kent socialising for over 18s`

## Main features

-   modlogs
-   informs us to changes within the server
-   DMs a user when they have a timeout placed on them (discord, why- dont you do this natively???). It will also do the same for bans and kicks
-   a warning system (lets us warn users and see whos been warned and why. This also lets users view all of their own warnings if they have any)

Currently that's it on the plans for the features. This may be expanded upon at any given time though

## Own usage

Want to use this for your own discord server? Its an incredibly simple bot with not much value, but I have made it in a way that is usable for others.
In order to use it yourself, download the source code and run `yarn` inside the main folder. From here you can build the prisma client with `yarn prisma generate`. Make sure to fill out the env file with the needed things, you can find them inside of `src\lib\setup.ts` declared at the bottom. Now you can build the bot and run it.

Just a small note, we use threads for our modlogs system. You will have to tweak atleast some of the code to use it with other channel types if you so wish
