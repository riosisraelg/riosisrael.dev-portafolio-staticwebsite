const targetDate = new Date('2026-12-31T23:59:59').getTime();

let currentProgress = 50; // hardcoded for now

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
    const progress = currentProgress;
    
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

// Virtual File System & State
const vfs = {
    '/': ['home/'],
    '/home': ['rivers/'],
    '/home/rivers': ['portfolio/', 'projects/'],
    '/home/rivers/portfolio': ['index.html', 'script.js', 'style.css', 'status.txt', 'links.txt', 'notify-me.sh'],
    '/home/rivers/projects': ['candle/'],
    '/home/rivers/projects/candle': []
};
let currentDir = '/home/rivers/portfolio';

function getPrompt() {
    let displayDir = currentDir.replace('/home/rivers', '~');
    return `rivers@portfolio:${displayDir}$ `;
}

function resolvePath(base, target) {
    if (!target) target = '~';
    if (target.startsWith('~')) {
        target = '/home/rivers' + target.substring(1);
    }
    let path = target.startsWith('/') ? target : (base === '/' ? '/' + target : base + '/' + target);
    if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);
    
    // Resolve .. and .
    const parts = path.split('/');
    const resolved = [];
    for (const p of parts) {
        if (p === '' || p === '.') continue;
        if (p === '..') {
            if (resolved.length > 0) resolved.pop();
        } else {
            resolved.push(p);
        }
    }
    return '/' + resolved.join('/');
}

// Terminal command handling
const cmdInput = document.getElementById('cmdInput');
const cmdText = document.getElementById('cmdText');
const terminalHistory = document.getElementById('terminal-history');

if (cmdInput) {
    const inputPromptSpan = document.querySelector('.input-line .prompt'); 
    
    document.querySelector('.terminal-body').addEventListener('click', () => {
        cmdInput.focus();
    });

    cmdInput.addEventListener('input', function() {
        cmdText.textContent = this.value;
    });

    cmdInput.addEventListener('keydown', async function(e) {
        if (e.key === 'Enter') {
            const rawCommand = this.value;
            const command = rawCommand.trim();
            this.value = '';
            cmdText.textContent = '';
            
            if (command === '') return;

            const args = command.split(' ').filter(Boolean);
            const cmd = args[0].toLowerCase();
            
            const output = document.createElement('div');
            output.className = 'output-line';
            
            let outputHtml = `<span class="prompt">${getPrompt()}</span>${command}<br>`;
            let shouldAppend = true;
            
            if (cmd === 'ls') {
                const targetDir = args[1] || currentDir;
                const path = resolvePath(currentDir, targetDir);
                
                let isFile = false;
                const parentDir = path.substring(0, path.lastIndexOf('/')) || '/';
                const baseName = path.substring(path.lastIndexOf('/') + 1);
                if (vfs[parentDir] && vfs[parentDir].includes(baseName)) isFile = true;

                if (vfs[path]) {
                    let lsOutput = vfs[path].map(item => {
                        if (item.endsWith('/')) return `<span style="color: #9effff; font-weight: bold">${item}</span>`;
                        return item;
                    }).join('  ');
                    if (vfs[path].length > 0) outputHtml += `<br>${lsOutput}`;
                } else if (isFile) {
                    outputHtml += `${targetDir}`;
                } else {
                    outputHtml += `ls: cannot access '${targetDir}': No such file or directory`;
                }
            } else if (cmd === 'pwd') {
                outputHtml += currentDir;
            } else if (cmd === 'cd') {
                if (args.length > 2) {
                    outputHtml += `bash: cd: too many arguments`;
                } else {
                    const target = args[1] || '~';
                    let newPath = resolvePath(currentDir, target);
                    
                    let isFile = false;
                    const parentDir = newPath.substring(0, newPath.lastIndexOf('/')) || '/';
                    const baseName = newPath.substring(newPath.lastIndexOf('/') + 1);
                    if (vfs[parentDir] && vfs[parentDir].includes(baseName)) {
                        isFile = true;
                    }

                    if (vfs[newPath]) {
                        currentDir = newPath;
                        if (currentDir === '/home/rivers/projects/candle') {
                            outputHtml += `<br>Navigating to /projects/candle...`;
                            setTimeout(() => window.location.href = '/projects/candle/', 500);
                        }
                    } else if (isFile) {
                        outputHtml += `bash: cd: ${target}: Not a directory`;
                    } else {
                        outputHtml += `bash: cd: ${target}: No such file or directory`;
                    }
                    inputPromptSpan.textContent = getPrompt();
                }
            } else if (cmd === 'cat') {
                if (args.length === 1) {
                    outputHtml += ``; 
                } else {
                    const target = args[1];
                    let targetPath = resolvePath(currentDir, target);
                    
                    if (vfs[targetPath]) {
                        outputHtml += `cat: ${target}: Is a directory`;
                    } else if (targetPath === '/home/rivers/portfolio/links.txt') {
                        outputHtml += `<br><span class="link">[→]</span> <a href="https://linkedin.com/in/riosisraelg" target="_blank">linkedin.com/in/riosisraelg</a><br><span class="link">[→]</span> <a href="https://github.com/riosisraelg" target="_blank">github.com/riosisraelg</a>`;
                    } else if (targetPath === '/home/rivers/portfolio/status.txt') {
                        const curCountdown = document.getElementById('countdown').textContent;
                        const curProgress = document.getElementById('progressBar').textContent;
                        outputHtml += `<br><span class="info">[INFO]</span> Building dev portfolio and career showcase...<br><br><span class="label">ETA:</span> 2026-12-31 | <span class="label">COUNTDOWN:</span> <span>${curCountdown}</span><br><br><span class="label">PROGRESS:</span> <span class="progress-text">${curProgress}</span>`;
                    } else {
                        let isFile = false;
                        const parentDir = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
                        const baseName = targetPath.substring(targetPath.lastIndexOf('/') + 1);
                        if (vfs[parentDir] && vfs[parentDir].includes(baseName)) {
                            isFile = true;
                        }
                        if (isFile) {
                            shouldAppend = false; // We will append manually
                            let fetchPath = targetPath.replace('/home/rivers/portfolio', '');
                            if (fetchPath.startsWith('/')) fetchPath = fetchPath.substring(1);
                            if (fetchPath === '') fetchPath = 'index.html';
                            
                            output.innerHTML = outputHtml + `<br>Reading...`;
                            terminalHistory.appendChild(output);
                            terminalHistory.appendChild(document.createElement('br'));
                            document.querySelector('.terminal-body').scrollTop = document.querySelector('.terminal-body').scrollHeight;
                            
                            try {
                                const response = await fetch(fetchPath + '?t=' + Date.now());
                                if (response.ok) {
                                    const text = await response.text();
                                    const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                                    output.innerHTML = outputHtml + `<br><pre style="white-space: pre-wrap; word-wrap: break-word; color: #a599e9; font-size: 0.8rem; margin-top: 10px;">${escapedText}</pre>`;
                                } else {
                                    output.innerHTML = outputHtml + `<br>cat: ${target}: Permission denied (HTTP ${response.status})`;
                                }
                            } catch (err) {
                                output.innerHTML = outputHtml + `<br>cat: ${target}: Permission denied`;
                            }
                            document.querySelector('.terminal-body').scrollTop = document.querySelector('.terminal-body').scrollHeight;
                        } else {
                            outputHtml += `cat: ${target}: No such file or directory`;
                        }
                    }
                }
            } else if (cmd === 'program') {
                outputHtml += `program: Permission denied. Are you root? (Hint: try using sudo)`;
            } else if (cmd === 'sudo') {
                if (args[1] === 'program') {
                    let newProgress = null;
                    for (let i = 2; i < args.length; i++) {
                        if ((args[i] === '--progress' || args[i] === '-p') && i + 1 < args.length) {
                            newProgress = parseInt(args[i+1], 10);
                        }
                    }
                    
                    if (newProgress !== null && !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
                        currentProgress = newProgress;
                        updateCountdown();
                        outputHtml += `[sudo] Success: Progress updated to ${newProgress}%`;
                    } else {
                        outputHtml += `Usage: sudo program --progress &lt;0-100&gt;<br>       sudo program -p &lt;0-100&gt;`;
                    }
                } else if (args[1]) {
                    outputHtml += `sudo: ${args[1]}: command not found`;
                } else {
                    outputHtml += `usage: sudo command`;
                }
            } else if (cmd.startsWith('./') || cmd === 'notify-me.sh' || (cmd === 'sh' && args[1] === 'notify-me.sh')) {
                let targetArg = cmd;
                if (cmd === 'notify-me.sh' || cmd === 'sh') targetArg = './notify-me.sh';
                
                let targetPath = resolvePath(currentDir, targetArg);
                
                if (vfs[targetPath]) {
                    outputHtml += `bash: ${args[0]}: Is a directory`;
                } else if (targetPath === '/home/rivers/portfolio/notify-me.sh') {
                    outputHtml += `<br><span class="comment"># Select notification method:</span><br><div class="contact-options" style="margin-top: 10px"><button class="tui-btn hist-email-btn" style="margin-right: 15px">[1] EMAIL</button><button class="tui-btn hist-msg-btn">[2] MESSAGE</button></div>`;
                    setTimeout(() => {
                        output.querySelector('.hist-email-btn').addEventListener('click', () => {
                            document.getElementById('emailBtn').click();
                            document.querySelector('.terminal-body').scrollTop = 0;
                        });
                        output.querySelector('.hist-msg-btn').addEventListener('click', () => {
                            document.getElementById('messageBtn').click();
                            document.querySelector('.terminal-body').scrollTop = 0;
                        });
                    }, 0);
                } else if (targetPath === '/home/rivers/portfolio/index.html' || targetPath === '/home/rivers/portfolio/index') {
                    outputHtml += `<br>Refreshing portfolio...`;
                    setTimeout(() => window.location.reload(), 500);
                } else if (targetPath === '/home/rivers/projects/candle') {
                    outputHtml += `<br>Navigating to /projects/candle...`;
                    setTimeout(() => window.location.href = '/projects/candle/', 500);
                } else {
                    let isFile = false;
                    const parentDir = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
                    const baseName = targetPath.substring(targetPath.lastIndexOf('/') + 1);
                    if (vfs[parentDir] && vfs[parentDir].includes(baseName)) {
                        outputHtml += `bash: ${args[0]}: Permission denied`;
                    } else {
                        outputHtml += `bash: ${args[0]}: No such file or directory`;
                    }
                }
            } else if (cmd === 'candle') {
                outputHtml += `<br>Navigating to /projects/candle...`;
                setTimeout(() => window.location.href = '/projects/candle/', 500);
            } else if (cmd === 'wpf') {
                outputHtml += `<br>Navigating to /projects/welcomePartyRicardoSierra29082026...`;
                setTimeout(() => window.location.href = '/projects/welcomePartyRicardoSierra29082026/', 500);
            } else {
                outputHtml += `bash: ${cmd}: command not found`;
            }
            
            if (shouldAppend) {
                output.innerHTML = outputHtml;
                terminalHistory.appendChild(output);
                terminalHistory.appendChild(document.createElement('br'));
                document.querySelector('.terminal-body').scrollTop = document.querySelector('.terminal-body').scrollHeight;
            }
        }
    });
}

// Draggable Terminal
const terminal = document.querySelector('.terminal');
const terminalHeader = document.querySelector('.terminal-header');

let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

terminalHeader.addEventListener('mousedown', dragStart);
document.addEventListener('mouseup', dragEnd);
document.addEventListener('mousemove', drag);

// Touch support
terminalHeader.addEventListener('touchstart', dragStart, {passive: false});
document.addEventListener('touchend', dragEnd);
document.addEventListener('touchmove', drag, {passive: false});

function dragStart(e) {
    if (e.target.closest('.terminal-controls')) return;

    if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    isDragging = true;
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function drag(e) {
    if (isDragging) {
        // e.preventDefault(); // Sometimes prevents clicking completely, safely omitting since we check target

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        terminal.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
}
