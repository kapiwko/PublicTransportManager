import Point from "ol/geom/Point";
import {fromLonLat} from "ol/proj";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import IconCreator from "./IconCreator";
import busIcon from "../../images/busStop.svg";

const type = 'busStop';

const normalStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#406abf', 23).drawImage(busIcon).create(),
    zIndex: 4,
});

const aloneStyle = new Style({
    image: (new IconCreator(24)).drawCircle('#ffffff').drawCircle('#787878', 23).drawImage(busIcon).create(),
    zIndex: 5,
});

export default class BusStopFeature
{
    constructor(busStop)
    {
        const coordinates = fromLonLat([busStop.lon(), busStop.lat()]);
        const geometry = new Point(coordinates);
        const feature = new Feature({
            coordinates,
            geometry,
            type,
            feature: this,
            id: busStop.id(),
        });

        this.setStyle = (style) => {
            if (style) {
                return feature.setStyle(style);
            }
            if (busStop.group()) {
                return feature.setStyle(normalStyle);
            }
            feature.setStyle(aloneStyle);
        };

        this.setStyle();

        this.feature = () => feature;
        this.coordinates = () => coordinates;
    }
}
