export default class BusStopGroup
{
    constructor(data)
    {
        this.id = () => data.id;
        this.name = () => data.name;
        this.data = () => data;
    }
}
