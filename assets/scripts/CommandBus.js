export default function CommandBus()
{
    const commandCallbacksPairs = [];

    this.register = function(commandType, callback) {
        const commandCallbacksPair = findCommandCallbacksPair(commandType);

        if (commandCallbacksPair) {
            console.error("there can be only one handler for command " + commandType);
        } else {
            commandCallbacksPairs.push(new CommandCallbacksPair(commandType, callback));
        }
    };

    this.dispatch = function(commandType, args) {
        const commandCallbacksPair = findCommandCallbacksPair(commandType);

        if(!commandCallbacksPair) {
            console.warn("no handler for command " + commandType);
            return;
        }

        commandCallbacksPair.callback(args);
    };

    function findCommandCallbacksPair(commandType) {
        return commandCallbacksPairs.find(commandObject => commandObject.commandType === commandType);
    }

    function CommandCallbacksPair(commandType, callback) {
        this.commandType = commandType;
        this.callback = callback;
    }
}