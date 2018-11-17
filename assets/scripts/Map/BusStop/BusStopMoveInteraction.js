import {Style} from "ol/style";
import {Modify} from "ol/interaction";
import {toLonLat} from "ol/proj";
import IconCreator from "../IconCreator";
import busIcon from "../../../images/busStop.svg";
import BusStop from "../../Model/BusStop";

const selectedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#bb68b2', 23).drawImage(busIcon).create(),
    zIndex: 6,
});

const highlightedStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#992f7f', 23).drawImage(busIcon).create(),
    zIndex: 7,
});

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

        const update = () => window.commandBus.dispatch('busStop.command.update', changed().map((feature) => {
            const busStop = window.queryBus.dispatch('busStop.query.get', feature.get('id'));
            return new BusStop(busStop.id(), {
                ...busStop.data(),
                location: toLonLat(feature.getGeometry().getCoordinates()),
            });
        }));

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