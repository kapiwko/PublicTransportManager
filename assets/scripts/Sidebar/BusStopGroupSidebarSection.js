import {boundingExtent} from "ol/extent";
import {fromLonLat} from "ol/proj";
import icon from "../../images/busStopGroup.svg";

function createAddItem() {
    const item = window.document.createElement('li');
    item.classList.add('create');
    const name = window.document.createElement('span');
    name.contentEditable = "true";
    name.classList.add('name');
    const create = () => {
        if (name.innerText.length) {
            window.commandBus.dispatch('createBusStopGroup', {
                name: name.innerText,
                busStops: window.queryBus.dispatch('getSelectedBusStops'),
            });
            name.innerText = '';
            window.commandBus.dispatch('clearSelectedBusStops');
        }
    };
    name.addEventListener('keydown', (event) => {
        if (["Escape", "Enter"].includes(event.key)) {
            event.stopPropagation();
            event.preventDefault();
            name.blur();
        }
        if (event.key === "Enter") {
            create();
        }
    });
    item.appendChild(name);
    item.title = 'Utwórz nową grupę przystankową';
    const actions = createActions(item);
    const counter = createCounter(actions);
    counter.innerText = "0";
    window.eventBus.subscribe('busStopSelectCountChanged', (qty) => counter.innerText = qty);
    const add = createAdd(actions);
    add.addEventListener('click', create);
    return item;
}

function createAdd(actions) {
    const add = window.document.createElement('span');
    add.title = 'Utwórz nową grupę przystankową';
    add.classList.add('add');
    actions.appendChild(add);
    return add;
}

function createItem(group) {
    const item = window.document.createElement('li');
    const name = window.document.createElement('span');
    name.innerText = group.name();
    name.classList.add('name');
    name.addEventListener('dblclick', () => {
        name.contentEditable = "true";
        name.focus();
        const keydown = (event) => {
            if (["Escape", "Enter"].includes(event.key)) {
                event.stopPropagation();
                event.preventDefault();
                if (name.innerText.length) {
                    name.removeEventListener('keydown', keydown);
                    name.blur();
                    name.contentEditable = "false";
                    if (event.key === "Escape") {
                        name.innerText = group.name();
                    }
                    if (event.key === "Enter") {
                        window.commandBus.dispatch('updateBusStopGroup', {
                            id: group.id(),
                            name: name.innerText,
                        });
                    }
                }
            }
        };
        name.addEventListener('keydown', keydown);
    });
    item.appendChild(name);
    item.title = group.name();
    item.addEventListener('mouseenter', () => {
        const ids = window.queryBus.dispatch('getBusStopsByGroup', group.id()).map((b) => b.id());
        //window.commandBus.dispatch('highlightBusStopFeatures', ids);
    });
    item.addEventListener('mouseleave', () => {
        //window.commandBus.dispatch('highlightBusStopFeatures', []);
    });
    const actions = createActions(item);
    const counter = createCounter(actions);
    const updateCounter = () => {
        counter.innerText = window.queryBus.dispatch('getBusStopsByGroup', group.id()).length;
        if (group.name() === 'A' || group.name() === 'B') {
            console.log(group.name(), counter.innerText);
        }
    };
    updateCounter();
    counter.addEventListener('click', () => {
        const list = window.queryBus.dispatch('getBusStopsByGroup', group.id())
            .map((busStop) => fromLonLat([busStop.lon(), busStop.lat()]));
        if (!list.length) {
            return;
        }
        window.commandBus.dispatch('fitMapView', boundingExtent(list));
    });
    createRemove(actions, group);
    return {
        item,
        updateCounter
    };
}

function createActions(item) {
    const actions = window.document.createElement('div');
    actions.classList.add('actions');
    item.appendChild(actions);
    return actions;
}

function createCounter(actions) {
    const counter = window.document.createElement('span');
    counter.title = 'Liczba przystanków w tej grupie';
    counter.classList.add('counter');
    actions.appendChild(counter);
    return counter;
}

function createRemove(actions, group) {
    const remove = window.document.createElement('span');
    remove.title = 'Usuń tą grupę przystankową';
    remove.classList.add('remove');
    remove.addEventListener('click', () => {
        window.commandBus.dispatch('removeBusStopGroup', {
            id: group.id(),
        });
    });
    actions.appendChild(remove);
    return remove;
}

export default class BusStopGroupSidebarSection
{
    constructor()
    {
        const byId = new Map();
        const actions = window.document.createElement('div');
        const list = window.document.createElement('ul');
        list.appendChild(createAddItem());

        const create = (group) => {
            const data = createItem(group);
            list.appendChild(data.item);
            byId.set(group.id(), data);
        };

        const remove = (id) => {
            if (byId.has(id)) {
                const data = byId.get(id);
                data.item.parentNode.removeChild(data.item);
                byId.delete(id);
            }
        };

        const update = (group) => {
            remove(group.id());
            create(group);
            updateCounter();
        };

        const sort = () => {
            [...list.children]
                .slice(1) //except create item
                .sort((item1, item2) => item1.title > item2.title ? 1 : -1)
                .forEach(item => list.appendChild(item));
        };

        const updateCounter = () => byId.forEach((data) => data.updateCounter());

        window.eventBus.subscribe('busStopGroupRemoved', remove);
        window.eventBus.subscribe('busStopGroupUpdated', (group) => [update(group), sort()]);
        window.eventBus.subscribe('busStopGroupsLoaded', (groups) => [groups.forEach(create), sort()]);
        window.eventBus.subscribe('busStopUpdated', updateCounter);
        window.eventBus.subscribe('busStopsLoaded', updateCounter);

        this.class = () => 'busStopGroupSection';
        this.title = () => 'Grupy przystankowe';
        this.icon = () => icon;
        this.get = () => [
            actions,
            list
        ];
    }
}






