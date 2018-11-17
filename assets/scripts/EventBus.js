export default function EventBus()
{
    const eventCallbacksPairs = [];

    this.subscribe = (eventType, callback) => {
        const eventCallbacksPair = findEventCallbacksPair(eventType);

        if (eventCallbacksPair) {
            eventCallbacksPair.callbacks.push(callback);
        } else {
            eventCallbacksPairs.push(new EventCallbacksPair(eventType, callback));
        }
    };

    this.post = (eventType, args) => {
        const eventCallbacksPair = findEventCallbacksPair(eventType);

        if(!eventCallbacksPair) {
            console.warn("no subscribers for event " + eventType);
            return;
        }

        eventCallbacksPair.callbacks.forEach(callback => callback(args));
    };

    function findEventCallbacksPair(eventType)
    {
        return eventCallbacksPairs.find(eventObject => eventObject.eventType === eventType);
    }

    function EventCallbacksPair(eventType, callback)
    {
        this.eventType = eventType;
        this.callbacks = [callback];
    }
}