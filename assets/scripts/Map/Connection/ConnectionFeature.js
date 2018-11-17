import {LineString} from "ol/geom";
import {fromLonLat} from "ol/proj";
import Feature from "ol/Feature";
import {Stroke, Style} from "ol/style";

const normalStyle = new Style({
    stroke: new Stroke({
        color: '#17e9ff',
        width: 1
    })
});

export default class ConnectionFeature
{
    constructor(connection)
    {
        const coordinates = connection.geometry().map((location) => fromLonLat(location));
        const feature = new Feature({
            coordinates,
            geometry: new LineString(coordinates),
            type: 'connection',
            feature: this,
            id: connection.id(),
        });

        this.setStyle = (style) => {
            if (style) {
                return feature.setStyle(style);
            }
            feature.setStyle(normalStyle);
        };

        this.setStyle();

        this.feature = () => feature;
        this.coordinates = () => coordinates;
    }
}
