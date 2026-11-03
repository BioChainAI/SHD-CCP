(() => {
    const gate = document.getElementById('auth-gate');
    const content = document.getElementById('main-content');
    const status = document.getElementById('user-status');
    const avatar = document.getElementById('user-avatar');
    const authLabel = document.querySelector('#auth-button span');
    const exitButton = document.getElementById('exit-guest-button');
    const guestNote = document.getElementById('guest-browsing-note');
    const gateStatus = document.getElementById('gate-status');
    const preview = document.getElementById('genesis-preview');
    const storageKey = 'shd-ccp-guest';
    let guest = false;
    let authReady = false;
    let previewIntersecting = true;

    function rememberGuest(value) {
        try {
            if (value) sessionStorage.setItem(storageKey, '1');
            else sessionStorage.removeItem(storageKey);
        } catch (_) { /* Guest browsing also works with storage disabled. */ }
    }

    function updatePreview() {
        preview.contentWindow?.postMessage({
            type: 'shd-genesis-visibility',
            visible: !document.hidden && !gate.classList.contains('hidden') && previewIntersecting,
        }, location.origin);
    }

    function revealContent(visible) {
        content.classList.toggle('hidden', !visible);
        gate.classList.toggle('hidden', visible);
        guestNote.classList.toggle('hidden', !guest);
        exitButton.classList.toggle('hidden', !guest);
        updatePreview();
        if (visible) window.dispatchEvent(new Event('shd-content-ready'));
    }

    function signedOut() {
        avatar.classList.add('hidden');
        avatar.removeAttribute('src');
        status.textContent = guest ? 'Guest browsing' : 'Signed Out';
        authLabel.textContent = 'Sign In with Google';
        gateStatus.textContent = '';
        revealContent(guest);
    }

    function enterGuest() {
        guest = true;
        rememberGuest(true);
        signedOut();
        window.dispatchEvent(new Event('shd-guest-enter'));
        content.scrollIntoView({ block: 'start' });
    }

    function beginAccountCheck() {
        guest = false;
        rememberGuest(false);
        revealContent(false);
    }

    function showAccount(user, verified) {
        guest = false;
        rememberGuest(false);
        status.textContent = user.displayName || user.email || 'Signed in';
        const uid = document.createElement('span');
        uid.className = 'block text-xs text-cyan-600';
        uid.title = user.uid;
        uid.textContent = 'UID: ' + user.uid.slice(0, 12) + '…';
        status.append(uid);
        authLabel.textContent = 'Sign Out';
        avatar.classList.toggle('hidden', !user.photoURL);
        if (user.photoURL) avatar.src = user.photoURL;
        else avatar.removeAttribute('src');
        revealContent(verified);
    }

    window.shdSession = {
        signedOut,
        beginAccountCheck,
        showAccount,
        authReady() { authReady = true; },
    };

    document.getElementById('guest-auth-button').addEventListener('click', enterGuest);
    exitButton.addEventListener('click', () => {
        guest = false;
        rememberGuest(false);
        signedOut();
        gate.scrollIntoView({ block: 'start' });
    });
    for (const id of ['auth-button', 'gate-auth-button']) {
        document.getElementById(id).addEventListener('click', () => {
            if (!authReady) gateStatus.textContent = 'Google sign-in is currently unavailable. You can still explore as a guest.';
        });
    }
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            previewIntersecting = entries[0].isIntersecting;
            updatePreview();
        }).observe(preview);
    }
    preview.addEventListener('load', updatePreview);
    document.addEventListener('visibilitychange', updatePreview);
    try { guest = sessionStorage.getItem(storageKey) === '1'; } catch (_) {}
    signedOut();
})();
