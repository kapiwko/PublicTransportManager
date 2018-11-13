import {DragBox, Select} from "ol/interaction";
import {click, never, pointerMove, platformModifierKeyOnly} from "ol/events/condition";
import {Style} from "ol/style";
import IconCreator from "./IconCreator";
import busIcon from "../../images/busStop.svg";

const selectedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#ffbf58', 23).drawImage(busIcon).create(),
    zIndex: 6,
});

const highlightedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#ffb510', 23).drawImage(busIcon).create(),
    zIndex: 7,
});

export default class BusStopSelectInteraction
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
            if (highlighted.has(id)) {
                return features.get(id).setStyle(highlightedStyle);
            }
            if (selected.has(id)) {
                return features.get(id).setStyle(selectedStyle);
            }
            features.get(id).setStyle();
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
            window.eventBus.post('busStopSelectCountChanged', selected.size);
        };

        const clear = () => {
            dragging = false;
            updateCollection(highlighted, []);
            updateCollection(selected, []);
            clickInteraction.getFeatures().clear();
            hoverInteraction.getFeatures().clear();
            window.eventBus.post('busStopSelectCountChanged', selected.size);
        };

        clickInteraction.on('select', (event) => {
            const ids = event.target.getFeatures().getArray().map((feature) => feature.get('id'));
            updateCollection(selected, ids);
            window.eventBus.post('busStopSelectCountChanged', selected.size);
        });

        hoverInteraction.on('select', (event) => {
            const ids = event.target.getFeatures().getArray().map((feature) => feature.get('id'));
            updateCollection(highlighted, ids);
            window.commandBus.dispatch('setMapCursor', ids.length ? 'pointer' : '');
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
            window.eventBus.post('busStopSelectCountChanged', selected.size);
        });

        window.queryBus.register('getSelectedBusStops', () => Array.from(selected));
        window.commandBus.register('clearSelectedBusStops', clear);

        const keydown = (event) => {
            switch(event.key) {
                case "Escape":
                    clear();
                    break;
            }
        };

        this.enable = () => {
            if (enabled) {
                return;
            }
            enabled = true;
            init();
            window.document.addEventListener('keydown', keydown);
            window.commandBus.dispatch('setMapCursor', '');
            window.commandBus.dispatch('addInteractionToMap', clickInteraction);
            window.commandBus.dispatch('addInteractionToMap', hoverInteraction);
            window.commandBus.dispatch('addInteractionToMap', dragInteraction);
        };

        this.disable = () => {
            if (!enabled) {
                return;
            }
            enabled = false;
            clear();
            window.document.removeEventListener('keydown', keydown);
            window.commandBus.dispatch('setMapCursor', '');
            window.commandBus.dispatch('removeInteractionFromMap', clickInteraction);
            window.commandBus.dispatch('removeInteractionFromMap', hoverInteraction);
            window.commandBus.dispatch('removeInteractionFromMap', dragInteraction);
        };
    }
}
