import {Vector as VectorLayer} from "ol/layer";
import BusStopSource from "./BusStopSource";

export default class BusStopLayer
{
    constructor()
    {
        const busStopSource = new BusStopSource();
        const layer = new VectorLayer({
            source: busStopSource.getSource(),
        });

        this.layer = () => layer;


        window.eventBus.subscribe('busStopSourceLoaded', () => {
            window.commandBus.dispatch('fitMapView', layer.getSource().getExtent());
        });
    }
}