import BusStop from "./BusStop";
import Fetch from "../Fetch";

export default class BusStopRepository
{
    constructor()
    {
        const itemsById = new Map();
        const itemsByGroup = new Map();

        const updateByGroup = () => {
            itemsByGroup.clear();
            for (const item of itemsById.values()) {
                const group = item.group();
                if (!itemsByGroup.has(group)) {
                    itemsByGroup.set(group, new Map());
                }
                itemsByGroup.get(group).set(item.id(), item);
            }
        };

        const createItem = (data) => new BusStop(data);
        const addItem = (item) => itemsById.set(item.id(), item);
        const removeItem = (id) => itemsById.has(id) ? itemsById.delete(id) : false;
        const getAll = () => Array.from(itemsById.values());
        const getById = (id) => itemsById.has(id) ? itemsById.get(id) : null;
        const getByGroup = (group) => itemsByGroup.has(group) ? Array.from(itemsByGroup.get(group).values()) : [];

        const loadAll = () => Fetch.get('getAllBusStops')
            .then((busStopsData) => busStopsData.map(createItem))
            .then((busStops) => {
                busStops.forEach(addItem);
                updateByGroup();
                window.eventBus.post('busStopsLoaded', getAll());
            });

        const load = (ids) => Fetch.post('getBusStops', ids)
            .then((busStopsData) => busStopsData.map(createItem))
            .then((busStops) => {
                busStops.forEach(addItem);
                updateByGroup();
                busStops.forEach((busStop) => window.eventBus.post('busStopLoaded', busStop));
            });

        const create = (data) => Fetch.post('createBusStops', data)
            .then(load);

        const changeLocation = (data) => Fetch.post('changeBusStopsLocation', data)
            .then(load);

        const remove = (data) => Fetch.post('removeBusStops', data)
            .then((ids) => {
                ids.map(removeItem);
                ids.map((id) => window.eventBus.post('busStopRemoved', id));
            });

        window.commandBus.register('loadAllBusStops', loadAll);
        window.commandBus.register('loadBusStops', load);
        window.commandBus.register('createBusStops', create);
        window.commandBus.register('changeBusStopsLocation', changeLocation);
        window.commandBus.register('removeBusStops', remove);

        window.queryBus.register('getAllBusStops', getAll);
        window.queryBus.register('getBusStop', getById);
        window.queryBus.register('getBusStopsByGroup', getByGroup);
    }
}