function createSection(section)
{
    const target = window.document.createElement('section');

    const header = window.document.createElement('header');
    const icon = window.document.createElement('img');
    icon.src = section.icon();
    header.appendChild(icon);
    const title = window.document.createElement('h3');
    title.innerText = section.title();
    header.appendChild(title);
    target.appendChild(header);
    const main = window.document.createElement('main');
    main.classList.add(section.class());
    target.appendChild(main);
    section.get().map((item) => main.appendChild(item));
    return target;
}

export default class Sidebar
{
    constructor(id)
    {
        const sections = new Set();
        const sidebar = window.document.getElementById(id);

        const add = (section) => {
            const target = createSection(section);
            sidebar.appendChild(target);
            sections.add({
                section,
                target,
            });
        };

        window.commandBus.register('addSidebarSection', add);
    }
}
