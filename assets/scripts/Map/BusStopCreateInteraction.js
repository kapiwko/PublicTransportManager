import {Draw} from "ol/interaction";
import {Style} from "ol/style";
import {toLonLat} from "ol/proj";
import IconCreator from "./IconCreator";
import busIcon from "../../images/busStop.svg";
import BusStop from "../Model/BusStop";

export default class BusStopCreateInteraction
{
    constructor(source)
    {
        let enabled = false;
        const features = new Set();
        const interaction = new Draw({
            source: source,
            type: 'Point',
            style: new Style({
                image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#0b991e', 23).drawImage(busIcon).create(),
                zIndex: 4,
            })
        });

        interaction.on('drawend', (event) => {
            features.add(event.feature);
            event.feature.setStyle(new Style({
                image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#83bf84', 23).drawImage(busIcon).create(),
                zIndex: 4,
            }));
            window.eventBus.post('busStopCreate.event.countChanged', features.size);
        });

        const create = () => window.commandBus.dispatch('busStop.command.update', [...features].map((feature) => {
            const busStop = new BusStop(true, {
                group: null,
                location: toLonLat(feature.getGeometry().getCoordinates()),
            });
            feature.set('id', busStop.id());
            return busStop;
        }));

        const clear = () => {
            interaction.finishDrawing();
            interaction.removeLastPoint();
            features.forEach((feature) => source.removeFeature(feature));
            features.clear();
            window.eventBus.post('busStopCreate.event.countChanged', 0);
        };

        const keydown = (event) => {
            switch(event.key) {
                case "Escape":
                    clear();
                    break;
                case "Enter":
                    create();
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
            window.commandBus.dispatch('map.command.setCursor', 'crosshair');
            window.commandBus.dispatch('map.command.addInteraction', interaction);
        };

        this.disable = () => {
            if (!enabled) {
                return;
            }
            enabled = false;
            clear();
            window.document.removeEventListener('keydown', keydown);
            window.commandBus.dispatch('map.command.setCursor', '');
            window.commandBus.dispatch('map.command.removeInteraction', interaction);
        };
    }
}
