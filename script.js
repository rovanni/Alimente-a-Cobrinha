// ==================== SISTEMA DE SOM ====================
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playEat() {
        this.playTone(523.25, 0.1, 'sine', 0.4);
        setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.4), 50);
        setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.4), 100);
    }

    playGameOver() {
        this.playTone(392, 0.15, 'square', 0.3);
        setTimeout(() => this.playTone(349.23, 0.15, 'square', 0.3), 150);
        setTimeout(() => this.playTone(329.63, 0.15, 'square', 0.3), 300);
        setTimeout(() => this.playTone(261.63, 0.3, 'square', 0.4), 450);
    }

    playMove() {
        this.playTone(200, 0.03, 'sine', 0.1);
    }

    playStart() {
        this.playTone(261.63, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(329.63, 0.1, 'sine', 0.3), 100);
        setTimeout(() => this.playTone(392, 0.15, 'sine', 0.3), 200);
        setTimeout(() => this.playTone(523.25, 0.2, 'sine', 0.4), 300);
    }

    playLevelUp() {
        this.playTone(440, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.3), 100);
        setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.3), 200);
        setTimeout(() => this.playTone(880, 0.15, 'sine', 0.4), 300);
    }

    playMedal() {
        this.playTone(523.25, 0.12, 'sine', 0.4);
        setTimeout(() => this.playTone(659.25, 0.12, 'sine', 0.4), 120);
        setTimeout(() => this.playTone(783.99, 0.12, 'sine', 0.4), 240);
        setTimeout(() => this.playTone(1046.5, 0.2, 'sine', 0.5), 360);
    }

    playWallHit() {
        this.playTone(150, 0.15, 'square', 0.3);
        setTimeout(() => this.playTone(100, 0.2, 'square', 0.3), 100);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ==================== SISTEMA DE MÚSICA ====================
class MusicManager {
    constructor() {
        this.audio = null;
        this.enabled = true;
        this.tracks = [
            'music/leberch-playful-441727.mp3',
            'music/maksymmalko-playful-playful-music-604986.mp3'
        ];
        this.currentTrack = 0;
    }

    init() {
        this.audio = new Audio();
        // Sem loop: ao terminar uma faixa, toca a próxima da lista
        this.audio.loop = this.tracks.length < 2;
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.volume = 0.3;
        this.loadTrack();
    }

    loadTrack() {
        if (!this.audio) return;
        this.audio.src = this.tracks[this.currentTrack];
        this.audio.load();
    }

    play() {
        if (!this.enabled || !this.audio) return;
        this.audio.play().catch(() => { });
    }

    pause() {
        if (!this.audio) return;
        this.audio.pause();
    }

    nextTrack() {
        if (this.tracks.length < 2) return;
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.loadTrack();
        if (this.enabled) this.play();
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.play();
        } else {
            this.pause();
        }
        return this.enabled;
    }
}

// ==================== SISTEMA DE MEDALHAS ====================
const MEDAL_TIERS = [
    { score: 1000, name: 'Bronze', icon: '🥉', color: '#CD7F32' },
    { score: 2500, name: 'Prata', icon: '🥈', color: '#C0C0C0' },
    { score: 5000, name: 'Ouro', icon: '🥇', color: '#FFD700' },
    { score: 10000, name: 'Diamante', icon: '💎', color: '#B9F2FF' }
];

// ==================== CONFIGURAÇÕES DE DIFICULDADE ====================
// Quantas comidas são necessárias para subir de nível
const FOODS_PER_LEVEL = 5;

const DIFFICULTY = {
    easy: {
        name: 'Fácil',
        speed: 180,
        wallCollision: false,
        speedIncreaseInterval: 30000, // 30 segundos
        speedIncreaseAmount: 5,
        levelTime: 30000, // 30s por nível
        label: '🟢'
    },
    normal: {
        name: 'Normal',
        speed: 150,
        wallCollision: true,
        speedIncreaseInterval: 0,
        speedIncreaseAmount: 0,
        levelTime: 25000,
        label: '🟡'
    },
    hard: {
        name: 'Difícil',
        speed: 120,
        wallCollision: true,
        speedIncreaseInterval: 30000, // 30 segundos
        speedIncreaseAmount: 8,
        levelTime: 20000,
        label: '🔴'
    }
};

// ==================== VARIÁVEIS GLOBAIS ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const soundManager = new SoundManager();
const musicManager = new MusicManager();

let difficulty = 'normal';
let gridSize = 20;
let snake = [];
const FOODS = ['🍎','🍌','🍇','🍓','🍉','🍊','🍒','🍍','🥕','🌽','🍕','🍔','🍩','🧀'];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let level = 1;
let foodsEaten = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let paused = false;
let gameLoop = null;
let speed = 150;
let currentMedal = null;
let gameTime = 0;
let gameTimer = null;
let speedTimer = null;

document.getElementById('highScore').textContent = highScore;

// ==================== SISTEMA DE RECORDS ====================
const RECORDS_KEY = 'snake-records';
let records = { easy: [], normal: [], hard: [] };

function loadRecords() {
    const stored = localStorage.getItem(RECORDS_KEY);
    if (stored) {
        records = JSON.parse(stored);
    }
}

function saveRecord(diff, score, level, time, medal) {
    const entry = {
        score,
        level,
        time,
        medal: medal ? medal.name : null,
        medalIcon: medal ? medal.icon : null,
        date: new Date().toLocaleDateString('pt-BR')
    };

    if (!records[diff]) records[diff] = [];
    records[diff].push(entry);
    records[diff].sort((a, b) => b.score - a.score);
    records[diff] = records[diff].slice(0, 10);

    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

function renderRecords(diff) {
    const list = document.getElementById('recordsList');
    const recs = records[diff] || [];

    if (recs.length === 0) {
        list.innerHTML = '<p class="no-records">Nenhum record ainda. Jogue para registrar!</p>';
        return;
    }

    const ranks = ['🥇', '🥈', '🥉', '4º', '5º', '6º', '7º', '8º', '9º', '10º'];

    list.innerHTML = recs.map((r, i) => `
        <div class="record-entry">
            <span class="record-rank">${ranks[i]}</span>
            <div class="record-info">
                <div class="record-score">${r.score.toLocaleString('pt-BR')} pts</div>
                <div class="record-details">Nível ${r.level} · ${r.time} · ${r.date}</div>
            </div>
            ${r.medalIcon ? `<span class="record-medal" title="${r.medal}">${r.medalIcon}</span>` : ''}
        </div>
    `).join('');
}

loadRecords();

// ==================== RESPONSIVIDADE ====================
// O tabuleiro tem sempre 25x25 casas; o CSS escala o canvas para caber na área de jogo.
canvas.width = 500;
canvas.height = 500;

// ==================== TOAST ====================
let toastTimeout = null;

function showToast(icon, text, type = '') {
    const toast = document.getElementById('toast');
    document.getElementById('toastIcon').textContent = icon;
    document.getElementById('toastText').textContent = text;

    toast.className = 'toast show ' + type;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
}

// ==================== MEDALHAS ====================
function checkMedals() {
    let newMedal = null;
    for (let i = MEDAL_TIERS.length - 1; i >= 0; i--) {
        if (score >= MEDAL_TIERS[i].score) {
            newMedal = MEDAL_TIERS[i];
            break;
        }
    }

    if (newMedal && newMedal !== currentMedal) {
        currentMedal = newMedal;
        updateMedalDisplay();
        soundManager.playMedal();
        showToast(newMedal.icon, `Medalha ${newMedal.name}!`, 'medal');
    }
}

function updateMedalDisplay() {
    const medalIcon = document.getElementById('medalIcon');
    const medalName = document.getElementById('medalName');

    if (currentMedal) {
        medalIcon.textContent = currentMedal.icon;
        medalName.textContent = currentMedal.name;
        medalName.style.color = currentMedal.color;
    } else {
        medalIcon.textContent = '🏅';
        medalName.textContent = 'Iniciante';
        medalName.style.color = '';
    }
}

// ==================== TIMER E NÍVEL ====================
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimer() {
    gameTime += 1000;
    document.getElementById('timerDisplay').textContent = `⏱️ ${formatTime(gameTime)}`;
}

function updateLevelProgress() {
    const inLevel = foodsEaten % FOODS_PER_LEVEL;
    document.getElementById('levelProgressBar').style.width = (inLevel / FOODS_PER_LEVEL * 100) + '%';
}

function checkLevelUp() {
    if (foodsEaten < level * FOODS_PER_LEVEL) return;

    level++;
    document.getElementById('level').textContent = level;

    // Aumentar velocidade no normal/difícil ao subir de nível
    if (difficulty !== 'easy' && speed > 60) {
        speed -= 10;
        restartGameLoop();
    }

    soundManager.playLevelUp();
    showToast('⬆️', `Nível ${level}!`, 'level-up');

}

function restartGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        if (gameRunning) update();
    }, speed);
}

// ==================== INICIALIZAR JOGO ====================
function initGame() {
    const diff = DIFFICULTY[difficulty];
    const gridCount = canvas.width / gridSize;
    snake = [
        { x: Math.floor(gridCount / 2), y: Math.floor(gridCount / 2) }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    foodsEaten = 0;
    speed = diff.speed;
    gameTime = 0;
    currentMedal = null;

    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('timerDisplay').textContent = '⏱️ 00:00';
    document.getElementById('levelProgressBar').style.width = '0%';
    updateMedalDisplay();

    spawnFood();
}

// ==================== GERAR COMIDA ====================
function spawnFood() {
    const gridCount = canvas.width / gridSize;
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    newFood.icon = FOODS[Math.floor(Math.random() * FOODS.length)];
    food = newFood;
}

// ==================== DESENHAR ====================
function draw() {
    // Fundo
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid sutil
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Comida
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;

    const gradient = ctx.createRadialGradient(
        foodX + gridSize / 2, foodY + gridSize / 2, 0,
        foodX + gridSize / 2, foodY + gridSize / 2, gridSize
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(foodX - gridSize / 2, foodY - gridSize / 2, gridSize * 2, gridSize * 2);

    ctx.font = (gridSize - 2) + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(food.icon, foodX + gridSize / 2, foodY + gridSize / 2 + 1);

    // Cobra
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;

        const hue = 140 + (index * 2) % 40;
        const saturation = 100 - (index * 2) % 30;
        const lightness = 50 - (index * 1) % 20;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        if (index === 0) {
            ctx.save();
            ctx.translate(x + gridSize / 2, y + gridSize / 2);
            ctx.rotate(Math.atan2(direction.y, direction.x)); // frente da cobra = eixo +x

            // Língua bifurcada
            ctx.strokeStyle = '#ff3b5c';
            ctx.lineWidth = 1.6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(9, 0); ctx.lineTo(14, 0);
            ctx.moveTo(14, 0); ctx.lineTo(17, -2.5);
            ctx.moveTo(14, 0); ctx.lineTo(17, 2.5);
            ctx.stroke();

            // Cabeça com degradê
            const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 12);
            g.addColorStop(0, '#7dffc0');
            g.addColorStop(1, '#00d46e');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.roundRect(-gridSize / 2 + 0.5, -gridSize / 2 + 0.5, gridSize - 1, gridSize - 1, 8);
            ctx.fill();

            // Narinas
            ctx.fillStyle = '#0a6b3d';
            ctx.beginPath();
            ctx.arc(7.5, -2, 0.9, 0, Math.PI * 2);
            ctx.arc(7.5, 2, 0.9, 0, Math.PI * 2);
            ctx.fill();

            // Olhos grandes com pupila e brilho
            for (const ey of [-5, 5]) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(2.5, ey, 3.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#12202b';
                ctx.beginPath();
                ctx.arc(3.6, ey, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(4.2, ey - 0.8, 0.7, 0, Math.PI * 2);
                ctx.fill();
            }

            // Bochechas rosadas
            ctx.fillStyle = 'rgba(255, 105, 150, 0.45)';
            ctx.beginPath();
            ctx.arc(-4, -7, 1.8, 0, Math.PI * 2);
            ctx.arc(-4, 7, 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        } else {
            const isTail = index === snake.length - 1;
            const t = index / Math.max(snake.length - 1, 1);   // 0 = perto da cabeça, 1 = ponta da cauda
            const h = 150 - t * 25;                            // verde -> verde-azulado
            const light = 46 - t * 12;
            const inset = isTail ? 4 : 1.5;                    // cauda mais fina
            const cx = x + gridSize / 2, cy = y + gridSize / 2;
            const size = gridSize - inset * 2;

            // Liga este segmento ao anterior para o corpo ficar contínuo
            const prev = snake[index - 1];
            if (Math.abs(prev.x - segment.x) + Math.abs(prev.y - segment.y) === 1) {
                const mx = (prev.x - segment.x) * gridSize / 2;
                const my = (prev.y - segment.y) * gridSize / 2;
                ctx.fillStyle = `hsl(${h}, 75%, ${light - 6}%)`;
                ctx.fillRect(cx + mx - size / 2, cy + my - size / 2, size, size);
            }

            // Corpo com degradê (mais claro em cima, escuro embaixo)
            const grad = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
            grad.addColorStop(0, `hsl(${h}, 85%, ${light + 12}%)`);
            grad.addColorStop(1, `hsl(${h}, 75%, ${light - 8}%)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x + inset, y + inset, size, size, isTail ? 8 : 6);
            ctx.fill();

            // Escamas: losango alternado em cada segmento
            if (!isTail) {
                ctx.fillStyle = index % 2 === 0 ? 'rgba(0, 60, 40, 0.35)' : 'rgba(255, 235, 120, 0.45)';
                ctx.beginPath();
                ctx.moveTo(cx, cy - 4.5);
                ctx.lineTo(cx + 4.5, cy);
                ctx.lineTo(cx, cy + 4.5);
                ctx.lineTo(cx - 4.5, cy);
                ctx.closePath();
                ctx.fill();
            }

            // Brilho
            ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.beginPath();
            ctx.ellipse(cx - 2.5, cy - 3.5, 3.5, 1.6, -0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// ==================== ATUALIZAR JOGO ====================
function update() {
    direction = { ...nextDirection };

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const gridCount = canvas.width / gridSize;
    const diff = DIFFICULTY[difficulty];

    // Colisão com paredes (normal e difícil)
    if (diff.wallCollision) {
        if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
            soundManager.playWallHit();
            gameOver();
            return;
        }
    } else {
        // Atravessar paredes (fácil)
        if (head.x < 0) head.x = gridCount - 1;
        if (head.x >= gridCount) head.x = 0;
        if (head.y < 0) head.y = gridCount - 1;
        if (head.y >= gridCount) head.y = 0;
    }

    // Colisão com si mesmo
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Comer comida
    if (head.x === food.x && head.y === food.y) {
        score += 10 * level; // Multiplicador por nível
        foodsEaten++;
        document.getElementById('score').textContent = score;
        soundManager.playEat();
        spawnFood();
        checkMedals();
        checkLevelUp();
        updateLevelProgress();
    } else {
        snake.pop();
    }

    draw();
}

// ==================== GAME OVER ====================
function gameOver(manual = false) {
    gameRunning = false;
    setGameButtons(false);
    paused = true;
    clearInterval(gameLoop);
    clearInterval(gameTimer);
    clearInterval(speedTimer);
    musicManager.pause();

    if (!manual) soundManager.playGameOver();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalTime').textContent = formatTime(gameTime);

    const diff = DIFFICULTY[difficulty];
    document.getElementById('statsSummary').innerHTML = `
        <p>Dificuldade: ${diff.label} ${diff.name}</p>
        <p>Comidas coletadas: ${foodsEaten}</p>
        ${currentMedal ? `<p>Medalha: ${currentMedal.icon} ${currentMedal.name}</p>` : ''}
    `;

    // Salvar record
    saveRecord(difficulty, score, level, formatTime(gameTime), currentMedal);

    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('startBtn').textContent = '▶️ Iniciar Jogo';
    document.getElementById('difficultySelector').style.display = 'flex';
}

// Fechar Game Over
document.getElementById('gameOverClose').addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none';
});

document.getElementById('gameOver').addEventListener('click', (e) => {
    if (e.target === document.getElementById('gameOver')) {
        document.getElementById('gameOver').style.display = 'none';
    }
});

// ==================== INICIAR JOGO ====================
function startGame() {
    soundManager.init();
    musicManager.init();

    soundManager.playStart();
    initGame();

    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('difficultySelector').style.display = 'none';
    setGameButtons(true);

    draw();

    // Loop principal do jogo
    gameLoop = setInterval(() => {
        if (gameRunning && !paused) update();
    }, speed);

    // Timer do jogo
    gameTimer = setInterval(() => {
        if (gameRunning && !paused) {
            updateTimer();
        }
    }, 1000);

    // Aumento de velocidade (fácil e difícil)
    const diff = DIFFICULTY[difficulty];
    if (diff.speedIncreaseInterval > 0) {
        speedTimer = setInterval(() => {
            if (gameRunning && !paused && speed > 60) {
                speed -= diff.speedIncreaseAmount;
                restartGameLoop();
                showToast('⚡', 'Velocidade aumentou!');
            }
        }, diff.speedIncreaseInterval);
    }

    musicManager.play();
}

// ==================== BOTÕES PAUSAR / PARAR ====================
function setGameButtons(playing) {
    document.getElementById('pauseBtn').disabled = !playing;
    document.getElementById('stopBtn').disabled = !playing;
    document.getElementById('startBtn').style.display = playing ? 'none' : 'block';
    document.getElementById('gameButtons').style.display = 'flex';
    document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
}

function stopGame() {
    if (!gameRunning) return;
    gameOver(true);
}

// ==================== PAUSA ====================
function togglePause() {
    if (!gameRunning) return;

    paused = !paused;

    if (paused) {
        clearInterval(gameLoop);
        clearInterval(gameTimer);
        clearInterval(speedTimer);
        musicManager.pause();
        document.getElementById('pauseBtn').textContent = '▶️ Continuar';
        showToast('⏸️', 'Jogo Pausado');
    } else {
        gameLoop = setInterval(() => {
            if (gameRunning && !paused) update();
        }, speed);

        gameTimer = setInterval(() => {
            if (gameRunning && !paused) {
                updateTimer();
            }
        }, 1000);

        const diff = DIFFICULTY[difficulty];
        if (diff.speedIncreaseInterval > 0) {
            speedTimer = setInterval(() => {
                if (gameRunning && !paused && speed > 60) {
                    speed -= diff.speedIncreaseAmount;
                    restartGameLoop();
                    showToast('⚡', 'Velocidade aumentou!');
                }
            }, diff.speedIncreaseInterval);
        }

        musicManager.play();
        document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
        showToast('▶️', 'Jogo Retomado');
    }
}

// ==================== CONTROLES ====================
function handleDirection(newDir) {
    if (!gameRunning) return;

    const opposite = { x: -direction.x, y: -direction.y };

    if (newDir.x !== opposite.x || newDir.y !== opposite.y) {
        nextDirection = newDir;
        soundManager.playMove();
    }
}

// Teclado
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            handleDirection({ x: 0, y: -1 });
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            handleDirection({ x: 0, y: 1 });
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            handleDirection({ x: -1, y: 0 });
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            handleDirection({ x: 1, y: 0 });
            break;
    }
});

// Controles touch
document.getElementById('upBtn').addEventListener('click', () => handleDirection({ x: 0, y: -1 }));
document.getElementById('downBtn').addEventListener('click', () => handleDirection({ x: 0, y: 1 }));
document.getElementById('leftBtn').addEventListener('click', () => handleDirection({ x: -1, y: 0 }));
document.getElementById('rightBtn').addEventListener('click', () => handleDirection({ x: 1, y: 0 }));

// Swipe
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (!gameRunning) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        handleDirection({ x: dx > 0 ? 1 : -1, y: 0 });
    } else {
        handleDirection({ x: 0, y: dy > 0 ? 1 : -1 });
    }
});

// Toggle som
document.getElementById('soundToggle').addEventListener('click', () => {
    const enabled = soundManager.toggle();
    document.getElementById('soundToggle').textContent = enabled ? '🔊' : '🔇';
});

// Toggle música
document.getElementById('musicToggle').addEventListener('click', () => {
    const enabled = musicManager.toggle();
    document.getElementById('musicToggle').textContent = enabled ? '🎵' : '🔇';
});

// Seleção de dificuldade
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.diff;
    });
});

// Botões
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', e => { e.currentTarget.blur(); togglePause(); });
document.getElementById('stopBtn').addEventListener('click', e => { e.currentTarget.blur(); stopGame(); });

// ===== MODAIS =====
// Ajuda
document.getElementById('helpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('show');
});

document.getElementById('helpClose').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('show');
});

document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('helpModal')) {
        document.getElementById('helpModal').classList.remove('show');
    }
});

// Records
document.getElementById('recordsBtn').addEventListener('click', () => {
    renderRecords('easy');
    document.getElementById('recordsModal').classList.add('show');
});

document.getElementById('recordsClose').addEventListener('click', () => {
    document.getElementById('recordsModal').classList.remove('show');
});

document.getElementById('recordsModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('recordsModal')) {
        document.getElementById('recordsModal').classList.remove('show');
    }
});

// Tabs de records
document.querySelectorAll('.record-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.record-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderRecords(tab.dataset.tab);
    });
});

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('helpModal').classList.remove('show');
        document.getElementById('recordsModal').classList.remove('show');
        document.getElementById('gameOver').style.display = 'none';
    }
});

// Desenhar estado inicial
setGameButtons(false);
initGame();
draw();
