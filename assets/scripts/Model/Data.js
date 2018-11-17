import Uuid from "../Uuid";

export default class Data
{
    constructor(type, id, data = null)
    {
        if (id === true) {
            id = Uuid();
        }
        if (id === false) {
            id = null
        }
        this.type = () => type;
        this.id = () => id;
        this.data = () => data;
    }
}
