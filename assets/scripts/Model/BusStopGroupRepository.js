import BusStopGroup from "./BusStopGroup";

export default class BusStopGroupRepository
{
    constructor()
    {
        const byId = new Map();

        const add = (busStopGroup) => byId.set(busStopGroup.id(), busStopGroup);
        const remove = (id) => byId.has(id) ? byId.delete(id) : false;

        const loadAll = () => window.fetch('getAllBusStopGroups').then((r) => r.json())
            .then((groupsData) => groupsData.map((groupData) => new BusStopGroup(groupData)));

        const load = (id) => window.fetch('getBusStopGroup', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({id}),
        })
            .then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(load(id)), 1000)))
            .then((groupData) => new BusStopGroup(groupData));

        window.commandBus.register('loadBusStopGroups', () => loadAll()
            .then((busStopGroups) => {
                byId.clear();
                busStopGroups.forEach(add);
                window.eventBus.post('busStopGroupsLoaded', Array.from(byId.values()));
            })
        );

        window.commandBus.register('loadBusStopGroup', (id) => load(id).then((busStopGroup) => {
            add(busStopGroup);
            window.eventBus.post('busStopGroupUpdated', busStopGroup);
        }));

        const getAll = () => Array.from(byId.values());
        window.queryBus.register('getAllBusStopGroups', getAll);

        const getById = (id) => byId.has(id) ? byId.get(id) : null;
        window.queryBus.register('getBusStopGroup', getById);

        const createBusStopGroup = (data) => window.fetch('createBusStopGroup', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
        }).then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(createBusStopGroup(data)), 1000)));

        window.commandBus.register('createBusStopGroup', (data) => createBusStopGroup(data).then((id) => {
            window.commandBus.dispatch('loadBusStopGroup', id);
            data.busStops.forEach((busStopId) => {
                const busStop = window.queryBus.dispatch('getBusStop', busStopId);
                window.commandBus.dispatch('loadBusStop', busStop.id());
                if (busStop.group()) {
                    window.commandBus.dispatch('loadBusStopGroup', busStop.group());
                }
            })
        }));

        const updateBusStopGroup = (data) => window.fetch('updateBusStopGroup', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
        }).then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(updateBusStopGroup(data)), 1000)));

        window.commandBus.register('updateBusStopGroup', (data) => updateBusStopGroup({
            ...getById(data.id).data(), ...data
        }).then((id) => window.commandBus.dispatch('loadBusStopGroup', id)));

        const removeBusStopGroup = (data) => window.fetch('removeBusStopGroup', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
        }).then((r) => r.ok ? r.json(): new Promise((r) => window.setTimeout(() => r(removeBusStopGroup(data)), 1000)));

        window.commandBus.register('removeBusStopGroup', (data) => removeBusStopGroup(data)
            .then((id) => {
                remove(id);
                window.queryBus.dispatch('getBusStopsByGroup', id)
                    .forEach((busStop) => window.commandBus.dispatch('loadBusStop', busStop.id()));
                window.eventBus.post('busStopGroupRemoved', id);
            })
        );
    }
}