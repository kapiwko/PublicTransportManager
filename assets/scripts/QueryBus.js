export default function QueryBus()
{
    const queryCallbacksPairs = [];

    this.register = function(queryType, callback) {
        const queryCallbacksPair = findQueryCallbacksPair(queryType);

        if (queryCallbacksPair) {
            console.error("there can be only one handler for query " + queryType);
        } else {
            queryCallbacksPairs.push(new QueryCallbacksPair(queryType, callback));
        }
    };

    this.dispatch = function(queryType, args) {
        const queryCallbacksPair = findQueryCallbacksPair(queryType);

        if(!queryCallbacksPair) {
            throw new Error("No handler for query " + queryType);
        }

        return queryCallbacksPair.callback(args);
    };

    function findQueryCallbacksPair(queryType) {
        return queryCallbacksPairs.find(queryObject => queryObject.queryType === queryType);
    }

    function QueryCallbacksPair(queryType, callback) {
        this.queryType = queryType;
        this.callback = callback;
    }
}