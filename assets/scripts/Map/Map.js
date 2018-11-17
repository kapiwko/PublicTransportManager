import OlMap from "ol/Map";
import View from "ol/View";
import {defaults} from "ol/interaction";
import {fromLonLat} from "ol/proj";
import {Tile as TileLayer} from "ol/layer";
import OSM from "ol/source/OSM";

export default class Map
{
    constructor(id)
    {
        const target = window.document.getElementById(id);
        const map = new OlMap({
            target,
            renderer: ['webgl', 'canvas'],
            interactions: defaults({
                doubleClickZoom: false,
                dragAndDrop: false,
                keyboardPan: true,
                keyboardZoom: true,
                mouseWheelZoom: true,
                pointer: false,
                select: false,
            }),
            view: new View({
                center: fromLonLat([20.6243, 50.8773]),
                zoom: 13,
                minZoom: 10,
                maxZoom: 19,
            }),
        });

        map.addLayer(new TileLayer({
            source: new OSM(),
        }));

        let wasFeatureAtPixelWhenMove = false;
        map.on('pointermove', (event) => {
            if (event.dragging) {
                return;
            }
            if (map.hasFeatureAtPixel(event.pixel)) {
                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    window.eventBus.post('map.event.featureHovered', {
                        feature,
                        event,
                    });
                    return true;
                });
            } else {
                window.eventBus.post('map.event.featureHovered', {
                    feature: null,
                    event,
                });
            }
        });

        map.on('click', (event) => {
            if (map.hasFeatureAtPixel(event.pixel)) {
                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    window.eventBus.post('map.event.featureClicked', {
                        feature,
                        event,
                    });
                    return true;
                });
            } else {
                window.eventBus.post('map.event.featureClicked', {
                    feature: null,
                    event,
                });
            }
        });

        const addLayer = (layer) => {
            map.addLayer(layer)
        };
        window.commandBus.register('map.command.addLayer', addLayer);

        const fitView = (extent) => {
            map.getView().fit(extent);
        };
        window.commandBus.register('map.command.fitView', fitView);

        const addInteraction = (interaction) => {
            map.addInteraction(interaction);
        };
        window.commandBus.register('map.command.addInteraction', addInteraction);

        const removeInteraction = (interaction) => {
            map.removeInteraction(interaction);
        };
        window.commandBus.register('map.command.removeInteraction', removeInteraction);

        const setCursor = (cursor) => {
            target.style.cursor = cursor;
        };
        window.commandBus.register('map.command.setCursor', setCursor);

        const setLoading = (s) => {
            target.classList.toggle('loading', s);
        };
        window.commandBus.register('map.command.setLoading', setLoading);
    }
}
