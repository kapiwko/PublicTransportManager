export default class BusStopCollection {
    constructor()
    {
        const items = new Map();

        this.add = (item) => items.set(item.id(), item);
        this.remove = (id) => items.has(id) ? items.delete(id) : null;
        this.all = () => [...items.values];
        this.get = (id) => items.has(id) ? items.get(id) : null;
    }
}