import BusStop from "./BusStop";

export default class BusStopRepository
{
    constructor()
    {
        const byId = new Map();
        const byGroup = new Map();

        const updateByGroup = () => {
            byGroup.clear();
            for (const busStop of byId.values()) {
                const group = busStop.group();
                if (!byGroup.has(group)) {
                    byGroup.set(group, new Map());
                }
                byGroup.get(group).set(busStop.id(), busStop);
            }
        };

        const add = (busStop) => byId.set(busStop.id(), busStop);
        const remove = (id) => byId.has(id) ? byId.delete(id) : false;

        const loadAll = () => window.fetch('getAllBusStops')
            .then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(loadAll()), 1000)))
            .then((busStopsData) => busStopsData.map((busStopData) => new BusStop(busStopData)));

        const load = (id) => window.fetch('getBusStop', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({id}),
        })
            .then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(load(id)), 1000)))
            .then((busStopData) => new BusStop(busStopData));

        window.commandBus.register('loadBusStops', () => loadAll().then((busStops) => {
            byId.clear();
            busStops.forEach(add);
            updateByGroup();
            window.eventBus.post('busStopsLoaded', Array.from(byId.values()));
        }));

        window.commandBus.register('loadBusStop', (id) => load(id).then((busStop) => {
            add(busStop);
            updateByGroup();
            window.eventBus.post('busStopUpdated', busStop);
        }));

        const getAll = () => Array.from(byId.values());
        window.queryBus.register('getAllBusStops', getAll);

        const getById = (id) => byId.has(id) ? byId.get(id) : null;
        window.queryBus.register('getBusStop', getById);

        const getByGroup = (group) => byGroup.has(group) ? Array.from(byGroup.get(group).values()) : [];
        window.queryBus.register('getBusStopsByGroup', getByGroup);

        const createBusStop = (data) => window.fetch('createBusStop', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
        }).then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(createBusStop(data)), 1000)));

        window.commandBus.register('createBusStop', (data) => createBusStop(data)
            .then((id) => window.commandBus.dispatch('loadBusStop', id)));

        const changeBusStopLocation = (data) => window.fetch('changeBusStopLocation', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
        }).then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(changeBusStopLocation(data)), 1000)));

        window.commandBus.register('changeBusStopLocation', (data) => changeBusStopLocation(data)
            .then((id) => window.commandBus.dispatch('loadBusStop', id)));

        const removeBusStop = (data) => window.fetch('removeBusStop', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
        }).then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(removeBusStop(data)), 1000)));

        window.commandBus.register('removeBusStop', (data) => removeBusStop(data)
            .then((id) => {
                remove(id);
                window.eventBus.post('busStopRemoved', id);
            })
        );
    }
}