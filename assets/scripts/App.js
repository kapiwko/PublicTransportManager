/* global System,window */

import BusStopGroupRepository from "./Model/BusStopGroupRepository";
import BusStopRepository from "./Model/BusStopRepository";
import Map from "./Map/Map";
import Sidebar from "./Sidebar/Sidebar";
import BusStopGroupSidebarSection from "./Sidebar/BusStopGroupSidebarSection";
import BusStopLayer from "./Map/BusStopLayer";
import BusStopSidebarSection from "./Sidebar/BusStopSidebarSection";

export default class App {
    constructor() {
        new BusStopRepository();
        new BusStopGroupRepository();
    }

    run() {
        new Map('map');
        new Sidebar('sidebar');

        window.commandBus.dispatch('addSidebarSection', new BusStopSidebarSection());
        window.commandBus.dispatch('addSidebarSection', new BusStopGroupSidebarSection());
        window.commandBus.dispatch('addLayerToMap', new BusStopLayer().layer());
        window.commandBus.dispatch('loadAllBusStops');
        window.commandBus.dispatch('loadAllBusStopGroups');
    }
}
