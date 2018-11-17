import {Stroke, Style} from "ol/style";
import {toLonLat} from "ol/proj";
import {LineString} from "ol/geom";
import IconCreator from "../IconCreator";
import busIcon from "../../../images/busStop.svg";
import Feature from "ol/Feature";
import Connection from "../../Model/Connection";

const selectedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#ca11c5', 23).drawImage(busIcon).create(),
    zIndex: 6,
});

const highlightedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#ff55fd', 23).drawImage(busIcon).create(),
    zIndex: 7,
});

const connectionStyle = new Style({
    stroke: new Stroke({
        color: '#2bff19',
        width: 3
    })
});

const connectedStyle = new Style({
    stroke: new Stroke({
        color: '#92ffa5',
        width: 3
    })
});

const removedStyle = new Style({
    stroke: new Stroke({
        color: '#ff2e49',
        width: 3
    })
});

const listConnectionsFrom = (busStop) => window.queryBus.dispatch('connection.query.list')
    .filter((connection) => connection.from() && connection.from() === busStop);

const highlightConnections = (connections) => window.commandBus
    .dispatch('connectionSource.command.highlight', connections.map((connection) => connection.id()));

const getByBusStops = (from, to) => window.queryBus.dispatch('connection.query.list')
    .filter((connection) => connection.from() === from && connection.to() === to)[0];

export default class BusStopConnectInteraction
{
    constructor(source, features)
    {
        let enabled = false;
        let fromFeature = null;
        let toFeature = null;
        let currentFeature = null;
        let lastHoveredFeature = null;
        const points = new Set();
        const connected = new Map();

        window.eventBus.subscribe('map.event.featureHovered', ({feature, event}) => {
            if (!enabled) {
                return;
            }
            const remove = event.originalEvent.ctrlKey;
            if (lastHoveredFeature) {
                if (fromFeature !== lastHoveredFeature) {
                    features.get(lastHoveredFeature.get('id')).setStyle();
                    lastHoveredFeature = null;
                }
                highlightConnectionsFrom(fromFeature ? fromFeature.get('id') : null, true);
                window.commandBus.dispatch('map.command.setCursor', '');
            }
            if (feature && source.hasFeature(feature) && feature.get('id')) {
                const id = feature.get('id');
                if (!fromFeature) {
                    highlightConnectionsFrom(id, true);
                } else {
                    const connection = getByBusStops(fromFeature.get('id'), id);
                    highlightConnections(connection ? [connection] : []);
                }
                if (fromFeature !== feature) {
                    lastHoveredFeature = feature;
                    features.get(id).setStyle(highlightedStyle);
                }
                window.commandBus.dispatch('map.command.setCursor', 'pointer');
            } else if (fromFeature) {
                window.commandBus.dispatch('map.command.setCursor', remove ? '' : 'crosshair');
            }
        });

        window.eventBus.subscribe('map.event.featureClicked', ({feature, event}) => {
            if (!enabled) {
                return;
            }
            const remove = event.originalEvent.ctrlKey;
            if (feature && source.hasFeature(feature) && feature.get('id')) {
                const id = feature.get('id');
                drawLine(feature.getGeometry().getCoordinates());
                if (!fromFeature) {
                    fromFeature = feature;
                    features.get(id).setStyle(selectedStyle);
                    highlightConnectionsFrom(id);
                } else if (feature !== fromFeature) {
                    toFeature = feature;
                    features.get(id).setStyle(selectedStyle);
                    connect(remove);
                }
            } else if (fromFeature && !remove) {
                drawLine(event.coordinate);
                points.add(toLonLat(event.coordinate));
            }
        });

        const highlightBusStops = function (busStops) {
            features.forEach((feature) => feature.setStyle());
            busStops.map((id) => features.get(id).setStyle(highlightedStyle));
        };

        const highlightConnectionsFrom = (busStop, ends) => {
            const connections = listConnectionsFrom(busStop);
            highlightBusStops(ends ? connections.map((connection) => connection.to()) : []);
            highlightConnections(connections);
        };

        const drawLine = (coord) => {
            if (!currentFeature) {
                currentFeature = new Feature({
                    geometry: new LineString([coord]),
                });
                source.addFeature(currentFeature);
                currentFeature.setStyle(connectionStyle);
            } else {
                currentFeature.getGeometry().appendCoordinate(coord);
            }
        };

        const connect = (remove) => {
            const from = fromFeature.get('id');
            const to = toFeature.get('id');
            const connection = getByBusStops(from, to);
            if (connected.has(from + to)) {
                source.removeFeature(connected.get(from + to).feature);
            }
            connected.set(from + to, {
                id: connection ? connection.id() : true,
                remove,
                from,
                to,
                points: [...points.values()],
                feature: currentFeature,
            });
            features.get(from).setStyle();
            fromFeature = null;
            features.get(to).setStyle();
            toFeature = null;
            points.clear();
            lastHoveredFeature = null;
            currentFeature.setStyle(remove ? removedStyle : connectedStyle);
            currentFeature = false;
        };

        const clear = () => {
            highlightConnectionsFrom(null, true);
            window.commandBus.dispatch('map.command.setCursor', '');
            lastHoveredFeature = null;
            if (currentFeature) {
                source.removeFeature(currentFeature)
            }
            currentFeature = null;
            if (fromFeature) {
                features.get(fromFeature.get('id')).setStyle();
            }
            fromFeature = null;
            if (toFeature) {
                features.get(toFeature.get('id')).setStyle();
            }
            toFeature = null;
            points.clear();
            [...connected.values()].map(({feature}) => source.removeFeature(feature));
            connected.clear();
        };

        const save = () => window.commandBus.dispatch('connection.command.update', [...connected.values()]
            .map(({id, remove, from, to, points}) => new Connection(id, remove ? null : {
                from,
                to,
                geometry: Array.prototype.concat(
                    [window.queryBus.dispatch('busStop.query.get', from).location()],
                    points,
                    [window.queryBus.dispatch('busStop.query.get', to).location()]
                ),
            })));

        const keydown = (event) => {
            switch(event.key) {
                case "Escape":
                    clear();
                    break;
                case "Enter":
                    save();
                    clear();
            }
        };

        this.enable = () => {
            if (enabled) {
                return;
            }
            enabled = true;
            window.document.addEventListener('keydown', keydown);
            window.commandBus.dispatch('map.command.setCursor', '');
        };

        this.disable = () => {
            if (!enabled) {
                return;
            }
            enabled = false;
            clear();
            window.document.removeEventListener('keydown', keydown);
            window.commandBus.dispatch('map.command.setCursor', '');
        };
    }
}
