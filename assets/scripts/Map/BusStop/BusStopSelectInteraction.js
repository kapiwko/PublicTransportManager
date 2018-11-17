import {DragBox, Select} from "ol/interaction";
import {click, never, pointerMove, platformModifierKeyOnly} from "ol/events/condition";
import {Style} from "ol/style";
import IconCreator from "../IconCreator";
import busIcon from "../../../images/busStop.svg";

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
            if (!features.has(id)) {
                return;
            }
            const feature = features.get(id);
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
            window.eventBus.post('busStopSelect.event.countChanged', selected.size);
        };

        const clear = () => {
            dragging = false;
            updateCollection(highlighted, []);
            updateCollection(selected, []);
            clickInteraction.getFeatures().clear();
            hoverInteraction.getFeatures().clear();
            window.eventBus.post('busStopSelect.event.countChanged', selected.size);
        };

        clickInteraction.on('select', (event) => {
            const ids = event.target.getFeatures().getArray()
                .filter((feature) => source.hasFeature(feature))
                .map((feature) => feature.get('id'));
            updateCollection(selected, ids);
            window.eventBus.post('busStopSelect.event.countChanged', selected.size);
        });

        hoverInteraction.on('select', (event) => {
            const ids = event.target.getFeatures().getArray()
                .filter((feature) => source.hasFeature(feature))
                .map((feature) => feature.get('id'));
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
            window.eventBus.post('busStopSelect.event.countChanged', selected.size);
        });

        window.queryBus.register('busStopSelect.query.get', () => [...selected]);
        window.commandBus.register('busStopSelect.command.clear', clear);
        window.commandBus.register('busStopSelect.command.highlight', (ids) => updateCollection(highlighted, ids));

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
