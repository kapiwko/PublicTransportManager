import Data from "./Data";

export default class BusStop extends Data
{
    constructor(id = null, data = null)
    {
        super('busStop', id, data);
        const {
            group = null,
            location = null,
        } = {...data};
        this.group = () => group;
        this.location = () => location;
    }
}
