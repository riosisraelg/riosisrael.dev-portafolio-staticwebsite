// Set your target date here (YYYY-MM-DD)
const targetDate = new Date('2026-03-15T00:00:00').getTime();

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

    // Update progress bar (example: progress based on time elapsed)
    const startDate = new Date('2026-02-22T00:00:00').getTime();
    const totalDuration = targetDate - startDate;
    const elapsed = now - startDate;
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    document.getElementById('progressFill').style.width = progress + '%';

    if (distance < 0) {
        document.getElementById('countdown').textContent = '000:00:00:00';
        document.getElementById('progressFill').style.width = '100%';
    }
}

// Initialize countdown
updateCountdown();
setInterval(updateCountdown, 1000);

// Toggle between email and message options
const emailToggle = document.getElementById('emailToggle');
const messageToggle = document.getElementById('messageToggle');
const contactForm = document.getElementById('contactForm');
const messageOptions = document.getElementById('messageOptions');

emailToggle.addEventListener('click', function() {
    emailToggle.classList.add('active');
    messageToggle.classList.remove('active');
    contactForm.classList.add('active');
    messageOptions.classList.remove('active');
});

messageToggle.addEventListener('click', function() {
    messageToggle.classList.add('active');
    emailToggle.classList.remove('active');
    contactForm.classList.remove('active');
    messageOptions.classList.add('active');
});

// Handle form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const subject = 'Coming Soon - Notification Request';
    const body = `Hi Rivers! I would like to be notified when the site launches.%0D%0A%0D%0AEmail: ${email}`;
    
    window.location.href = `mailto:hi@riosisraelg.dev?subject=${subject}&body=${body}`;
    
    document.getElementById('emailInput').value = '';
});

// WhatsApp button
document.getElementById('whatsappBtn').addEventListener('click', function() {
    const message = 'Hi Rivers! I would like to be notified when your site launches.';
    window.open(`https://wa.me/524427487589?text=${encodeURIComponent(message)}`, '_blank');
});

// SMS button
document.getElementById('smsBtn').addEventListener('click', function() {
    const message = 'Hi Rivers! I would like to be notified when your site launches.';
    window.location.href = `sms:+524427487589&body=${encodeURIComponent(message)}`;
});
