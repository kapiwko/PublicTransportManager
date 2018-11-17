import Data from "./Data";

export default class Connection extends Data
{
    constructor(id = null, data = null)
    {
        super('connection', id, data);
        const {
            from = null,
            to = null,
            geometry = []
        } = {...data};
        this.from = () => from;
        this.to = () => to;
        this.geometry = () => geometry;
    }
}
