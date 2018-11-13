export default class ImageCreator {
    constructor(iconSize) {
        const canvas = window.document.createElement('canvas');
        canvas.setAttribute("width", iconSize);
        canvas.setAttribute("height", iconSize);
        const ctx = canvas.getContext("2d");

        this.drawCircle = (fill, circleSize) => {
            if (typeof circleSize === 'undefined') {
                circleSize = iconSize;
            }
            ctx.beginPath();
            ctx.arc(iconSize / 2, iconSize / 2, circleSize / 2, 0, 2 * Math.PI);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
            return this;
        };

        this.drawRectangle = (fill) => {
            ctx.beginPath();
            ctx.rect(0, 0, iconSize, iconSize);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
            return this;
        };

        this.drawImage = (src) => {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, iconSize, iconSize);
            img.src = src;
            return this;
        };

        this.canvas = () => canvas;
    }
}