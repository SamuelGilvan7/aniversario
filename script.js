// --- CONFIGURAÇÃO DA MÚSICA LOCAL (MP3) ---
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const musicIcon = document.getElementById('music-icon');
const musicStatus = document.getElementById('music-status');
let isPlaying = false;
let hasInteracted = false;

function toggleMusic() {
    if (!music) return;
    
    if (isPlaying) {
        music.pause();
        if (musicIcon) musicIcon.className = "fas fa-play text-sm sm:text-base ml-0.5";
        if (musicStatus) musicStatus.innerText = "Pausado";
        isPlaying = false;
    } else {
        music.play().then(() => {
            if (musicIcon) musicIcon.className = "fas fa-pause text-sm sm:text-base";
            if (musicStatus) musicStatus.innerText = "Tocando nossa música ❤️";
            isPlaying = true;
            hasInteracted = true;
        }).catch(err => {
            console.log("Erro ao reproduzir áudio:", err);
        });
    }
}

// Dispara com qualquer toque ou clique em qualquer lugar da tela
const enableAudioOnTouch = () => {
    if (!hasInteracted && music) {
        music.play().then(() => {
            if (musicIcon) musicIcon.className = "fas fa-pause text-sm sm:text-base";
            if (musicStatus) musicStatus.innerText = "Tocando nossa música ❤️";
            isPlaying = true;
            hasInteracted = true;
            
            // Remove os ouvintes após disparar com sucesso
            window.removeEventListener('click', enableAudioOnTouch);
            window.removeEventListener('touchstart', enableAudioOnTouch);
            window.removeEventListener('touchend', enableAudioOnTouch);
        }).catch(err => {
            // Caso o navegador bloqueie, aguarda o próximo toque
        });
    }
};

window.addEventListener('click', enableAudioOnTouch);
window.addEventListener('touchstart', enableAudioOnTouch);
window.addEventListener('touchend', enableAudioOnTouch);
// --- INTERSEÇÃO DOS MOMENTOS (REVEAL) ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

document.querySelectorAll('.momento-item').forEach(item => {
    observer.observe(item);
});

function scrollToFirstSection() {
    const first = document.querySelector('.momento-item');
    if (first) {
        first.scrollIntoView({ behavior: 'smooth' });
    }
}


// --- TRILHA DE PEGADAS ANIMADAS NO CANVAS ---
const fpCanvas = document.getElementById('footprint-canvas');
const fpCtx = fpCanvas ? fpCanvas.getContext('2d') : null;
const timelineContainer = document.getElementById('timeline-container');

let stepsCount = 45; 
let footprintList = [];

function initFootprintPath() {
    if (!timelineContainer || !fpCanvas) return;

    const isMobile = window.innerWidth < 768;
    const totalHeight = timelineContainer.offsetHeight;

    fpCanvas.width = isMobile ? 70 : 140;
    fpCanvas.height = totalHeight;

    footprintList = [];
    const stepSpacing = totalHeight / stepsCount;

    for (let i = 0; i < stepsCount; i++) {
        const isLeft = i % 2 === 0;
        footprintList.push({
            x: isMobile ? (isLeft ? 20 : 45) : (isLeft ? 45 : 95),
            y: i * stepSpacing + 30,
            isLeft: isLeft,
            currentOpacity: 0
        });
    }
}

function drawFootprint(ctx, x, y, isLeft, opacity, scale = 1) {
    if (!ctx || opacity <= 0.01) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(isLeft ? scale : -scale, -scale);

    ctx.fillStyle = `rgba(224, 169, 109, ${opacity})`;

    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 12, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-1, 14, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const toes = [
        { x: -4, y: -15, r: 1.8 },
        { x: -1, y: -17, r: 2.0 },
        { x: 2, y: -16, r: 1.7 },
        { x: 5, y: -14, r: 1.4 },
        { x: 7, y: -12, r: 1.2 }
    ];

    toes.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function updateFootprintsOnScroll() {
    if (!timelineContainer || !fpCtx || !fpCanvas) return;

    const rect = timelineContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const scrollProgress = (windowHeight * 0.65 - rect.top) / rect.height;
    const currentStepFloat = scrollProgress * stepsCount;

    fpCtx.clearRect(0, 0, fpCanvas.width, fpCanvas.height);

    footprintList.forEach((step, index) => {
        const distance = currentStepFloat - index;
        let targetOpacity = 0;

        if (distance >= 0) {
            if (distance < 1.5) {
                targetOpacity = (distance / 1.5) * 0.85;
            } else {
                targetOpacity = Math.max(0.25, 0.85 - (distance - 1.5) * 0.02);
            }
        }

        step.currentOpacity += (targetOpacity - step.currentOpacity) * 0.15;

        const isTopStep = Math.floor(currentStepFloat) === index;
        const scale = isTopStep ? 1.15 : 1.0;

        drawFootprint(fpCtx, step.x, step.y, step.isLeft, step.currentOpacity, scale);
    });
}

let isTicking = false;
window.addEventListener('scroll', () => {
    if (!isTicking) {
        window.requestAnimationFrame(() => {
            updateFootprintsOnScroll();
            isTicking = false;
        });
        isTicking = true;
    }
});

window.addEventListener('resize', () => {
    initFootprintPath();
    updateFootprintsOnScroll();
});

window.addEventListener('load', () => {
    initFootprintPath();
    updateFootprintsOnScroll();
});


// --- LÓGICA DO BOTÃO "NÃO" FUJÃO ---
const noBtn = document.getElementById('no-btn');
const buttonsContainer = document.getElementById('proposal-buttons-container');

function moveNoButton(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (!noBtn || !buttonsContainer) return;

    const containerRect = buttonsContainer.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const maxX = Math.max(20, containerRect.width - btnRect.width - 20);
    const maxY = Math.max(20, containerRect.height - btnRect.height);

    const randomX = Math.floor(Math.random() * (maxX - 10)) + 5;
    const randomY = Math.floor((Math.random() - 0.5) * (maxY * 0.8));

    noBtn.style.position = 'absolute';
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
    noBtn.style.zIndex = '30';
}

if (noBtn) {
    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('touchstart', moveNoButton);
}


// --- MODAL E ANIMAÇÃO DE CORAÇÕES NO FUNDO ---
function acceptProposal() {
    const modal = document.getElementById('celebration-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    if (typeof hearts !== 'undefined' && Array.isArray(hearts)) {
        hearts.forEach(h => {
            h.speed *= 2.5;
            h.size *= 1.3;
        });
    }
}

function closeModal() {
    const modal = document.getElementById('celebration-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

const heartCanvas = document.getElementById('heart-canvas');
const hCtx = heartCanvas ? heartCanvas.getContext('2d') : null;
let hearts = [];

function resizeHeartCanvas() {
    if (!heartCanvas) return;
    heartCanvas.width = window.innerWidth;
    heartCanvas.height = window.innerHeight;
}

function initHearts() {
    if (!heartCanvas) return;
    resizeHeartCanvas();
    hearts = [];
    const count = Math.floor(window.innerWidth / 25);
    for (let i = 0; i < count; i++) {
        hearts.push({
            x: Math.random() * heartCanvas.width,
            y: Math.random() * heartCanvas.height,
            size: Math.random() * 12 + 8,
            speed: Math.random() * 0.7 + 0.3,
            opacity: Math.random() * 0.4 + 0.15,
            swing: Math.random() * 2,
            swingSpeed: Math.random() * 0.02 + 0.01
        });
    }
}

function drawHeart(x, y, size, color) {
    if (!hCtx) return;
    hCtx.save();
    hCtx.translate(x, y);
    hCtx.beginPath();
    hCtx.fillStyle = color;
    const topCurveHeight = size * 0.3;
    hCtx.moveTo(0, topCurveHeight);
    hCtx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    hCtx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
    hCtx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    hCtx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    hCtx.closePath();
    hCtx.fill();
    hCtx.restore();
}

function animateHearts() {
    if (!heartCanvas || !hCtx) return;
    hCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

    hearts.forEach(h => {
        h.y -= h.speed;
        h.swing += h.swingSpeed;
        const currentX = h.x + Math.sin(h.swing) * 15;

        if (h.y < -30) {
            h.y = heartCanvas.height + 20;
            h.x = Math.random() * heartCanvas.width;
        }

        drawHeart(currentX, h.y, h.size, `rgba(224, 169, 109, ${h.opacity})`);
    });

    requestAnimationFrame(animateHearts);
}


window.addEventListener('resize', resizeHeartCanvas);
window.addEventListener('load', () => {
    initHearts();
    animateHearts();
});

