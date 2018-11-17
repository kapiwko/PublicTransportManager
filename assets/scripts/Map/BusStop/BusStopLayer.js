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

        window.commandBus.register('busStopLayer.event.show', (s) => {
            layer.setVisible(s);
        });

        window.eventBus.subscribe('busStopSource.event.loaded', () => {
            window.commandBus.dispatch('map.command.fitView', layer.getSource().getExtent());
        });
    }
}