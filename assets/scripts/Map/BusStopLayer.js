import {Vector as VectorLayer} from "ol/layer";
import BusStopSource from "./BusStopSource";

export default class BusStopLayer
{
    constructor()
    {
        const source = new BusStopSource();
        const layer = new VectorLayer({
            source: source.getSource(),
        });

        this.layer = () => layer;

        window.eventBus.subscribe('busStopSource.event.loaded', () => {
            window.commandBus.dispatch('map.command.fitView', layer.getSource().getExtent());
        });
    }
}