import Data from "./Data";

export default class BusStopGroup extends Data
{
    constructor(id = null, data = null)
    {
        super('busStopGroup', id, data);
        const {
            name = null,
        } = {...data};
        this.name = () => name;
    }
}
