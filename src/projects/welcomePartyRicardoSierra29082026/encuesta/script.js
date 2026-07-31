let state = {
    name: '',
    phone: '',
    wantsToEat: null,
    meatOption: null,
    donations: [],
    suggestions: ''
};

const screens = [
    'screen-identity',
    'screen-eat',
    'screen-meat',
    'screen-donations',
    'screen-submit',
    'screen-brief',
    'screen-result'
];

let currentScreenIndex = 0;

// Update progress bar
function updateProgress() {
    // Total screens for progress calculation (excluding result)
    const totalSteps = 5;
    const progress = ((currentScreenIndex) / totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Navigate to specific screen ID
function nextScreen(nextId) {
    const currentId = screens[currentScreenIndex];
    const currentEl = document.getElementById(currentId);
    const nextEl = document.getElementById(nextId);
    
    currentEl.classList.remove('active');
    currentEl.classList.add('prev'); // Move up
    
    setTimeout(() => {
        nextEl.classList.remove('prev'); // Ensure it comes from bottom
        nextEl.classList.add('active');
    }, 50);

    currentScreenIndex = screens.indexOf(nextId);
    updateProgress();
    
    document.getElementById('btn-prev').disabled = currentScreenIndex === 0;

    // Focus input if any
    const firstInput = nextEl.querySelector('input, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 300);
}

// Go to previous screen in history
function prevScreen() {
    if (currentScreenIndex === 0) return;
    
    const currentId = screens[currentScreenIndex];
    const currentEl = document.getElementById(currentId);
    
    // Determine previous screen based on logic
    let prevIndex = currentScreenIndex - 1;
    if (currentId === 'screen-donations' && state.wantsToEat === false) {
        prevIndex = screens.indexOf('screen-eat');
    }
    
    const prevId = screens[prevIndex];
    const prevEl = document.getElementById(prevId);

    currentEl.classList.remove('active');
    
    setTimeout(() => {
        prevEl.classList.remove('prev');
        prevEl.classList.add('active');
    }, 50);

    currentScreenIndex = prevIndex;
    updateProgress();
    
    document.getElementById('btn-prev').disabled = currentScreenIndex === 0;
}

// ── Validation and Logic ──

function checkIdentity() {
    const name = document.getElementById('input-name').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    const btn = document.getElementById('btn-identity');
    
    state.name = name;
    state.phone = phone;
    
    // Require at least 1 character for name and 10 for phone
    btn.disabled = !(name.length >= 1 && phone.length >= 10);
}

// Keyboard Enter to advance if button is enabled
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;
        
        // Don't trigger enter on textareas
        if (e.target.tagName === 'TEXTAREA') return;

        const primaryBtn = activeScreen.querySelector('.typeform-btn.primary, .typeform-btn.success');
        if (primaryBtn && !primaryBtn.disabled) {
            primaryBtn.click();
        }
    }
});

function selectEatOption(wants) {
    state.wantsToEat = wants;
    
    // Update UI selection
    const options = document.getElementById('screen-eat').querySelectorAll('.option-card');
    options.forEach(opt => opt.classList.remove('selected'));
    options[wants ? 0 : 1].classList.add('selected');

    // Wait a brief moment for visual feedback, then proceed
    setTimeout(() => {
        if (wants) {
            nextScreen('screen-meat');
        } else {
            state.meatOption = null;
            nextScreen('screen-donations');
        }
    }, 300);
}

function selectMeat(option) {
    state.meatOption = option;
    
    // Update UI
    const options = document.getElementById('screen-meat').querySelectorAll('.option-card');
    options.forEach(opt => opt.classList.remove('selected'));
    
    const index = option.includes('P1') ? 0 : option.includes('P2') ? 1 : 2;
    options[index].classList.add('selected');

    setTimeout(() => {
        nextScreen('screen-donations');
    }, 300);
}

// Multi-select for donations
document.querySelectorAll('#donations-list .option-card').forEach(card => {
    card.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        
        // If "Nada" is selected, clear everything else
        if (value === 'Nada') {
            document.querySelectorAll('#donations-list .option-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        } else {
            // If something else is selected, remove "Nada"
            document.querySelector('.none-option').classList.remove('selected');
            this.classList.toggle('selected');
        }
        
        checkDonations();
    });
});

function checkDonations() {
    const selected = Array.from(document.querySelectorAll('#donations-list .option-card.selected')).map(c => c.getAttribute('data-value'));
    state.donations = selected;
    
    const alert = document.getElementById('commitment-alert');
    const checkbox = document.getElementById('commitment-checkbox');
    const btn = document.getElementById('btn-next-donations');
    
    if (selected.length === 0) {
        alert.classList.add('hidden');
        btn.disabled = true;
    } else if (selected.includes('Nada')) {
        alert.classList.add('hidden');
        btn.disabled = false;
    } else {
        alert.classList.remove('hidden');
        btn.disabled = !checkbox.checked;
    }
}

// Submit Poll
// Generate Brief Summary
function submitPoll() {
    state.suggestions = document.getElementById('input-suggestions').value.trim();
    
    const briefContent = document.getElementById('brief-content');
    
    const html = `
        <div class="brief-item">
            <span class="brief-label">Nombre y Teléfono</span>
            <span class="brief-value">${state.name} (${state.phone})</span>
        </div>
        <div class="brief-item">
            <span class="brief-label">Comida</span>
            <span class="brief-value">${state.wantsToEat ? "Sí (Cuota con comida)" : "No (Solo cuota básica)"}</span>
        </div>
        ${state.wantsToEat ? `
        <div class="brief-item">
            <span class="brief-label">Propuesta de Carne</span>
            <span class="brief-value">${state.meatOption || "No especificado"}</span>
        </div>` : ''}
        <div class="brief-item">
            <span class="brief-label">Aportaciones / Donaciones</span>
            <span class="brief-value">${state.donations.length > 0 ? state.donations.join(', ') : "Ninguna"}</span>
        </div>
        <div class="brief-item">
            <span class="brief-label">Sugerencias Adicionales</span>
            <span class="brief-value" style="font-style: italic;">${state.suggestions || "Ninguna"}</span>
        </div>
    `;
    
    briefContent.innerHTML = html;
    nextScreen('screen-brief');
}

// Generate JSON and Finalize
function generateJSONAndSubmit() {
    const resultObj = {
        Nombre: state.name,
        Telefono: state.phone,
        ComeraParrillada: state.wantsToEat ? "Sí" : "No (Solo cuota básica)",
        Carne: state.meatOption || "N/A",
        Donaciones: state.donations.length > 0 ? state.donations : ["Ninguna"],
        Sugerencias: state.suggestions || "Ninguna"
    };

    // Format for WhatsApp
    const textMessage = JSON.stringify(resultObj, null, 2);

    document.getElementById('json-output').textContent = textMessage;
    
    const waLink = `https://wa.me/524427487589?text=${encodeURIComponent(textMessage)}`;
    document.getElementById('whatsapp-btn').href = waLink;
    
    localStorage.setItem('wp_encuesta_done', 'true');

    nextScreen('screen-result');
}
