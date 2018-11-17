import Fetch from "../Fetch";
import BusStop from "./BusStop";
import BusStopGroup from "./BusStopGroup";
import Connection from "./Connection";
import Data from "./Data";

export default class DataEngine {
    constructor()
    {
        const all = new Map();
        const changed = new Map();
        const syncing = new Map();

        const moveData = (from, to) => {
            [...from].map(([type, items]) => {
                if (!to.has(type)) {
                    to.set(type, new Map());
                }
                [...items].map(([id, data]) => to.get(type).set(id, data));
            });
            from.clear();
        };

        const add = (map, data) => {
            if (!map.has(data.type())) {
                map.set(data.type(), new Map());
            }
            map.get(data.type()).set(data.id(), data);
        };

        const create = (type, id, data = null) => {
            switch (type) {
                case 'busStop':
                    return new BusStop(id, data);
                case 'busStopGroup':
                    return new BusStopGroup(id, data);
                case 'connection':
                    return new Connection(id, data);
                default:
                    return new Data(type, id, data);
            }
        };

        const update = (data) => {
            add(all, data);
            add(changed, data);
            window.eventBus.post('dataEngine.event.updated', data);
        };

        const upload = () => {
            if (syncing.size || !changed.size) {
                return;
            }

            moveData(changed, syncing);
            uploading();

            const data = [...syncing].map(([type, items]) => ({
                type,
                items: [...items].map(([id, data]) => ({
                    id,
                    data: data.data(),
                })),
            }));

            Fetch.post('uploadData', data).then(() => {
                moveData(syncing, all);
                uploaded();
            });
        };

        const download = () => {
            downloading();

            Fetch.get('downloadData')
                .then((types) => types.map(({type, items = []}) => items.map(({id, data}) => add(all, create(type, id, data)))))
                .then(downloaded);
        };

        const get = ([type, id]) => all.has(type) && all.get(type).has(id) ? all.get(type).get(id) : null;
        const list = (type) => all.has(type) ? [...all.get(type).values()] : [];

        const downloading = () => window.eventBus.post('dataEngine.event.downloading');
        const downloaded = () => window.eventBus.post('dataEngine.event.downloaded');
        const uploading = () => window.eventBus.post('dataEngine.event.uploading');
        const uploaded = () => window.eventBus.post('dataEngine.event.uploaded');

        window.commandBus.register('dataEngine.command.update', update);
        window.commandBus.register('dataEngine.command.upload', upload);

        window.queryBus.register('dataEngine.query.get', get);
        window.queryBus.register('dataEngine.query.list', list);

        download();

        window.setInterval(upload, 5000);
    }
}