/* global window */
import "@babel/polyfill";
import ready from './ready';
import App from './App';
import '../styles/main.scss';

import CommandBus from "./CommandBus";
import EventBus from "./EventBus";
import QueryBus from "./QueryBus";

window.commandBus = new CommandBus();
window.eventBus = new EventBus();
window.queryBus = new QueryBus();

const app = new App();
ready(() => app.run());
