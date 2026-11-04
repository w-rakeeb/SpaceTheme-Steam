// Keep Steam's original utility elements in place so their handlers and popovers survive.
export function setupHeaderControls(parent, utilities) {
    if (parent.querySelector('.st-header-reload') ||
        getComputedStyle(document.documentElement).getPropertyValue('--st-header-top-right').trim() !== '1') return;

    const pinned = document.createElement('div');
    pinned.className = 'userpanel-buttoncontainer st-header-pinned';
    const pinnedSelector = '._5wILZhsLODVwGfcJ0hKmJ, ._3mGEzzp18imtSzGPkduedi, ._1TdaAqMFadi0UTqilrkelR';
    for (const control of Array.from(utilities.children)) {
        if (control.matches(pinnedSelector) || control.querySelector(pinnedSelector)) pinned.appendChild(control);
    }
    parent.appendChild(pinned);

    const createButton = (className, label, path) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.title = label;
        button.setAttribute('aria-label', label);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        const shape = document.createElementNS(svg.namespaceURI, 'path');
        shape.setAttribute('d', path);
        svg.appendChild(shape);
        button.appendChild(svg);
        return button;
    };

    const reload = createButton('st-header-reload', 'Reload Steam interface',
        'M20 7v5h-5 M19 12a7 7 0 1 0-2 5');
    const steamBrowser = window.SteamClient?.Browser ?? window.opener?.SteamClient?.Browser;
    reload.disabled = typeof steamBrowser?.RestartJSContext !== 'function';
    if (reload.disabled) reload.title = 'Steam interface reload is unavailable';
    reload.addEventListener('click', () => steamBrowser?.RestartJSContext?.());

    const toggle = createButton('st-header-more', 'More Steam controls', 'M6 9l6 6 6-6');
    utilities.id = 'st-header-utilities';
    toggle.setAttribute('aria-controls', utilities.id);
    toggle.setAttribute('aria-expanded', 'false');

    const setOpen = (open, restoreFocus = false) => {
        parent.classList.toggle('st-header-menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        if (open) {
            const left = toggle.offsetLeft + toggle.offsetWidth - utilities.offsetWidth;
            utilities.style.setProperty('--st-header-menu-left', `${Math.max(0, left)}px`);
        }
        if (restoreFocus) toggle.focus();
    };
    const storage = createButton('st-header-storage', 'Storage',
        'M4 4h16l2 11v5H2v-5L4 4z M2 15h20 M6 18h.01 M10 18h.01');
    const steamURL = window.SteamClient?.URL ?? window.opener?.SteamClient?.URL;
    storage.disabled = typeof steamURL?.ExecuteSteamURL !== 'function';
    if (storage.disabled) storage.title = 'Steam Storage shortcut is unavailable';
    storage.addEventListener('click', () => {
        steamURL?.ExecuteSteamURL?.('steam://open/settings/storage');
        setOpen(false);
    });
    utilities.appendChild(storage);
    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('pointerdown', event => {
        if (!parent.contains(event.target)) setOpen(false);
    });
    parent.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false, true);
            event.stopPropagation();
        }
    });
    parent.addEventListener('focusout', event => {
        // Steam's icon divs are not focusable; clicking one produces a null target.
        if (event.relatedTarget && !parent.contains(event.relatedTarget)) setOpen(false);
    });
    window.addEventListener('resize', () => setOpen(false));
    parent.append(reload, toggle);
}
