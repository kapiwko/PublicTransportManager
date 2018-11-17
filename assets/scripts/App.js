/* global System,window */

import Map from "./Map/Map";
import Sidebar from "./Sidebar/Sidebar";
import BusStopGroupSidebarSection from "./Sidebar/BusStopGroupSidebarSection";
import BusStopLayer from "./Map/BusStopLayer";
import BusStopSidebarSection from "./Sidebar/BusStopSidebarSection";
import DataEngine from "./Model/DataEngine";
import BusStopGroupRepository from "./Model/BusStopGroupRepository";
import BusStopRepository from "./Model/BusStopRepository";

export default class App {
    constructor() {
        new DataEngine();
        new BusStopRepository();
        new BusStopGroupRepository();
    }

    run() {
        new Map('map');
        new Sidebar('sidebar');

        window.commandBus.dispatch('sidebar.command.addSection', new BusStopSidebarSection());
        window.commandBus.dispatch('sidebar.command.addSection', new BusStopGroupSidebarSection());
        window.commandBus.dispatch('map.command.addLayer', new BusStopLayer().layer());
    }
}
