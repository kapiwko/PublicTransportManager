import BusStopGroup from "./BusStopGroup";
import Fetch from "../Fetch";

export default class BusStopGroupRepository
{
    constructor()
    {
        const itemsById = new Map();

        const createItem = (data) => new BusStopGroup(data);
        const addItem = (item) => itemsById.set(item.id(), item);
        const removeItem = (id) => itemsById.has(id) ? itemsById.delete(id) : false;
        const getAll = () => Array.from(itemsById.values());
        const getById = (id) => itemsById.has(id) ? itemsById.get(id) : null;

        const loadAll = () => Fetch.get('getAllBusStopGroups')
            .then((groupsData) => groupsData.map(createItem))
            .then((busStopGroups) => {
                busStopGroups.forEach(addItem);
                window.eventBus.post('busStopGroupsLoaded', getAll());
            });

        const load = (ids) => Fetch.post('getBusStopGroups', ids)
            .then((groupsData) => groupsData.map(createItem))
            .then((busStopGroups) => {
                busStopGroups.forEach(addItem);
                busStopGroups.forEach((busStopGroup) => window.eventBus.post('busStopGroupLoaded', busStopGroup));
            });

        const create = (data) => Fetch.post('createBusStopGroups', data)
            .then((ids) => {
                const groupsToLoad = new Set(ids);
                const busStopsToLoad = new Set();
                data.map((d) => d.busStops.forEach((busStopId) => {
                    busStopsToLoad.add(busStopId);
                    const busStop = window.queryBus.dispatch('getBusStop', busStopId);
                    if (busStop.group()) {
                        ids.push(busStop.group());
                    }
                }));
                load([...groupsToLoad]);
                window.commandBus.dispatch('loadBusStops', [...busStopsToLoad]);
            });

        const update = (data) => Fetch.post('updateBusStopGroups', data)
            .then(load);

        const remove = (data) => Fetch.post('removeBusStopGroups', data)
            .then((ids) => {
                const busStopsToLoad = new Set();
                ids.map((id) => {
                    removeItem(id);
                    window.queryBus.dispatch('getBusStopsByGroup', id)
                        .map((busStop) => busStopsToLoad.add(busStop.id()));
                });
                window.commandBus.dispatch('loadBusStops', [...busStopsToLoad]);
                ids.map((id) => window.eventBus.post('busStopGroupRemoved', id));
            });

        window.commandBus.register('loadAllBusStopGroups', loadAll);
        window.commandBus.register('loadBusStopGroups', load);
        window.commandBus.register('createBusStopGroups', create);
        window.commandBus.register('updateBusStopGroups', update);
        window.commandBus.register('removeBusStopGroups', remove);

        window.queryBus.register('getAllBusStopGroups', getAll);
        window.queryBus.register('getBusStopGroup', getById);
    }
}