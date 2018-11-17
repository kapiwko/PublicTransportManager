import {boundingExtent} from "ol/extent";
import {fromLonLat} from "ol/proj";
import icon from "../../images/busStopGroup.svg";
import BusStopGroup from "../Model/BusStopGroup";
import BusStop from "../Model/BusStop";

const listByGroup = (group) => window.queryBus.dispatch('busStop.query.list')
    .filter((busStop) => busStop.group() === group);

function createAddItem() {
    const item = window.document.createElement('li');
    item.classList.add('create');
    const name = window.document.createElement('span');
    name.contentEditable = "true";
    name.classList.add('name');
    const create = () => {
        if (name.innerText.length) {
            const group = new BusStopGroup(true, {
                name: name.innerText,
            });
            window.commandBus.dispatch('busStopGroup.command.update', [group]);
            window.queryBus.dispatch('busStopSelect.query.get').map((id) => {
                const busStop = window.queryBus.dispatch('busStop.query.get', id);
                window.commandBus.dispatch('busStop.command.update', [new BusStop(id, {
                    ...busStop.data(),
                    group: group.id(),
                })]);
            });
            name.innerText = '';
            window.commandBus.dispatch('busStopSelect.command.clear');
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
    window.eventBus.subscribe('busStopSelect.event.countChanged', (qty) => counter.innerText = qty);
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
                        window.commandBus.dispatch('busStopGroup.command.update', [new BusStopGroup(group.id(), {
                            ...group.data(),
                            name: name.innerText,
                        })]);
                    }
                }
            }
        };
        name.addEventListener('keydown', keydown);
    });
    item.appendChild(name);
    item.title = group.name();
    item.addEventListener('mouseenter', () => {
        const ids = listByGroup(group.id()).map((busStop) => busStop.id());
        window.commandBus.dispatch('map.command.setCursor', ids.length ? 'pointer' : '');
        window.commandBus.dispatch('busStopSelect.command.highlight', ids);
    });
    item.addEventListener('mouseleave', () => {
        window.commandBus.dispatch('busStopSelect.command.highlight', []);
    });
    const actions = createActions(item);
    const counter = createCounter(actions);
    const updateCounter = (qty) => counter.innerText = qty;
    counter.addEventListener('click', () => {
        const list = listByGroup(group.id()).map((busStop) => fromLonLat(busStop.location()));
        if (!list.length) {
            return;
        }
        window.commandBus.dispatch('map.command.fitView', boundingExtent(list));
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
        listByGroup(group.id()).map((busStop) => {
            window.commandBus.dispatch('busStop.command.update', [new BusStop(busStop.id(), {
                ...busStop.data(),
                group: null,
            })]);
        });
        window.commandBus.dispatch('busStopGroup.command.update', [new BusStopGroup(group.id(), null)]);
    });
    actions.appendChild(remove);
    return remove;
}

export default class BusStopGroupSidebarSection
{
    constructor()
    {
        const byId = new Map();
        const counts = new Map();

        const updateCounts = () => {
            counts.clear();
            counts.set(null, 0);
            window.queryBus.dispatch('busStopGroup.query.list').forEach((busStopGroup) => counts.set(busStopGroup.id(), 0));
            window.queryBus.dispatch('busStop.query.list')
                .forEach((busStop) => counts.set(busStop.group(), counts.get(busStop.group()) + 1));
        };

        const actions = window.document.createElement('div');
        const list = window.document.createElement('ul');
        list.appendChild(createAddItem());

        const create = (group) => {
            const data = createItem(group);
            list.appendChild(data.item);
            byId.set(group.id(), data);
        };

        const remove = (group) => {
            if (byId.has(group.id())) {
                const data = byId.get(group.id());
                data.item.parentNode.removeChild(data.item);
                byId.delete(group.id());
            }
        };

        const update = (group) => {
            remove(group);
            create(group);
        };

        const sort = () => {
            [...list.children]
                .slice(1) //except create item
                .sort((item1, item2) => item1.title > item2.title ? 1 : -1)
                .forEach(item => list.appendChild(item));
        };

        const updateCounter = () => {
            updateCounts();
            byId.forEach((data, id) => data.updateCounter(counts.get(id)));
        };

        const load = (busStopGroups) => {
            busStopGroups.forEach(create);
            updateCounter();
            sort();
        };

        window.eventBus.subscribe('busStopGroup.event.loaded', load);
        window.eventBus.subscribe('busStopGroup.event.updated', (busStopGroup) => {
            if (busStopGroup.data()) {
                if (byId.has(busStopGroup.id())) {
                    update(busStopGroup);
                } else {
                    create(busStopGroup);
                }
            } else {
                remove(busStopGroup);
            }
            updateCounter();
            sort();
        });
        window.eventBus.subscribe('busStop.event.updated', updateCounter);
        window.eventBus.subscribe('busStopSource.event.modeChanged', (currentMode) => this
            .target.classList.toggle('visible', currentMode === 'select'));

        this.setTarget = (target) => this.target = target;
        this.class = () => 'busStopGroupSection';
        this.title = () => 'Grupy przystankowe';
        this.icon = () => icon;
        this.get = () => [
            actions,
            list
        ];
    }
}






