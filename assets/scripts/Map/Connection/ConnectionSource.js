import VectorSource from "ol/source/Vector";
import {Stroke, Style} from "ol/style"
import ConnectionFeature from "./ConnectionFeature";

const highlightedStyle = new Style({
    stroke: new Stroke({
        color: '#ff55fd',
        width: 3
    })
});

const selectedStyle = new Style({
    stroke: new Stroke({
        color: '#4c53ff',
        width: 6
    })
});

export default class BusStopSource
{
    constructor()
    {
        const features = new Map();
        const source = new VectorSource({});
        const highlighted = new Set();
        const selected = new Set();

        const create = (connection) => {
            const feature = new ConnectionFeature(connection);
            features.set(connection.id(), feature);
            source.addFeature(feature.feature());
        };

        const remove = (id) => {
            if (features.has(id)) {
                const feature = features.get(id);
                source.removeFeature(feature.feature());
                features.delete(id);
            }
        };

        const load = (connections) => {
            connections.map(create);
            window.eventBus.post('connectionSource.event.loaded');
        };

        window.eventBus.subscribe('connection.event.loaded', load);
        window.eventBus.subscribe('connection.event.updated', (connection) => {
            remove(connection.id());
            if (connection.data()) {
                create(connection);
            }
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

        window.commandBus.register('connectionSource.command.highlight', (ids) => {
            updateCollection(highlighted, ids)
        });

        this.getSource = () => source;
    }
}
