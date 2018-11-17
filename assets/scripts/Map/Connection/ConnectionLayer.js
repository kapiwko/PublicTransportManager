import {Vector as VectorLayer} from "ol/layer";
import ConnectionSource from "./ConnectionSource";

export default class ConnectionLayer
{
    constructor()
    {
        const source = new ConnectionSource();
        const layer = new VectorLayer({
            source: source.getSource(),
        });

        this.layer = () => layer;

        window.commandBus.register('connectionLayer.event.show', (s) => {
            layer.setVisible(s);
        });
    }
}