import Connection from "./Connection";

export default class ConnectionRepository
{
    constructor()
    {
        const list = () => window.queryBus.dispatch('dataEngine.query.list', 'connection');
        const get = (id) => window.queryBus.dispatch('dataEngine.query.get', ['connection', id]);

        window.commandBus.register('connection.command.update', (connections) => connections
            .map((connection) => window.commandBus.dispatch('dataEngine.command.update', connection)));

        window.queryBus.register('connection.query.list', list);
        window.queryBus.register('connection.query.get', get);

        window.eventBus.subscribe('dataEngine.event.downloaded', () => {
            window.eventBus.post('connection.event.loaded', list());
        });

        window.eventBus.subscribe('dataEngine.event.updated', (data) => {
            if (data instanceof Connection) {
                window.eventBus.post('connection.event.updated', data);
            }
        });
    }
}