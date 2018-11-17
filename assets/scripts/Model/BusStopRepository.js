import BusStop from "./BusStop";

export default class BusStopRepository
{
    constructor()
    {
        const list = () => window.queryBus.dispatch('dataEngine.query.list', 'busStop');
        const get = (id) => window.queryBus.dispatch('dataEngine.query.get', ['busStop', id]);

        window.commandBus.register('busStop.command.update', (busStops) => busStops
            .map((busStop) => window.commandBus.dispatch('dataEngine.command.update', busStop)));

        window.queryBus.register('busStop.query.list', list);
        window.queryBus.register('busStop.query.get', get);

        window.eventBus.subscribe('dataEngine.event.downloaded', () => {
            window.eventBus.post('busStop.event.loaded', list());
        });

        window.eventBus.subscribe('dataEngine.event.updated', (data) => {
            if (data instanceof BusStop) {
                window.eventBus.post('busStop.event.updated', data);
            }
        });
    }
}