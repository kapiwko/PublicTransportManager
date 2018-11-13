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
                wasFeatureAtPixelWhenMove = true;
                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    window.eventBus.post('mapFeatureHovered', {
                        feature,
                        event,
                    });
                    return true;
                });
            } else if(wasFeatureAtPixelWhenMove) {
                window.eventBus.post('mapFeatureHovered', {
                    feature: null,
                    event,
                });
                wasFeatureAtPixelWhenMove = false;
            }
        });

        let wasFeatureAtPixelWhenClick = false;
        map.on('click', (event) => {
            if (map.hasFeatureAtPixel(event.pixel)) {
                wasFeatureAtPixelWhenClick = true;
                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    window.eventBus.post('mapFeatureClicked', {
                        feature,
                        event,
                    });
                    return true;
                });
            } else if(wasFeatureAtPixelWhenClick) {
                wasFeatureAtPixelWhenClick = false;
                window.eventBus.post('mapFeatureClicked', {
                    feature: null,
                    event,
                });
            }
        });

        const addLayer = (layer) => {
            map.addLayer(layer)
        };
        window.commandBus.register('addLayerToMap', addLayer);

        const fitView = (extent) => {
            map.getView().fit(extent);
        };
        window.commandBus.register('fitMapView', fitView);

        const addInteraction = (interaction) => {
            map.addInteraction(interaction);
        };
        window.commandBus.register('addInteractionToMap', addInteraction);

        const removeInteraction = (interaction) => {
            map.removeInteraction(interaction);
        };
        window.commandBus.register('removeInteractionFromMap', removeInteraction);

        const setCursor = (cursor) => {
            target.style.cursor = cursor;
        };
        window.commandBus.register('setMapCursor', setCursor);
    }
}
