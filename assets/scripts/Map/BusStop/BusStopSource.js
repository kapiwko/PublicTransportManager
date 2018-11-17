import VectorSource from "ol/source/Vector";
import BusStopFeature from "./BusStopFeature";
import BusStopSelectInteraction from "./BusStopSelectInteraction";
import BusStopCreateInteraction from "./BusStopCreateInteraction";
import BusStopMoveInteraction from "./BusStopMoveInteraction";
import BusStopRemoveInteraction from "./BusStopRemoveInteraction";
import BusStopConnectInteraction from "./BusStopConnectInteraction";

export default class BusStopSource
{
    constructor()
    {
        const features = new Map();
        const interactions = new Map();
        const source = new VectorSource({});

        const setMode = (mode) => {
            interactions.forEach((i) => i.disable());
            if (mode) {
                interactions.get(mode).enable();
            }
            window.eventBus.post('busStopLayer.command.show', mode);
            window.eventBus.post('busStopSource.event.modeChanged', mode);
        };

        const create = (busStop) => {
            const feature = new BusStopFeature(busStop);
            features.set(busStop.id(), feature);
            source.addFeature(feature.feature());
        };

        const remove = (id) => {
            if (features.has(id)) {
                const feature = features.get(id);
                source.removeFeature(feature.feature());
                features.delete(id);
            }
        };

        const load = (busStops) => {
            busStops.map(create);
            interactions.set('select', new BusStopSelectInteraction(source, features));
            interactions.set('create', new BusStopCreateInteraction(source, features));
            interactions.set('move', new BusStopMoveInteraction(source, features));
            interactions.set('remove', new BusStopRemoveInteraction(source, features));
            interactions.set('connect', new BusStopConnectInteraction(source, features));
            setMode('select');
            window.eventBus.post('busStopSource.event.loaded');
        };

        window.eventBus.subscribe('busStop.event.loaded', load);
        window.eventBus.subscribe('busStop.event.updated', (busStop) => {
            remove(busStop.id());
            if (busStop.data()) {
                create(busStop);
            }
        });

        window.commandBus.register('busStopSource.command.setMode', setMode);

        this.getSource = () => source;
    }
}
