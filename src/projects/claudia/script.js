/**
 * DATOS BANCARIOS — CLAUDIA ALICIA GARCIA JUAREZ
 * Réplica exacta del Bank Modal de contact con flechas de navegación que alternan entre cuenta Nacional e Internacional.
 */

document.addEventListener('DOMContentLoaded', () => {

    const bankData = {
        revolut: {
            name: 'STP\nCalle Varsovia 36, Piso 6, Oficina 603-W, 06600, Ciudad de México, Alcaldía Cuauhtémoc, Colonia Juárez, Mexico',
            account: '6469 9040 4036 4279 76',
            rawAccount: '646990404036427976',
            accountLabel: 'CLABE',
            currency: 'Mexican peso',
            prefix: 'PAY',
            revtag: '@caliciagarciaj',
            isRevolut: true,
            international: {
                name: 'Revolut Bank, S.A., Institución de Banca Múltiple\nCalle Varsovia 36, Piso 6, Oficina 603-W, 06600, Ciudad de México, Alcaldía Cuauhtémoc, Colonia Juárez, Mexico',
                account: '1700 0240 4036 4279 76',
                rawAccount: '170002404036427976',
                accountLabel: 'Cuenta',
                swift: 'REVOMXM2',
                currency: 'Mexican peso',
                revtag: '@caliciagarciaj'
            }
        }
    };

    let revolutMode = 'mx'; // 'mx' or 'int'

    // ── Haptic & Toast ──────────────────────────────────────
    function triggerHaptic(duration = 40) {
        try {
            if (navigator.vibrate) navigator.vibrate(duration);
        } catch (e) {}
    }

    function showToast(msg) {
        const t = document.getElementById('copyToast');
        if (!t) return;
        t.textContent = msg || '¡Copiado al portapapeles!';
        t.classList.add('visible');
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => {
            t.classList.remove('visible');
        }, 2200);
    }

    function copyToClipboard(text) {
        if (!text) return Promise.resolve();
        triggerHaptic();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return Promise.resolve();
    }

    // ── Bank Row Tap-to-Copy Handlers ───────────────────────
    document.querySelectorAll('.bank-row:not(#speiFareToggleRow)').forEach(row => {
        row.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-copy');
            if (!textToCopy) return;
            const valueEl = this.querySelector('.bank-field-value');
            const originalHTML = valueEl ? valueEl.innerHTML : '';

            triggerHaptic();

            copyToClipboard(textToCopy).then(() => {
                if (valueEl) {
                    valueEl.innerHTML = '<span style="color:var(--success); font-weight:700;">¡COPIADO!</span>';
                }
                showToast(`Copiado: ${textToCopy}`);

                setTimeout(() => {
                    if (valueEl) {
                        valueEl.innerHTML = originalHTML;
                    }
                }, 1800);
            }).catch(() => showToast('Error al copiar'));
        });
    });

    // ── Render Bank Details ─────────────────────────────────
    const valCurrency = document.getElementById('valCurrency');
    const rowCurrency = document.getElementById('rowCurrency');
    const valRevtag = document.getElementById('valRevtag');
    const rowRevtag = document.getElementById('rowRevtag');
    const valBankName = document.getElementById('valBankName');
    const rowBankName = document.getElementById('rowBankName');
    const valAccount = document.getElementById('valAccount');
    const rowAccount = document.getElementById('rowAccount');
    const lblAccount = document.getElementById('lblAccount');
    const valSwift = document.getElementById('valSwift');
    const rowSwift = document.getElementById('rowSwift');
    const btnRevMx = document.getElementById('btnRevMx');
    const btnRevInt = document.getElementById('btnRevInt');

    function renderBank() {
        let b = bankData.revolut;
        if (revolutMode === 'int' && b.international) {
            b = b.international;
        }

        // Toggle Buttons visual state
        if (btnRevMx && btnRevInt) {
            if (revolutMode === 'mx') {
                btnRevMx.style.background = 'var(--gray-900)';
                btnRevMx.style.color = 'white';
                btnRevInt.style.background = 'transparent';
                btnRevInt.style.color = 'var(--gray-500)';
            } else {
                btnRevInt.style.background = 'var(--gray-900)';
                btnRevInt.style.color = 'white';
                btnRevMx.style.background = 'transparent';
                btnRevMx.style.color = 'var(--gray-500)';
            }
        }

        if (valCurrency && rowCurrency) {
            valCurrency.textContent = b.currency || 'Mexican peso';
            rowCurrency.setAttribute('data-copy', b.currency || 'Mexican peso');
        }

        if (valRevtag && rowRevtag) {
            valRevtag.textContent = b.revtag || '@caliciagarciaj';
            rowRevtag.setAttribute('data-copy', b.revtag || '@caliciagarciaj');
        }

        if (valBankName && rowBankName) {
            if (b.name.includes('\n')) {
                const parts = b.name.split('\n');
                valBankName.innerHTML = `${parts[0]}<br><span style="font-size: 0.75rem; color: var(--gray-500); font-weight: 400; line-height: 1.2; display: block; margin-top: 4px;">${parts[1]}</span>`;
                rowBankName.setAttribute('data-copy', parts[0]);
            } else {
                valBankName.textContent = b.name;
                rowBankName.setAttribute('data-copy', b.name);
            }
        }

        if (lblAccount) lblAccount.textContent = b.accountLabel || 'CLABE';
        if (valAccount) valAccount.textContent = b.account;
        if (rowAccount) rowAccount.setAttribute('data-copy', b.rawAccount);

        if (b.swift) {
            if (rowSwift) rowSwift.style.display = 'flex';
            if (valSwift) valSwift.textContent = b.swift;
            if (rowSwift) rowSwift.setAttribute('data-copy', b.swift);
        } else {
            if (rowSwift) rowSwift.style.display = 'none';
        }
    }

    // ── Toggle Switch (Nacional / Internacional) ─────────────
    function toggleMode(mode) {
        triggerHaptic(20);
        revolutMode = mode;
        renderBank();
    }

    if (btnRevMx) btnRevMx.addEventListener('click', () => toggleMode('mx'));
    if (btnRevInt) btnRevInt.addEventListener('click', () => toggleMode('int'));

    // ── Chevron Arrow Navigation (< and >) ──────────────────
    // In Claudia's single Revolut component, the arrows switch between Nacional and Internacional
    const prevBankBtn = document.getElementById('prevBankBtn');
    const nextBankBtn = document.getElementById('nextBankBtn');

    function cycleMode() {
        toggleMode(revolutMode === 'mx' ? 'int' : 'mx');
    }

    if (prevBankBtn) prevBankBtn.addEventListener('click', cycleMode);
    if (nextBankBtn) nextBankBtn.addEventListener('click', cycleMode);

    // ── Interactive Fare / Concept Editor Logic (PAY) ───────
    function initFareEditor() {
        const fareSection = document.getElementById('speiFareSection');
        const fareClosed = document.getElementById('speiFareClosed');
        const fareOpen = document.getElementById('speiFareOpen');
        const fareToggleRow = document.getElementById('speiFareToggleRow');
        const fareCloseBtn = document.getElementById('speiFareCloseBtn');
        const fareFirstName = document.getElementById('speiFareFirstName');
        const fareLastName = document.getElementById('speiFareLastName');
        const fareTotalCounter = document.getElementById('speiFareTotalCounter');
        const fareCount = document.getElementById('speiFareCount');
        const fareCopyBtn = document.getElementById('speiFareCopyBtn');
        const fareDisplay = document.getElementById('speiFareDisplay');
        const farePreviewText = document.getElementById('speiFarePreviewText');

        if (!fareClosed || !fareOpen) return;

        function getActivePrefix() {
            return 'PAY';
        }

        function generateFareConcept(strict = false) {
            const firstName = fareFirstName.value.trim().toUpperCase();
            const lastName = fareLastName.value.trim().toUpperCase();
            let count = parseInt(fareCount.value || '1', 10);
            if (isNaN(count) || count < 1) count = 1;

            let concept = `${getActivePrefix()} ${count}`;
            if (firstName) concept += ` ${firstName}`;
            if (lastName) concept += ` ${lastName}`;

            if (strict && (!firstName || !lastName)) return null;

            return concept.substring(0, 40);
        }

        function updateUI() {
            const previewConcept = generateFareConcept(false);
            const strictConcept = generateFareConcept(true);

            if (farePreviewText) farePreviewText.textContent = previewConcept;
            if (fareDisplay) fareDisplay.textContent = previewConcept;

            const maxLen = 40;
            const currentLen = previewConcept.length;
            const remaining = Math.max(0, maxLen - currentLen);

            if (fareTotalCounter) {
                fareTotalCounter.textContent = `${remaining} restantes`;
                fareTotalCounter.style.color = remaining <= 5 ? '#ef4444' : 'var(--gray-500)';
            }

            if (fareCopyBtn) {
                if (strictConcept) {
                    fareCopyBtn.removeAttribute('disabled');
                } else {
                    fareCopyBtn.setAttribute('disabled', 'true');
                }
            }
        }

        if (fareToggleRow) {
            fareToggleRow.addEventListener('click', () => {
                triggerHaptic(20);
                fareSection.classList.toggle('expanded');
                updateUI();
                if (fareSection.classList.contains('expanded') && fareFirstName) {
                    setTimeout(() => fareFirstName.focus(), 150);
                }
            });
        }

        if (fareCloseBtn) {
            fareCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerHaptic(20);
                fareSection.classList.remove('expanded');
            });
        }

        [fareFirstName, fareLastName].forEach(inp => {
            if (inp) {
                inp.addEventListener('input', () => {
                    inp.value = inp.value.toUpperCase();
                    updateUI();
                });
            }
        });

        if (fareCount) {
            fareCount.addEventListener('input', () => {
                let val = parseInt(fareCount.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 10) val = 10;
                fareCount.value = val;
                updateUI();
            });
        }

        if (fareCopyBtn) {
            fareCopyBtn.addEventListener('click', () => {
                const strictConcept = generateFareConcept(true);
                if (!strictConcept) return;

                triggerHaptic();
                copyToClipboard(strictConcept).then(() => {
                    const originalText = fareCopyBtn.textContent;
                    fareCopyBtn.textContent = '¡COPIADO!';
                    showToast(`Concepto: ${strictConcept}`);
                    setTimeout(() => {
                        fareCopyBtn.textContent = originalText;
                        fareSection.classList.remove('expanded');
                    }, 1400);
                });
            });
        }

        updateUI();
    }

    renderBank();
    initFareEditor();

});
