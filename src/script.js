// Set your target date here (YYYY-MM-DD)
const targetDate = new Date('2026-03-31T00:00:00').getTime();

// Update countdown every second
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('countdown').textContent = 
        `${String(days).padStart(3, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update progress bar
    const startDate = new Date('2026-02-22T00:00:00').getTime();
    const totalDuration = targetDate - startDate;
    const elapsed = now - startDate;
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    const barLen = 30;
    const filled = Math.round((progress / 100) * barLen);
    const empty = barLen - filled;
    const pct = Math.floor(progress);
    document.getElementById('progressBar').textContent =
        '[' + '█'.repeat(filled) + '░'.repeat(empty) + '] ' + String(pct).padStart(3) + '%';

    if (distance < 0) {
        document.getElementById('countdown').textContent = '000:00:00:00';
        document.getElementById('progressBar').textContent =
            '[' + '█'.repeat(barLen) + '] 100%';
    }
}

// Initialize countdown
updateCountdown();
setInterval(updateCountdown, 1000);

// Contact form toggle
const emailBtn = document.getElementById('emailBtn');
const messageBtn = document.getElementById('messageBtn');
const emailForm = document.getElementById('emailForm');
const messageForm = document.getElementById('messageForm');

let inactivityTimer;

function resetForms() {
    emailForm.classList.remove('active');
    messageForm.classList.remove('active');
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(resetForms, 5000);
}

emailBtn.addEventListener('click', function() {
    emailForm.classList.toggle('active');
    messageForm.classList.remove('active');
    resetInactivityTimer();
});

messageBtn.addEventListener('click', function() {
    messageForm.classList.toggle('active');
    emailForm.classList.remove('active');
    resetInactivityTimer();
});

// Reset timer on interaction
document.querySelector('.terminal-body').addEventListener('mousemove', function() {
    if (emailForm.classList.contains('active') || messageForm.classList.contains('active')) {
        resetInactivityTimer();
    }
});

// Handle form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const subject = 'Notify me when your portfolio launches!';
    const body = `Hi Rivers!%0D%0A%0D%0AI'd love to check out your dev portfolio and learn more about your career journey. Please notify me when it's live!%0D%0A%0D%0AEmail: ${email}`;
    
    window.location.href = `mailto:hi@riosisraelg.dev?subject=${subject}&body=${body}`;
    
    document.getElementById('emailInput').value = '';
});

// WhatsApp button
document.getElementById('whatsappBtn').addEventListener('click', function() {
    const message = 'Hi Rivers! I\'m interested in your dev portfolio and would love to learn more about your career. Let me know when it launches!';
    window.open(`https://wa.me/524427487589?text=${encodeURIComponent(message)}`, '_blank');
});

// SMS button
document.getElementById('smsBtn').addEventListener('click', function() {
    const message = 'Hi Rivers! I\'m interested in your dev portfolio and would love to learn more about your career. Let me know when it launches!';
    window.location.href = `sms:+524427487589&body=${encodeURIComponent(message)}`;
});
