export default class BusStop
{
    constructor(data)
    {
        this.id = () => data.id;
        this.group = () => data.group;
        this.lon = () => data.location[0];
        this.lat = () => data.location[1];
        this.data = () => data;
    }
}
