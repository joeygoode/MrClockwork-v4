
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("START_GAME");

module.exports = StartGameCommand;

function StartGameCommand()
{
    const startGameCommand = new Command(commandData);

    startGameCommand.addBehaviour(_behaviour);

    startGameCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasNotStarted,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return startGameCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();

    return targetedGame.start()
    .then(() => commandContext.respondToCommand(new MessagePayload(`The game will start the setup process in a minute. Depending on the map and players, it may take a significant amount of time.`)))
    .catch((err) => commandContext.respondToCommand(new MessagePayload(`An error occurred:\n\n${err.message}`)));
}