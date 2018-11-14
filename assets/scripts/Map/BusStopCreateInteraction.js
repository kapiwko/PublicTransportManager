import {Draw} from "ol/interaction";
import {Style} from "ol/style";
import {toLonLat} from "ol/proj";
import IconCreator from "./IconCreator";
import busIcon from "../../images/busStop.svg";

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
            window.eventBus.post('busStopCreateCountChanged', features.size);
        });

        const create = () => {
            window.commandBus.dispatch('createBusStops', [...features]
                .map((feature) => ({
                    location: toLonLat(feature.getGeometry().getCoordinates()),
                })
            ));
        };

        const clear = () => {
            interaction.finishDrawing();
            interaction.removeLastPoint();
            features.forEach((feature) => source.removeFeature(feature));
            features.clear();
            window.eventBus.post('busStopCreateCountChanged', 0);
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
            window.commandBus.dispatch('setMapCursor', 'crosshair');
            window.commandBus.dispatch('addInteractionToMap', interaction);
        };

        this.disable = () => {
            if (!enabled) {
                return;
            }
            enabled = false;
            clear();
            window.document.removeEventListener('keydown', keydown);
            window.commandBus.dispatch('setMapCursor', '');
            window.commandBus.dispatch('removeInteractionFromMap', interaction);
        };
    }
}
