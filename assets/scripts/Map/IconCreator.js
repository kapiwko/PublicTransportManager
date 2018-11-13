import ImageCreator from "../Helper/ImageCreator";
import Icon from "ol/style/Icon";

export default class IconCreator {
    constructor(size) {
        const imageCreator = new ImageCreator(size);

        this.drawCircle = (fill, size) => {
            imageCreator.drawCircle(fill, size);
            return this;
        };

        this.drawRectangle = (fill) => {
            imageCreator.drawRectangle(fill);
            return this;
        };

        this.drawImage = (src) => {
            imageCreator.drawImage(src);
            return this;
        };

        this.create = () => {
            return new Icon({
                anchor: [size / 2, size / 2],
                anchorXUnits: 'pixel',
                anchorYUnits: 'pixel',
                img: imageCreator.canvas(),
                size : [size, size],
                imgSize : [size, size]
            })
        };
    }
}