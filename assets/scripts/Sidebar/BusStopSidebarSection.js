import icon from "../../images/busStop.svg";

function createButton(actions, className, title) {
    const button = window.document.createElement('span');
    button.title = title;
    button.classList.add(className);
    actions.appendChild(button);
    return button;
}

function createStatus(actions) {
    const status = window.document.createElement('div');
    status.classList.add('status');
    actions.appendChild(status);
    return status;
}

export default class BusStopSidebarSection
{
    constructor()
    {
        const header = window.document.createElement('header');
        const main = window.document.createElement('main');

        const modes = new Map();

        const createMode = (name, title, description) => {
            const button = createButton(header, name, title);
            button.addEventListener('click', () => window.commandBus.dispatch('busStopSource.command.setMode', name));
            modes.set(name, {
                button,
                description
            });
        };

        createMode('select', 'Tryb zaznaczania', '' +
            'Aby zaznaczyć przystanek kliknij na jego symbol na mapie. ' +
            'Przystrzymaj Shift podczas klikania aby zaznaczyć kilka. ' +
            'Wciśnij Esc aby anulować zaznaczenie.' +
            '');
        createMode('create', 'Tryb dodawania', '' +
            'Aby utworzyć nowy przystanek kliknij gdziekolwiek na mapie. ' +
            'Wciśnij Enter aby zatwierdzić utworzenie lub Esc aby anulować.' +
            '');
        createMode('move', 'Tryb przesuwania', '' +
            'Aby przesunąć przystanek kliknij na jego symbol na mapie i ' +
            'przesuwaj go trzymająć wciśnięty przycisk myszy. ' +
            'Wciśnij Enter aby zatwierdzić przesunięcie lub Esc aby anulować.' +
            '');
        createMode('remove', 'Tryb usuwania', '' +
            'Aby zaznaczyć przystanek do usunięcia kliknij na jego symbol na mapie. ' +
            'Przystrzymaj Shift podczas klikania aby zaznaczyć kilka. ' +
            'Wciśnij Enter aby zatwierdzić usunięcie lub Esc aby anulować.' +
            '');
        createMode('connect', 'Tryb łączenia', '' +
            'Rozpocznij rysowanie połączenia klikając na symbol przystanku początkowego, ' +
            'zakończ rysowanie klikając na symbmol przystanku końcowego. ' +
            'Aby usunąć dane połącznie podczas klikania przystanku końcowego przytrzymaj Ctrl. ' +
            'Wciśnij Enter aby zatwierdzić utworzone połączenia lub Esc aby anulować.' +
            '');

        const status = createStatus(header);

        window.eventBus.subscribe('busStopSelect.event.countChanged', (qty) => status.innerText = 'Zaznaczono: ' + qty);
        window.eventBus.subscribe('busStopCreate.event.countChanged', (qty) => status.innerText = 'Do utworzenia: ' + qty);
        window.eventBus.subscribe('busStopRemove.event.countChanged', (qty) => status.innerText = 'Do usunięcia: ' + qty);
        window.eventBus.subscribe('busStopMove.event.countChanged', (qty) => status.innerText = 'Do przesunięcia: ' + qty);
        window.eventBus.subscribe('busStopSource.event.modeChanged', (currentMode) => {
            this.target.classList.toggle('visible', currentMode);
            modes.forEach((data, mode) => data.button.classList.toggle('active', mode === currentMode));
            if (currentMode) {
                main.innerText = modes.get(currentMode).description;
            }
        });

        this.setTarget = (target) => this.target = target;
        this.class = () => 'busStopSection';
        this.title = () => 'Przystanki';
        this.icon = () => icon;
        this.get = () => [
            header,
            main,
        ];
    }
}






