/**
 * PANADERÍA — COMPONENTE DE DATOS BANCARIOS
 * Lógica interactiva de copiado con retroalimentación in-place y editor de concepto dinámico (PAN + Número + Comentario).
 */

document.addEventListener('DOMContentLoaded', () => {

    const toastNotice = document.getElementById('toastNotice');
    const toastMsg = document.getElementById('toastMsg');
    let toastTimeout = null;

    function triggerHaptic(pattern = 35) {
        if (navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {}
        }
    }

    function showToast(message) {
        if (!toastNotice || !toastMsg) return;
        toastMsg.textContent = message;
        toastNotice.classList.add('show');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastNotice.classList.remove('show');
        }, 2200);
    }

    async function copyToClipboard(text, customMessage = 'Copiado al portapapeles') {
        triggerHaptic();
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                showToast(customMessage);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast(customMessage);
            }
        } catch (err) {
            showToast(customMessage);
        }
    }

    // ── Bank Row Tap-to-Copy Handlers with in-place label feedback ──
    document.querySelectorAll('.bank-row:not(#panFareToggleRow)').forEach(row => {
        row.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-copy');
            if (!textToCopy) return;

            const valueEl = this.querySelector('.bank-field-value');
            const originalText = valueEl ? valueEl.textContent : '';

            triggerHaptic();

            copyToClipboard(textToCopy).then(() => {
                if (valueEl) {
                    valueEl.textContent = '¡COPIADO!';
                    valueEl.classList.add('copied');
                }
                showToast(`Copiado: ${textToCopy}`);

                setTimeout(() => {
                    if (valueEl) {
                        valueEl.textContent = originalText;
                        valueEl.classList.remove('copied');
                    }
                }, 1800);
            }).catch(() => showToast('Error al copiar'));
        });
    });

    // ── Interactive Concept / Fare Editor Logic ("PAN") ─────
    const fareSection = document.getElementById('panFareSection');
    const fareToggleRow = document.getElementById('panFareToggleRow');
    const fareCloseBtn = document.getElementById('panFareCloseBtn');
    const fareCountInput = document.getElementById('panFareCount');
    const btnMinusCount = document.getElementById('btnMinusCount');
    const btnPlusCount = document.getElementById('btnPlusCount');
    const fareCommentInput = document.getElementById('panFareComment');
    const fareTotalCounter = document.getElementById('panFareTotalCounter');
    const farePreviewText = document.getElementById('panFarePreviewText');
    const fareDisplay = document.getElementById('panFareDisplay');
    const fareCopyBtn = document.getElementById('panFareCopyBtn');

    function getActivePrefix() {
        return 'PAN';
    }

    function generateFareConcept() {
        let count = parseInt(fareCountInput ? fareCountInput.value || '1' : '1', 10);
        if (isNaN(count) || count < 1) count = 1;

        const comment = fareCommentInput ? fareCommentInput.value.trim().toUpperCase() : '';

        let concept = `${getActivePrefix()} ${count}`;
        if (comment) {
            concept += ` ${comment}`;
        }

        return concept.substring(0, 40);
    }

    function updateFareUI() {
        const fullConcept = generateFareConcept();
        const maxLen = 40;
        const currentLen = fullConcept.length;
        const remaining = Math.max(0, maxLen - currentLen);

        if (farePreviewText) farePreviewText.textContent = fullConcept;
        if (fareDisplay) fareDisplay.textContent = fullConcept;

        if (fareTotalCounter) {
            fareTotalCounter.textContent = `${remaining} caracteres libres`;
            fareTotalCounter.style.color = remaining <= 5 ? '#ef4444' : 'var(--gray-500)';
        }
    }

    // Toggle open/close
    if (fareToggleRow && fareSection) {
        fareToggleRow.addEventListener('click', () => {
            triggerHaptic(20);
            fareSection.classList.toggle('expanded');
            updateFareUI();
            if (fareSection.classList.contains('expanded') && fareCommentInput) {
                setTimeout(() => fareCommentInput.focus(), 150);
            }
        });
    }

    if (fareCloseBtn && fareSection) {
        fareCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic(20);
            fareSection.classList.remove('expanded');
        });
    }

    // Stepper minus / plus
    if (btnMinusCount && fareCountInput) {
        btnMinusCount.addEventListener('click', () => {
            triggerHaptic(20);
            let val = parseInt(fareCountInput.value || '1', 10);
            if (val > 1) {
                fareCountInput.value = val - 1;
                updateFareUI();
            }
        });
    }

    if (btnPlusCount && fareCountInput) {
        btnPlusCount.addEventListener('click', () => {
            triggerHaptic(20);
            let val = parseInt(fareCountInput.value || '1', 10);
            if (val < 99) {
                fareCountInput.value = val + 1;
                updateFareUI();
            }
        });
    }

    if (fareCountInput) {
        fareCountInput.addEventListener('input', () => {
            let val = parseInt(fareCountInput.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 99) val = 99;
            fareCountInput.value = val;
            updateFareUI();
        });
    }

    // Free comment input
    if (fareCommentInput) {
        fareCommentInput.addEventListener('input', () => {
            fareCommentInput.value = fareCommentInput.value.toUpperCase();
            updateFareUI();
        });
    }

    // Copy Concept button
    if (fareCopyBtn) {
        fareCopyBtn.addEventListener('click', () => {
            const concept = generateFareConcept();
            copyToClipboard(concept, `✓ Concepto "${concept}" copiado`);
        });
    }

    // Initial render
    updateFareUI();

    // ── Full Summary Copy ───────────────────────────────────
    const btnCopyAll = document.getElementById('btnCopyAll');
    if (btnCopyAll) {
        btnCopyAll.addEventListener('click', () => {
            const concept = generateFareConcept();
            const fullSummary = [
                '🍞 DATOS PARA TRANSFERENCIA — PANADERÍA',
                '------------------------------------',
                '• Beneficiario: Guillermo Bala',
                '• Institución: Spin by OXXO (STP)',
                '• CLABE: 728969000086766079',
                '• Celular Spin: 442 545 1092',
                '• Alias Spin: GuillermoB710',
                `• Concepto oficial: ${concept}`,
                '------------------------------------'
            ].join('\n');

            copyToClipboard(fullSummary, '✓ Todos los datos copiados');
        });
    }

});
