const canvas = document.getElementById('candle-canvas');
const ctx = canvas.getContext('2d');
const interactionLayer = document.getElementById('interaction-layer');
const timerDisplay = document.getElementById('timer');
const infoContainer = document.querySelector('.info-container');
const candleCounterDisplay = document.getElementById('candle-counter');
const burntCountDisplay = document.getElementById('burnt-count');

// Setup canvas for pixel art
const scale = 8; // Scale factor for pixel art look
const logicalWidth = 64;
const logicalHeight = 88; // Taller canvas to fix squishing and allow bigger candle

canvas.width = logicalWidth * scale;
canvas.height = logicalHeight * scale;
ctx.scale(scale, scale);

// State
let isLit = false;
let isPaused = false;
let lastFrameTime = 0;
let animationFrameId;

// Smoke particles state
let smokeParticles = [];

// Load persisted state
let accumulatedTime = parseFloat(localStorage.getItem('accumulatedTime') || '0');
let elapsedTime = parseFloat(localStorage.getItem('elapsedTime') || '0');
let candlesBurnt = parseInt(localStorage.getItem('candlesBurnt') || '0', 10);
let isWaitingForNext = localStorage.getItem('isWaitingForNext') === 'true';
let currentMeltProgress = 0;
let lastSaveTime = 0;

if (candlesBurnt > 0) {
    burntCountDisplay.textContent = candlesBurnt;
    candleCounterDisplay.style.display = 'block';
}

function saveState() {
    localStorage.setItem('accumulatedTime', accumulatedTime);
    localStorage.setItem('elapsedTime', elapsedTime);
    localStorage.setItem('candlesBurnt', candlesBurnt);
    localStorage.setItem('isWaitingForNext', isWaitingForNext);
}

// Candle properties
const candleBaseX = logicalWidth / 2;
const candleBaseY = logicalHeight - 5; // Plate bottom touches the very edge
const candleWidth = 26;
const maxCandleHeight = 60; // Taller candle

// 2 minutes for testing (will revert to 12 hours later)
const MELT_DURATION_MS = 2 * 60 * 1000; 

// Initial progress from saved state
currentMeltProgress = accumulatedTime / MELT_DURATION_MS;
if (currentMeltProgress > 1) currentMeltProgress = 1;
let currentCandleHeight = maxCandleHeight - (maxCandleHeight * currentMeltProgress);

// Format initial timer if session is restored
timerDisplay.textContent = formatTime(elapsedTime); 

// Function to update glow position based on current height
function updateGlowPosition() {
    const flameLogicalY = candleBaseY - currentCandleHeight - 2;
    const flameYPercent = (flameLogicalY / logicalHeight) * 100;
    document.documentElement.style.setProperty('--glow-y', `${flameYPercent}%`);
}

// Initial glow placement
updateGlowPosition();

// Colors
const colors = {
    wax: '#C3B1E1',        // Soft pastel purple
    waxShadow: '#A992C8',  // Slightly darker for shadow
    outline: '#1A1A1A',
    wick: '#1A1A1A',
    flameInner: '#FFF5E1',
    flameMid: '#FFDD00',
    flameOuter: '#FF7B00',
    plate: '#5C4E60',      // Dark purple-ish grey
    plateShadow: '#3D3340',
    star: '#FFDD00',
    blush: '#F7A8B8'       // Soft pink blush
};

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

function drawCandle(timeNow) {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    // Draw Plate
    const plateWidth = 46;
    const plateHeight = 5;
    const plateX = candleBaseX - plateWidth / 2;
    const plateY = candleBaseY;
    
    ctx.fillStyle = colors.plate;
    ctx.fillRect(plateX, plateY, plateWidth, plateHeight);
    // Plate ends (rounded effect)
    ctx.fillRect(plateX - 1, plateY + 1, 1, plateHeight - 2);
    ctx.fillRect(plateX + plateWidth, plateY + 1, 1, plateHeight - 2);
    
    // Plate shadow
    ctx.fillStyle = colors.plateShadow;
    ctx.fillRect(plateX, plateY + plateHeight - 2, plateWidth, 2);
    
    // Sophisticated Wax Pool Simulation
    // Width (Spreading): Wax spreads steadily, but accelerates as the candle walls collapse.
    const widthProgress = Math.pow(currentMeltProgress, 1.5);
    
    // Height (Thickness): Barely increases initially because wax is trapped in the U-shaped hole.
    // Once the candle burns past 50%, the walls start breaking down and wax spills rapidly,
    // causing a massive acceleration in the pool's thickness.
    let heightProgress = 0;
    if (currentMeltProgress <= 0.5) {
        // Very slow initial growth (0 to 10% of total possible height)
        heightProgress = currentMeltProgress * 0.2; 
    } else {
        // Rapid acceleration from 50% onwards (remaining 90% of height)
        const pastHalf = (currentMeltProgress - 0.5) * 2; // normalizes remaining progress to 0.0 - 1.0
        heightProgress = 0.1 + (Math.pow(pastHalf, 2) * 0.9);
    }
    
    const minPoolW = candleWidth + 4;
    const maxPoolW = plateWidth - 2; 
    const poolW = minPoolW + (maxPoolW - minPoolW) * widthProgress;
    const poolH = 2 + (8 * heightProgress); // Starts at 2px thick, maxes out at 10px thick
    
    const poolX = candleBaseX - poolW / 2;
    const poolY = candleBaseY - poolH + 1; // Sit just on top of plate
    
    ctx.fillStyle = colors.wax;
    ctx.fillRect(poolX, poolY, poolW, poolH);
    ctx.fillRect(poolX - 1, poolY + 1, 1, poolH - 1);
    ctx.fillRect(poolX + poolW, poolY + 1, 1, poolH - 1);
    
    ctx.fillStyle = colors.waxShadow;
    ctx.fillRect(poolX + poolW - 6, poolY, 6, poolH);
    
    // Draw Candle Body (Flat Top)
    const bodyStartX = candleBaseX - candleWidth / 2;
    const bodyStartY = candleBaseY - currentCandleHeight;
    
    ctx.fillStyle = colors.wax;
    ctx.fillRect(bodyStartX, bodyStartY, candleWidth, currentCandleHeight);
    
    // Right body shadow (outer)
    ctx.fillStyle = colors.waxShadow;
    ctx.fillRect(bodyStartX + candleWidth - 5, bodyStartY, 5, currentCandleHeight);
    
    // Cute Face Stages (dynamically avoids falling off the bottom as it melts!)
    let faceOffset = Math.min(10, Math.max(1, currentCandleHeight - 6));
    const faceY = bodyStartY + faceOffset;
    
    // Draw the face as long as the candle is taller than 5 pixels
    if (currentCandleHeight > 5) {
        ctx.fillStyle = '#1A1A1A'; // eyes and mouth
        
        if (currentMeltProgress < 0.10) {
            // Stage 1: Sleepy / Peaceful (0% - 10%) -> "- _ -"
            ctx.fillRect(bodyStartX + 7, faceY + 1, 2, 1); // left eye
            ctx.fillRect(bodyStartX + 17, faceY + 1, 2, 1); // right eye
            ctx.fillRect(bodyStartX + 12, faceY + 1, 2, 1); // mouth
        } 
        else if (currentMeltProgress < 0.15) {
            // Stage 1.5: Waking up / Blinking (10% - 15%)
            const isBlinkOpen = Math.sin(timeNow / 150) > 0;
            if (isBlinkOpen) {
                ctx.fillRect(bodyStartX + 7, faceY, 2, 2); 
                ctx.fillRect(bodyStartX + 17, faceY, 2, 2);
            } else {
                ctx.fillRect(bodyStartX + 7, faceY + 1, 2, 1);
                ctx.fillRect(bodyStartX + 17, faceY + 1, 2, 1);
            }
            ctx.fillRect(bodyStartX + 12, faceY + 1, 2, 1);
        }
        else if (currentMeltProgress < 0.6) {
            // Stage 2: Awake / Patient (15% - 60%) -> "o _ o"
            ctx.fillRect(bodyStartX + 7, faceY, 2, 2); // left eye open
            ctx.fillRect(bodyStartX + 17, faceY, 2, 2); // right eye open
            ctx.fillRect(bodyStartX + 12, faceY + 1, 2, 1); // mouth
        } 
        else if (currentMeltProgress < 0.85) {
            // Stage 3: Worried (60% - 85%) -> "/o _ o\"
            ctx.fillRect(bodyStartX + 7, faceY, 2, 2); // left eye open
            ctx.fillRect(bodyStartX + 17, faceY, 2, 2); // right eye open
            ctx.fillRect(bodyStartX + 12, faceY + 2, 2, 1); // mouth lowered
            // Left worried eyebrow
            ctx.fillRect(bodyStartX + 7, faceY - 2, 1, 1);
            ctx.fillRect(bodyStartX + 8, faceY - 3, 1, 1);
            // Right worried eyebrow
            ctx.fillRect(bodyStartX + 18, faceY - 2, 1, 1);
            ctx.fillRect(bodyStartX + 17, faceY - 3, 1, 1);
        } 
        else {
            // Stage 4: Dizzy / Exhausted (85% - 100%) -> "> O <"
            // Left eye ">"
            ctx.fillRect(bodyStartX + 7, faceY, 1, 1);
            ctx.fillRect(bodyStartX + 8, faceY + 1, 1, 1);
            ctx.fillRect(bodyStartX + 7, faceY + 2, 1, 1);
            // Right eye "<"
            ctx.fillRect(bodyStartX + 18, faceY, 1, 1);
            ctx.fillRect(bodyStartX + 17, faceY + 1, 1, 1);
            ctx.fillRect(bodyStartX + 18, faceY + 2, 1, 1);
            // Open mouth "O"
            ctx.fillRect(bodyStartX + 12, faceY + 2, 2, 2); 
        }
        
        ctx.fillStyle = colors.blush; // blush
        ctx.fillRect(bodyStartX + 4, faceY + 1, 2, 1);
        ctx.fillRect(bodyStartX + 20, faceY + 1, 2, 1);
    }
    
    // Draw wick
    const wickHeight = 4;
    const wickX = candleBaseX - 1;
    const wickY = bodyStartY - wickHeight;
    ctx.fillStyle = colors.wick;
    ctx.fillRect(wickX, wickY, 2, wickHeight);
    
    // Smoke Particles Simulation
    if (!isLit || isWaitingForNext) {
        if (Math.random() < 0.08) { // 8% chance per frame to spawn smoke
            smokeParticles.push({
                x: wickX + 0.5 + (Math.random() * 2 - 1),
                y: wickY - 1,
                life: 1.0,
                velY: -0.15 - Math.random() * 0.1,
                velX: (Math.random() - 0.5) * 0.04,
                size: 1 + Math.random()
            });
        }
    }
    
    // Draw and update smoke
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        let p = smokeParticles[i];
        p.x += p.velX;
        p.y += p.velY;
        p.life -= 0.004; // Slow fade (lives for ~250 frames)
        p.velX += (Math.random() - 0.5) * 0.005; // Very subtle sway
        
        if (p.life <= 0) {
            smokeParticles.splice(i, 1);
            continue;
        }
        
        ctx.fillStyle = `rgba(200, 200, 210, ${p.life * 0.35})`; 
        ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.size), Math.round(p.size));
    }
    
    if (isLit && !isPaused) {
        drawFlame(wickX + 1, wickY, timeNow);
    }
}

function drawFlame(baseX, baseY, timeNow) {
    // Refined smooth teardrop pixel art flame
    const flickerX = Math.sin(timeNow * 0.004) * 0.5; // Slower flicker
    const heightFlicker = Math.sin(timeNow * 0.007) * 1; // Slower flicker
    
    const fx = Math.floor(baseX + flickerX);
    const fy = Math.floor(baseY - 1);
    
    // Outer flame (Teardrop shape)
    ctx.fillStyle = colors.flameOuter;
    ctx.fillRect(fx - 3, fy - 4 + heightFlicker, 7, 5); // base
    ctx.fillRect(fx - 4, fy - 2 + heightFlicker, 9, 3); // wide part
    ctx.fillRect(fx - 2, fy - 6 + heightFlicker, 5, 2); // mid-top
    ctx.fillRect(fx - 1, fy - 8 + heightFlicker, 3, 2); // tip
    ctx.fillRect(fx, fy - 10 + heightFlicker, 1, 2);    // sharp tip
    
    // Mid flame
    ctx.fillStyle = colors.flameMid;
    ctx.fillRect(fx - 2, fy - 3 + heightFlicker, 5, 3);
    ctx.fillRect(fx - 1, fy - 5 + heightFlicker, 3, 2);
    ctx.fillRect(fx, fy - 7 + heightFlicker, 1, 2);
    
    // Inner flame
    ctx.fillStyle = colors.flameInner;
    ctx.fillRect(fx - 1, fy - 1, 3, 2);
    ctx.fillRect(fx, fy - 3, 1, 2);
    
    // Magical Stars (Up to 3)
    const stars = [
        { dx: 9, dy: -12, phaseOffset: 0, speed: 0.001 },
        { dx: -8, dy: -6, phaseOffset: 2, speed: 0.0015 },
        { dx: 7, dy: 1, phaseOffset: 4, speed: 0.0008 }
    ];
    
    stars.forEach(star => {
        const starOpacity = (Math.sin(timeNow * star.speed + star.phaseOffset) + 1) / 2;
        if (starOpacity > 0.6) {
            ctx.fillStyle = colors.star;
            const starX = fx + star.dx;
            const starY = fy + star.dy;
            ctx.fillRect(starX, starY - 1, 1, 3);
            ctx.fillRect(starX - 1, starY, 3, 1);
        }
    });
}

function update(timeNow) {
    if (!lastFrameTime) lastFrameTime = timeNow;
    const deltaTime = timeNow - lastFrameTime;

    if (isLit && !isPaused && !isWaitingForNext) {
        accumulatedTime += deltaTime;
        
        // Melting logic
        currentMeltProgress = accumulatedTime / MELT_DURATION_MS;
        if (currentMeltProgress > 1) currentMeltProgress = 1;
        currentCandleHeight = maxCandleHeight - (maxCandleHeight * currentMeltProgress);
        
        // If candle fully melted
        if (currentMeltProgress >= 1) {
            isLit = false; // flame out
            isWaitingForNext = true; // wait for click to restart
            candlesBurnt++;
            burntCountDisplay.textContent = candlesBurnt;
            candleCounterDisplay.style.display = 'block';
            saveState();
        }
        
        // Total elapsed time for timer display
        elapsedTime += deltaTime;
        timerDisplay.textContent = formatTime(elapsedTime);
        
        // Throttle saving state to localStorage to roughly once per second
        if (timeNow - lastSaveTime > 1000) {
            saveState();
            lastSaveTime = timeNow;
        }
        
        // Update dynamic fire glow position
        updateGlowPosition();
        
        // Update ambient glow
        document.documentElement.style.setProperty('--fire-glow', 'rgba(255, 160, 0, 0.7)');
        document.documentElement.style.setProperty('--ambient-glow', 'rgba(255, 123, 0, 0.18)');
    } else if ((isLit && isPaused) || isWaitingForNext) {
        document.documentElement.style.setProperty('--fire-glow', 'rgba(255, 160, 0, 0)');
        document.documentElement.style.setProperty('--ambient-glow', 'rgba(255, 123, 0, 0.05)');
    }
    
    lastFrameTime = timeNow;
    drawCandle(timeNow);
    animationFrameId = requestAnimationFrame(update);
}

requestAnimationFrame(update);

async function notifyJames() {
    try {
        const res = await fetch('/api/notify', {
            method: 'POST'
        });
        if (!res.ok) {
            console.error('Failed to notify James');
        }
    } catch (e) {
        console.error('Error hitting notify API:', e);
    }
}

// Hidden Interaction
interactionLayer.addEventListener('click', () => {
    if (isWaitingForNext) {
        // Start a brand new candle
        isWaitingForNext = false;
        isLit = true;
        isPaused = false;
        accumulatedTime = 0;
        currentMeltProgress = 0;
        currentCandleHeight = maxCandleHeight;
        lastFrameTime = performance.now();
        saveState();
        notifyJames(); // Notify him again!
    } else if (!isLit) {
        isLit = true;
        isPaused = false;
        lastFrameTime = performance.now();
        infoContainer.classList.add('visible');
        notifyJames();
    } else {
        // Toggle pause
        isPaused = !isPaused;
        saveState();
    }
});

// End the daily session by clicking the timer
timerDisplay.addEventListener('click', () => {
    isLit = false;
    isPaused = false;
    elapsedTime = 0; // Reset session timer to 0
    timerDisplay.textContent = formatTime(elapsedTime);
    infoContainer.classList.remove('visible'); // Hide timer until next session
    
    // Extinguish glows immediately
    document.documentElement.style.setProperty('--fire-glow', 'rgba(255, 160, 0, 0)');
    document.documentElement.style.setProperty('--ambient-glow', 'rgba(255, 123, 0, 0.05)');
    
    saveState();
});

// Show timer initially if session has been running before
if (elapsedTime > 0 || isWaitingForNext) {
    infoContainer.classList.add('visible');
}
