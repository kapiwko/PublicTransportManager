import {DragBox, Select} from "ol/interaction";
import {click, never, pointerMove, platformModifierKeyOnly} from "ol/events/condition";
import {Style} from "ol/style";
import IconCreator from "./IconCreator";
import busIcon from "../../images/busStop.svg";
import BusStop from "../Model/BusStop";
import {toLonLat} from "ol/proj";

const selectedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#c55453', 23).drawImage(busIcon).create(),
    zIndex: 6,
});

const highlightedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#991f19', 23).drawImage(busIcon).create(),
    zIndex: 7,
});

export default class BusStopRemoveInteraction
{
    constructor(source, features)
    {
        let enabled = false;
        let dragging = false;
        const highlighted = new Set();
        const selected = new Set();

        const clickInteraction = new Select({
            condition: click,
            source: source,
        });

        const hoverInteraction = new Select({
            condition: (e) => pointerMove(e) && !dragging,
            toggleCondition: never,
            source: source,
        });

        const dragInteraction = new DragBox({
            condition: platformModifierKeyOnly,
            source: source,
        });

        const setStyle = (id) => {
            const feature = features.get(id);
            if (!feature) {
                return;
            }
            if (highlighted.has(id)) {
                return feature.setStyle(highlightedStyle);
            }
            if (selected.has(id)) {
                return feature.setStyle(selectedStyle);
            }
            feature.setStyle();
        };

        const updateCollection = (collection, ids, onlyAdd) => {
            if (!onlyAdd) {
                collection.forEach((id) => {
                    if (!ids.includes(id)) {
                        collection.delete(id);
                        setStyle(id);
                    }
                });
            }
            ids.forEach((id) => {
                if (!collection.has(id)) {
                    collection.add(id);
                    setStyle(id);
                }
            });
        };

        const init = () => {
            clickInteraction.getFeatures().clear();
            hoverInteraction.getFeatures().clear();
            window.eventBus.post('busStopRemove.event.countChanged', 0);
        };

        const clear = () => {
            dragging = false;
            updateCollection(highlighted, []);
            updateCollection(selected, []);
            clickInteraction.getFeatures().clear();
            hoverInteraction.getFeatures().clear();
            window.eventBus.post('busStopRemove.event.countChanged', 0);
        };

        clickInteraction.on('select', (event) => {
            const ids = event.target.getFeatures().getArray().map((feature) => feature.get('id'));
            updateCollection(selected, ids);
            window.eventBus.post('busStopRemove.event.countChanged', selected.size);
        });

        hoverInteraction.on('select', (event) => {
            const ids = event.target.getFeatures().getArray().map((feature) => feature.get('id'));
            updateCollection(highlighted, ids);
            window.commandBus.dispatch('map.command.setCursor', ids.length ? 'pointer' : '');
        });

        dragInteraction.on('boxstart', () => {
            dragging = true;
        });

        dragInteraction.on('boxend', (event) => {
            dragging = false;
            const extent = event.target.getGeometry().getExtent();
            const features = source.getFeaturesInExtent(extent);
            const ids = features.map((feature) => feature.get('id'));
            updateCollection(selected, ids, true);
            window.eventBus.post('busStopRemove.event.countChanged', selected.size);
        });

        const update = () => window.commandBus.dispatch('busStop.command.update', changed().map((feature) => {
            const busStop = window.queryBus.dispatch('busStop.query.get', feature.get('id'));
            return new BusStop(busStop.id(), {
                ...busStop.data(),
                location: toLonLat(feature.getGeometry().getCoordinates()),
            });
        }));

        const remove = () => window.commandBus.dispatch('busStop.command.update', [...selected].map((id) => {
            return new BusStop(id, null);
        }));

        const keydown = (event) => {
            switch(event.key) {
                case "Escape":
                    clear();
                    break;
                case "Enter":
                    remove();
                    clear();
            }
        };

        this.enable = () => {
            if (enabled) {
                return;
            }
            enabled = true;
            init();
            window.document.addEventListener('keydown', keydown);
            window.commandBus.dispatch('map.command.setCursor', '');
            window.commandBus.dispatch('map.command.addInteraction', clickInteraction);
            window.commandBus.dispatch('map.command.addInteraction', hoverInteraction);
            window.commandBus.dispatch('map.command.addInteraction', dragInteraction);
        };

        this.disable = () => {
            if (!enabled) {
                return;
            }
            enabled = false;
            clear();
            window.document.removeEventListener('keydown', keydown);
            window.commandBus.dispatch('map.command.setCursor', '');
            window.commandBus.dispatch('map.command.removeInteraction', clickInteraction);
            window.commandBus.dispatch('map.command.removeInteraction', hoverInteraction);
            window.commandBus.dispatch('map.command.removeInteraction', dragInteraction);
        };
    }
}
