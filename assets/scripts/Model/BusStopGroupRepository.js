import BusStopGroup from "./BusStopGroup";

export default class BusStopGroupRepository
{
    constructor()
    {
        const list = () => window.queryBus.dispatch('dataEngine.query.list', 'busStopGroup');
        const get = (id) => window.queryBus.dispatch('dataEngine.query.get', ['busStopGroup', id]);


        window.commandBus.register('busStopGroup.command.update', (busStopGroups) => busStopGroups
            .map((busStopGroup) => window.commandBus.dispatch('dataEngine.command.update', busStopGroup)));

        window.queryBus.register('busStopGroup.query.list', list);
        window.queryBus.register('busStopGroup.query.get', get);

        window.eventBus.subscribe('dataEngine.event.downloaded', () => {
            window.eventBus.post('busStopGroup.event.loaded', list());
        });

        window.eventBus.subscribe('dataEngine.event.updated', (data) => {
            if (data instanceof BusStopGroup) {
                window.eventBus.post('busStopGroup.event.updated', data);
            }
        });
    }
}