/* global System,window */

import Map from "./Map/Map";
import Sidebar from "./Sidebar/Sidebar";
import DataEngine from "./Model/DataEngine";
import BusStopRepository from "./Model/BusStopRepository";
import BusStopGroupRepository from "./Model/BusStopGroupRepository";
import ConnectionRepository from "./Model/ConnectionRepository";
import BusStopLayer from "./Map/BusStop/BusStopLayer";
import ConnectionLayer from "./Map/Connection/ConnectionLayer";
import BusStopSidebarSection from "./Sidebar/BusStopSidebarSection";
import BusStopGroupSidebarSection from "./Sidebar/BusStopGroupSidebarSection";


export default class App {
    constructor() {
        new DataEngine();
        new BusStopRepository();
        new BusStopGroupRepository();
        new ConnectionRepository();
    }

    run() {
        new Sidebar('sidebar');
        new Map('map');

        window.commandBus.dispatch('sidebar.command.addSection', new BusStopSidebarSection());
        window.commandBus.dispatch('sidebar.command.addSection', new BusStopGroupSidebarSection());
        window.commandBus.dispatch('map.command.addLayer', new ConnectionLayer().layer());
        window.commandBus.dispatch('map.command.addLayer', new BusStopLayer().layer());
    }
}
