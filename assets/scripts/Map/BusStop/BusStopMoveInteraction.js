import {Style} from "ol/style";
import {Modify} from "ol/interaction";
import {toLonLat} from "ol/proj";
import IconCreator from "../IconCreator";
import busIcon from "../../../images/busStop.svg";
import BusStop from "../../Model/BusStop";
import Connection from "../../Model/Connection";

const selectedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#bb68b2', 23).drawImage(busIcon).create(),
    zIndex: 6,
});

const highlightedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#992f7f', 23).drawImage(busIcon).create(),
    zIndex: 7,
});

const getByBusStop = (busStop) => window.queryBus.dispatch('connection.query.list')
    .filter((connection) => connection.from() === busStop || connection.to() === busStop);

export default class BusStopMoveInteraction
{
    constructor(source, features)
    {
        let enabled = false;
        const moveInteraction = new Modify({
            source,
            style: highlightedStyle,
        });

        moveInteraction.on('modifyend', () => {
            changed().forEach((feature) => features.get(feature.get('id')).setStyle(selectedStyle));
            window.eventBus.post('busStopMove.event.countChanged', changed().length);
        });

        const changed = () => source.getFeatures()
            .filter((feature) => {
                const initial = feature.get('coordinates');
                const current = feature.getGeometry().getCoordinates();
                return initial[0] !== current[0] || initial[1] !== current[1];
            });

        const clear = () => window.eventBus.post('busStopMove.event.countChanged', 0);

        const restore = () => changed().forEach((feature) => {
            changed().forEach((feature) => features.get(feature.get('id')).setStyle());
            feature.getGeometry().setCoordinates(feature.get('coordinates'));
        });

        const update = () => {
            window.commandBus.dispatch('busStop.command.update', changed().map((feature) => {
                const busStop = window.queryBus.dispatch('busStop.query.get', feature.get('id'));
                const location = toLonLat(feature.getGeometry().getCoordinates());
                window.commandBus.dispatch('connection.command.update', getByBusStop(busStop.id())
                    .map((connection) => {
                        const geometry = connection.geometry();
                        if (connection.from() === busStop.id()) {
                            geometry[0] = location;
                        }
                        if (connection.to() === busStop.id()) {
                            geometry[geometry.length - 1] = location;
                        }
                        return new Connection(connection.id(), {
                            ...connection.data(),
                            geometry,
                        })
                    }));
                return new BusStop(busStop.id(), {
                    ...busStop.data(),
                    location,
                });
            }));
        }

        window.eventBus.subscribe('map.event.featureHovered', (d) => {
            if (!enabled) {
                return;
            }
            if (d.feature) {
                window.commandBus.dispatch('map.command.setCursor', 'move');
                return;
            }
            window.commandBus.dispatch('map.command.setCursor', '');
        });

        const keydown = (event) => {
            switch(event.key) {
                case "Escape":
                    restore();
                    clear();
                    break;
                case "Enter":
                    update();
                    clear();
            }
        };

        this.enable = () => {
            if (enabled) {
                return;
            }
            enabled = true;
            clear();
            window.document.addEventListener('keydown', keydown);
            window.commandBus.dispatch('map.command.setCursor', '');
            window.commandBus.dispatch('map.command.addInteraction', moveInteraction);
        };

        this.disable = () => {
            if (!enabled) {
                return;
            }
            enabled = false;
            restore();
            clear();
            window.document.removeEventListener('keydown', keydown);
            window.commandBus.dispatch('map.command.setCursor', '');
            window.commandBus.dispatch('map.command.removeInteraction', moveInteraction);
        };
    }
}