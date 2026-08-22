/**
 * Digital Contact Card & Payment Hub
 * 2-Master-Button Architecture & Full-Screen Modals
 */

(function() {
    'use strict';

    // ══════════════════════════════════════════════════════════
    //  BANK DATA REGISTRY (Universal Prefix: PAY)
    // ══════════════════════════════════════════════════════════
    const bankData = {
        bbva: {
            name: 'BBVA',
            account: '0126 8001 5013 907881',
            rawAccount: '012680015013907881',
            accountLabel: 'CLABE Interbancaria / Cuenta',
            prefix: 'PAY'
        },
        revolut: {
            name: 'STP',
            account: '6469 9040 4054 2994 32',
            rawAccount: '646990404054299432',
            accountLabel: 'CLABE',
            address: 'Calle Varsovia 36, Piso 6, Oficina 603-W, 06600, Ciudad de México, Alcaldía Cuauhtémoc, Colonia Juárez, Mexico',
            prefix: 'PAY',
            isRevolut: true,
            international: {
                name: 'Revolut Bank, S.A., Institución de Banca Múltiple',
                account: '1700 0240 4054 2994 30',
                rawAccount: '170002404054299430',
                accountLabel: 'Account',
                swift: 'REVOMXM2',
                address: 'Calle Varsovia 36, Piso 6, Oficina 603-W, 06600, Ciudad de México, Alcaldía Cuauhtémoc, Colonia Juárez, Mexico'
            }
        },
        banamex: {
            name: 'Citibanamex',
            account: 'Pendiente de asignar (Citibanamex)',
            rawAccount: 'PENDIENTE',
            accountLabel: 'CLABE Interbancaria / Cuenta',
            prefix: 'PAY'
        },
        maybe: {
            name: 'Maybe',
            account: 'Pendiente de asignar (Maybe)',
            rawAccount: 'PENDIENTE',
            accountLabel: 'CLABE Interbancaria / Cuenta',
            prefix: 'PAY'
        }
    };

    const bankKeys = ['bbva', 'revolut', 'banamex', 'maybe'];
    let currentBankIndex = 0;
    let currentBankKey = 'bbva';

    // ══════════════════════════════════════════════════════════
    //  UTILITIES: HAPTIC, TOAST & CLIPBOARD
    // ══════════════════════════════════════════════════════════

    function triggerHaptic() {
        try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) { /* silent */ }
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
        if (!text || text === 'PENDIENTE') {
            showToast('Dato aún no disponible');
            return Promise.resolve();
        }
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

    // ══════════════════════════════════════════════════════════
    //  SCROLL LOCK HELPERS
    // ══════════════════════════════════════════════════════════

    let _scrollYBefore = 0;

    function lockScroll() {
        _scrollYBefore = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + _scrollYBefore + 'px';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflowY = 'scroll';
    }

    function unlockScroll() {
        const savedY = parseInt(document.body.style.top || '0', 10) * -1;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo({ top: savedY, left: 0, behavior: 'instant' });
    }

    // ══════════════════════════════════════════════════════════
    //  PARALLAX & LIQUID GLASS DRAG PHYSICS
    // ══════════════════════════════════════════════════════════

    const heroOrbs = document.getElementById('heroOrbs');
    const heroGlassCard = document.getElementById('heroGlassCard');

    let currentX = 0, currentY = 0;
    let scrollY = window.scrollY;

    let isDragging = false;
    let startX = 0, startY = 0;
    let dragX = 0, dragY = 0;
    let velocityX = 0, velocityY = 0;
    let lastX = 0, lastY = 0;

    function renderParallax() {
        if (heroOrbs) {
            heroOrbs.style.transform = `translate3d(${currentX * -15}px, ${(currentY * -15) + (scrollY * 0.3)}px, 0)`;
        }
        if (!isDragging && heroGlassCard && dragX === 0 && dragY === 0) {
            heroGlassCard.style.transform = `translate3d(${currentX * 6}px, ${currentY * 6}px, 0)`;
        }
    }

    if (heroGlassCard) {
        heroGlassCard.style.cursor = 'grab';

        function onDragStart(e) {
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
            isDragging = true;
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            startX = clientX - dragX;
            startY = clientY - dragY;
            lastX = clientX;
            lastY = clientY;
            heroGlassCard.style.transition = 'none';
            heroGlassCard.style.cursor = 'grabbing';
        }

        function onDragMove(e) {
            if (!isDragging) return;
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

            velocityX = clientX - lastX;
            velocityY = clientY - lastY;
            lastX = clientX;
            lastY = clientY;

            dragX = clientX - startX;
            dragY = clientY - startY;

            const stretchX = 1 + Math.abs(velocityX) * 0.0015;
            const stretchY = 1 + Math.abs(velocityY) * 0.0015;
            const skewX = Math.max(-10, Math.min(10, velocityX * 0.25));
            const skewY = Math.max(-10, Math.min(10, velocityY * 0.25));

            heroGlassCard.style.transform = `translate3d(${dragX}px, ${dragY}px, 0) scale(${stretchX}, ${stretchY}) skew(${skewX}deg, ${skewY}deg)`;
        }

        function onDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            heroGlassCard.style.cursor = 'grab';
            heroGlassCard.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
            dragX = 0; dragY = 0;
            heroGlassCard.style.transform = 'translate3d(0, 0, 0) scale(1) skew(0deg, 0deg)';

            setTimeout(() => {
                if (!isDragging) heroGlassCard.style.transition = '';
            }, 700);
        }

        heroGlassCard.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove, { passive: false });
        window.addEventListener('mouseup', onDragEnd);

        heroGlassCard.addEventListener('touchstart', onDragStart, { passive: true });
        window.addEventListener('touchmove', onDragMove, { passive: true });
        window.addEventListener('touchend', onDragEnd);

        window.addEventListener('mousemove', (e) => {
            if (isDragging) return;
            currentX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            currentY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            renderParallax();
        });
    }

    // ══════════════════════════════════════════════════════════
    //  MASTER BUTTONS EXPAND / TOGGLE LOGIC
    // ══════════════════════════════════════════════════════════
    const contactTileWrapper = document.getElementById('contactTileWrapper');
    const toggleContactBtn = document.getElementById('toggleContactBtn');

    const bankTileWrapper = document.getElementById('bankTileWrapper');
    const toggleBankBtn = document.getElementById('toggleBankBtn');

    if (toggleContactBtn && contactTileWrapper) {
        toggleContactBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic();
            if (bankTileWrapper) bankTileWrapper.classList.remove('expanded');
            const isNowExpanded = contactTileWrapper.classList.toggle('expanded');
            
            // Enable NFC Proximity Sharing on contact button tap
            if (isNowExpanded) {
                activateNFCProximity();
            }
        });
    }

    if (toggleBankBtn && bankTileWrapper) {
        toggleBankBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic();
            if (contactTileWrapper) contactTileWrapper.classList.remove('expanded');
            bankTileWrapper.classList.toggle('expanded');
        });
    }

    // Click outside collapses both master tiles
    document.addEventListener('click', (e) => {
        if (contactTileWrapper && !contactTileWrapper.contains(e.target)) {
            contactTileWrapper.classList.remove('expanded');
        }
        if (bankTileWrapper && !bankTileWrapper.contains(e.target)) {
            bankTileWrapper.classList.remove('expanded');
        }
    });

    // ══════════════════════════════════════════════════════════
    //  BANK MODAL LOGIC & HEADER ARROWS
    // ══════════════════════════════════════════════════════════
    const bankOverlay = document.getElementById('bankModalOverlay');
    const openBankBtn = document.getElementById('openBankModal');
    const closeBankBtn = document.getElementById('closeBankModal');

    const prevBankBtn = document.getElementById('prevBankBtn');
    const nextBankBtn = document.getElementById('nextBankBtn');
    const carouselBankName = document.getElementById('carouselBankName');

    const valBankName = document.getElementById('valBankName');
    const valAccount = document.getElementById('valAccount');
    const rowBankName = document.getElementById('rowBankName');
    const rowAccount = document.getElementById('rowAccount');

    let speiEditor = null;
    let codiEditor = null;

    function openBankModal(pushHash = true) {
        triggerHaptic();
        if (bankTileWrapper) bankTileWrapper.classList.remove('expanded');
        lockScroll();
        bankOverlay.classList.add('open');
        if (pushHash) history.pushState(null, null, '#transferencia');
    }

    function closeBankModal() {
        triggerHaptic();
        bankOverlay.classList.remove('open');
        if (speiEditor) speiEditor.closeAndReset();
        unlockScroll();
        if (window.location.hash.includes('transferencia') || window.location.hash.includes('bank') || window.location.hash.includes('spei')) {
            history.replaceState(null, null, window.location.pathname);
        }
    }

    if (openBankBtn) openBankBtn.addEventListener('click', () => openBankModal(true));
    if (closeBankBtn) closeBankBtn.addEventListener('click', closeBankModal);

    if (bankOverlay) {
        bankOverlay.addEventListener('click', (e) => {
            if (e.target === bankOverlay) closeBankModal();
        });
    }

    let revolutMode = 'mx'; // 'mx' or 'int'

    function selectBank(bankKey) {
        const index = bankKeys.indexOf(bankKey);
        if (index === -1) return;
        currentBankIndex = index;
        currentBankKey = bankKey;
        let b = bankData[bankKey];

        const toggleContainer = document.getElementById('revolutToggleContainer');
        if (b.isRevolut) {
            if (toggleContainer) toggleContainer.style.display = 'flex';
            if (revolutMode === 'int' && b.international) {
                b = { ...b, ...b.international };
            }
        } else {
            if (toggleContainer) toggleContainer.style.display = 'none';
        }

        if (carouselBankName) {
            carouselBankName.style.opacity = '0';
            carouselBankName.style.transform = 'scale(0.92)';
            setTimeout(() => {
                carouselBankName.textContent = `${bankData[bankKey].name.split(' ')[0]} (${currentBankIndex + 1}/${bankKeys.length})`;
                carouselBankName.style.opacity = '1';
                carouselBankName.style.transform = 'scale(1)';
            }, 120);
        }

        if (valBankName) valBankName.textContent = b.name;
        if (rowBankName) rowBankName.setAttribute('data-copy', b.name);

        const lblAccount = document.getElementById('lblAccount');
        if (lblAccount) lblAccount.textContent = b.accountLabel || 'CLABE Interbancaria / Cuenta';

        if (valAccount) valAccount.textContent = b.account;
        if (rowAccount) rowAccount.setAttribute('data-copy', b.rawAccount);

        const rowSwift = document.getElementById('rowSwift');
        const valSwift = document.getElementById('valSwift');
        if (b.swift) {
            if (rowSwift) {
                rowSwift.style.display = 'flex';
                rowSwift.setAttribute('data-copy', b.swift);
            }
            if (valSwift) valSwift.textContent = b.swift;
        } else {
            if (rowSwift) rowSwift.style.display = 'none';
        }

        const rowAddress = document.getElementById('rowAddress');
        const valAddress = document.getElementById('valAddress');
        if (b.address) {
            if (rowAddress) {
                rowAddress.style.display = 'flex';
                rowAddress.setAttribute('data-copy', b.address);
            }
            if (valAddress) valAddress.textContent = b.address;
        } else {
            if (rowAddress) rowAddress.style.display = 'none';
        }

        if (speiEditor) speiEditor.update();
    }

    // Toggle events
    const btnRevMx = document.getElementById('btnRevMx');
    const btnRevInt = document.getElementById('btnRevInt');
    
    if (btnRevMx && btnRevInt) {
        btnRevMx.addEventListener('click', () => {
            revolutMode = 'mx';
            btnRevMx.style.background = 'var(--gray-900)';
            btnRevMx.style.color = 'white';
            btnRevInt.style.background = 'transparent';
            btnRevInt.style.color = 'var(--gray-500)';
            selectBank('revolut');
        });
        
        btnRevInt.addEventListener('click', () => {
            revolutMode = 'int';
            btnRevInt.style.background = 'var(--gray-900)';
            btnRevInt.style.color = 'white';
            btnRevMx.style.background = 'transparent';
            btnRevMx.style.color = 'var(--gray-500)';
            selectBank('revolut');
        });
    }, 120);
        }

        if (valBankName) valBankName.textContent = b.name;
        if (rowBankName) rowBankName.setAttribute('data-copy', b.name);

        if (valAccount) valAccount.textContent = b.account;
        if (rowAccount) rowAccount.setAttribute('data-copy', b.rawAccount);

        if (speiEditor) speiEditor.update();
    }

    function prevBank() {
        triggerHaptic();
        currentBankIndex = (currentBankIndex - 1 + bankKeys.length) % bankKeys.length;
        selectBank(bankKeys[currentBankIndex]);
    }

    function nextBank() {
        triggerHaptic();
        currentBankIndex = (currentBankIndex + 1) % bankKeys.length;
        selectBank(bankKeys[currentBankIndex]);
    }

    if (prevBankBtn) prevBankBtn.addEventListener('click', prevBank);
    if (nextBankBtn) nextBankBtn.addEventListener('click', nextBank);

    // Touch Swipe inside Bank Modal
    let touchStartX = 0;
    let touchEndX = 0;
    const bankModalContainer = document.querySelector('.bank-modal-container');

    if (bankModalContainer) {
        bankModalContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        bankModalContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 50) {
                if (diff < 0) nextBank();
                else prevBank();
            }
        }, { passive: true });
    }

    // ══════════════════════════════════════════════════════════
    //  CODI / DIMO MODAL LOGIC
    // ══════════════════════════════════════════════════════════
    const codiOverlay = document.getElementById('codiModalOverlay');
    const openCodiBtn = document.getElementById('openCodiModal');
    const closeCodiBtn = document.getElementById('closeCodiModal');

    function openCodiModal(pushHash = true) {
        triggerHaptic();
        if (bankTileWrapper) bankTileWrapper.classList.remove('expanded');
        lockScroll();
        codiOverlay.classList.add('open');
        if (pushHash) history.pushState(null, null, '#dimo');
    }

    function closeCodiModal() {
        triggerHaptic();
        codiOverlay.classList.remove('open');
        if (codiEditor) codiEditor.closeAndReset();
        unlockScroll();
        if (window.location.hash.includes('dimo') || window.location.hash.includes('codi')) {
            history.replaceState(null, null, window.location.pathname);
        }
    }

    if (openCodiBtn) openCodiBtn.addEventListener('click', () => openCodiModal(true));
    if (closeCodiBtn) closeCodiBtn.addEventListener('click', closeCodiModal);

    if (codiOverlay) {
        codiOverlay.addEventListener('click', (e) => {
            if (e.target === codiOverlay) closeCodiModal();
        });
    }

    // ══════════════════════════════════════════════════════════
    //  STRIPE MODAL LOGIC (STANDALONE)
    // ══════════════════════════════════════════════════════════
    const stripeOverlay = document.getElementById('stripeModalOverlay');
    const openStripeBtn = document.getElementById('openStripeModal');
    const closeStripeBtn = document.getElementById('closeStripeModal');

    function openStripeModal(pushHash = true) {
        triggerHaptic();
        if (bankTileWrapper) bankTileWrapper.classList.remove('expanded');
        lockScroll();
        stripeOverlay.classList.add('open');
        if (pushHash) history.pushState(null, null, '#stripe');
    }

    function closeStripeModal() {
        triggerHaptic();
        stripeOverlay.classList.remove('open');
        unlockScroll();
        if (window.location.hash.includes('stripe') || window.location.hash.includes('tarjeta')) {
            history.replaceState(null, null, window.location.pathname);
        }
    }

    if (openStripeBtn) openStripeBtn.addEventListener('click', () => openStripeModal(true));
    if (closeStripeBtn) closeStripeBtn.addEventListener('click', closeStripeModal);

    if (stripeOverlay) {
        stripeOverlay.addEventListener('click', (e) => {
            if (e.target === stripeOverlay) closeStripeModal();
        });
    }

    // ══════════════════════════════════════════════════════════
    //  BANK ROW TAP-TO-COPY HANDLERS
    // ══════════════════════════════════════════════════════════
    document.querySelectorAll('.bank-row').forEach(row => {
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
                }, 2000);
            }).catch(() => showToast('Error al copiar'));
        });
    });

    // ══════════════════════════════════════════════════════════
    //  INTERACTIVE FARE / CONCEPT EDITOR LOGIC ("PAY")
    // ══════════════════════════════════════════════════════════
    function initFareEditor(prefix, defaultPrefix) {
        const fareClosed = document.getElementById(prefix + 'FareClosed');
        const fareOpen = document.getElementById(prefix + 'FareOpen');
        const fareToggleRow = document.getElementById(prefix + 'FareToggleRow');
        const fareCloseBtn = document.getElementById(prefix + 'FareCloseBtn');
        const fareFirstName = document.getElementById(prefix + 'FareFirstName');
        const fareLastName = document.getElementById(prefix + 'FareLastName');
        const fareTotalCounter = document.getElementById(prefix + 'FareTotalCounter');
        const fareCount = document.getElementById(prefix + 'FareCount');
        const fareCopyBtn = document.getElementById(prefix + 'FareCopyBtn');
        const fareDisplay = document.getElementById(prefix + 'FareDisplay');
        const farePreviewText = document.getElementById(prefix + 'FarePreviewText');

        if (!fareClosed || !fareOpen) return null;

        function getActivePrefix() {
            return 'PAY';
        }

        function generateFareConcept(strict) {
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

        function updateFarePreview() {
            const conceptToDisplay = generateFareConcept(false);
            const validConcept = generateFareConcept(true);

            if (farePreviewText) farePreviewText.textContent = conceptToDisplay;
            if (fareCopyBtn) fareCopyBtn.disabled = !validConcept;

            if (fareTotalCounter) {
                const used = conceptToDisplay.length;
                fareTotalCounter.textContent = `${40 - used} restantes`;
                fareTotalCounter.style.color = (used === 40) ? '#ef4444' : 'var(--gray-500)';
            }
        }

        fareToggleRow.addEventListener('click', () => {
            triggerHaptic();
            fareClosed.style.display = 'none';
            fareOpen.style.display = '';
            updateFarePreview();
            setTimeout(() => { if (fareFirstName) fareFirstName.focus(); }, 100);
        });

        function closeAndReset() {
            fareOpen.style.display = 'none';
            fareClosed.style.display = '';
            if (fareFirstName) fareFirstName.value = '';
            if (fareLastName) fareLastName.value = '';
            if (fareCount) fareCount.value = '1';
            updateFarePreview();
        }

        if (fareCloseBtn) {
            fareCloseBtn.addEventListener('click', () => {
                triggerHaptic();
                closeAndReset();
            });
        }

        if (fareFirstName) {
            fareFirstName.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
                updateFarePreview();
            });
        }

        if (fareLastName) {
            fareLastName.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
                updateFarePreview();
            });
        }

        if (fareCount) {
            fareCount.addEventListener('input', function() {
                if (this.value.length > 2) this.value = this.value.slice(0, 2);
                updateFarePreview();
            });
        }

        if (fareCopyBtn) {
            fareCopyBtn.addEventListener('click', () => {
                const concept = generateFareConcept(true);
                if (!concept) return;

                triggerHaptic();
                copyToClipboard(concept).then(() => {
                    if (fareDisplay) {
                        fareDisplay.textContent = '¡COPIADO!';
                        fareDisplay.classList.add('copied');
                    }
                    showToast(`Concepto: ${concept}`);

                    closeAndReset();

                    setTimeout(() => {
                        if (fareDisplay) {
                            fareDisplay.textContent = 'Personalizar y copiar';
                            fareDisplay.classList.remove('copied');
                        }
                    }, 2000);
                });
            });
        }

        fareOpen.style.display = 'none';
        updateFarePreview();

        return {
            update: updateFarePreview,
            closeAndReset: closeAndReset
        };
    }

    speiEditor = initFareEditor('spei', 'PAY');
    codiEditor = initFareEditor('codi', 'PAY');

    // ══════════════════════════════════════════════════════════
    //  VCARD (.VCF 3.0) CONTACT GENERATION & FILE SHARING
    // ══════════════════════════════════════════════════════════
    const btnSaveContact = document.getElementById('btnSaveContact');

    function getVCardString() {
        return [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'N:Rios Garcia;Fernando Israel;;;',
            'FN:Fernando Israel Rios Garcia',
            'ORG:Software Development',
            'TITLE:Software Engineer & Tech Lead',
            'TEL;TYPE=CELL,VOICE;VALUE=uri:tel:+524421604049',
            'TEL;TYPE=CELL,VOICE:+524421604049',
            'EMAIL;TYPE=PREF,INTERNET:hi@riosisraelg.dev',
            'URL;TYPE=WORK:https://riosisraelg.dev',
            'URL;TYPE=LINKEDIN:https://linkedin.com/in/riosisraelg',
            'URL;TYPE=GITHUB:https://github.com/riosisraelg',
            'NOTE:Software Engineer & Developer - Contacto y datos de pago',
            'END:VCARD'
        ].join('\r\n');
    }

    function getVCardBlob() {
        return new Blob([getVCardString()], { type: 'text/vcard;charset=utf-8' });
    }

    function generateAndDownloadVCF() {
        triggerHaptic();
        if (contactTileWrapper) contactTileWrapper.classList.remove('expanded');

        const blob = getVCardBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Fernando_Israel_Rios_Garcia.vcf';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 150);

        showToast('Descargando contacto (.vcf)...');
    }

    if (btnSaveContact) btnSaveContact.addEventListener('click', generateAndDownloadVCF);

    // ══════════════════════════════════════════════════════════
    //  NATIVE OS SHARE SHEET & PROXIMITY NFC SHARING
    // ══════════════════════════════════════════════════════════
    const btnShare = document.getElementById('btnShare');

    async function handleShare() {
        triggerHaptic();
        if (contactTileWrapper) contactTileWrapper.classList.remove('expanded');

        const vCardBlob = getVCardBlob();
        let sharedAsFile = false;

        // Attempt direct .vcf File Sharing via Web Share API Level 2
        if (navigator.canShare && typeof File !== 'undefined') {
            try {
                const vCardFile = new File([vCardBlob], 'Fernando_Israel_Rios_Garcia.vcf', { type: 'text/vcard' });
                if (navigator.canShare({ files: [vCardFile] })) {
                    await navigator.share({
                        files: [vCardFile],
                        title: 'Fernando Israel Rios Garcia',
                        text: 'Contacto de Fernando Israel Rios Garcia'
                    });
                    sharedAsFile = true;
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }

        // Fallback: URL share or Clipboard copy
        if (!sharedAsFile) {
            const sharePayload = {
                title: 'Fernando Israel Rios Garcia',
                text: 'Tarjeta de contacto digital y datos de pago de Fernando Israel Rios Garcia:',
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(sharePayload);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        copyToClipboard(window.location.href).then(() => showToast('Enlace copiado al portapapeles'));
                    }
                }
            } else {
                copyToClipboard(window.location.href).then(() => showToast('Enlace copiado al portapapeles'));
            }
        }
    }

    if (btnShare) btnShare.addEventListener('click', handleShare);

    let nfcActive = false;

    async function activateNFCProximity() {
        if ('NDEFReader' in window) {
            try {
                const ndef = new NDEFReader();
                const vCardText = getVCardString();
                const encoder = new TextEncoder();
                const vCardBytes = encoder.encode(vCardText);

                await ndef.write({
                    records: [
                        // Record 1: Native Contact MIME record for instant address book import on Android
                        {
                            recordType: "mime",
                            mediaType: "text/vcard",
                            data: vCardBytes
                        },
                        // Record 2: Extended compatibility MIME
                        {
                            recordType: "mime",
                            mediaType: "text/x-vcard",
                            data: vCardBytes
                        },
                        // Record 3: Web URL fallback for iOS / Browser
                        {
                            recordType: "url",
                            data: window.location.href
                        }
                    ]
                });
                if (!nfcActive) {
                    nfcActive = true;
                    showToast('📡 NFC: Transmitiendo contacto (.vcf) y tarjeta');
                }
            } catch (e) {
                console.log('NFC proximity notice:', e);
            }
        }
    }

    // ══════════════════════════════════════════════════════════
    //  KEYBOARD & URL HASH ROUTING
    // ══════════════════════════════════════════════════════════
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBankModal();
            closeCodiModal();
            closeStripeModal();
            if (contactTileWrapper) contactTileWrapper.classList.remove('expanded');
            if (bankTileWrapper) bankTileWrapper.classList.remove('expanded');
        } else if (bankOverlay && bankOverlay.classList.contains('open') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            if (e.key === 'ArrowLeft') {
                prevBank();
            } else if (e.key === 'ArrowRight') {
                nextBank();
            }
        }
    });

    function handleInitialHash() {
        const hash = window.location.hash.toLowerCase();
        if (hash.includes('transferencia') || hash.includes('bank') || hash.includes('spei')) {
            if (hash.includes('revolut')) selectBank('revolut');
            else if (hash.includes('banamex')) selectBank('banamex');
            else if (hash.includes('maybe')) selectBank('maybe');
            else selectBank('bbva');
            openBankModal(false);
        } else if (hash.includes('dimo') || hash.includes('codi')) {
            openCodiModal(false);
        } else if (hash.includes('stripe') || hash.includes('tarjeta')) {
            openStripeModal(false);
        } else if (hash.includes('vcf') || hash.includes('guardar')) {
            generateAndDownloadVCF();
        } else if (hash.includes('share') || hash.includes('compartir')) {
            handleShare();
        }
    }

    window.addEventListener('load', handleInitialHash);
    window.addEventListener('hashchange', handleInitialHash);

})();
