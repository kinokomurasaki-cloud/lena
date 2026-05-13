// ========== ЗВУКИ ==========
const croakAudio = new Audio();
croakAudio.src = "images/frog-croaking.mp3";
croakAudio.volume = 0.7;
croakAudio.preload = "auto";

function playCroak() {
    if (croakAudio) {
        croakAudio.currentTime = 0;
        croakAudio.play().catch(e => console.log("Ошибка КВА:", e));
    }
}

const burpAudio = new Audio();
burpAudio.src = "images/Звук отрыжки Барни Гамбла из Симпсонов.mp3";
burpAudio.volume = 0.6;
burpAudio.preload = "auto";

function playBurp() {
    if (burpAudio) {
        burpAudio.currentTime = 0;
        burpAudio.play().catch(e => console.log("Ошибка отрыжки:", e));
    }
}

// Фоновая музыка
const bgMusic = document.getElementById('bgMusic');
const scrollTopBtn = document.getElementById('scrollTopBtn');
let isMusicPlaying = false;

function startMusic() {
    if (!isMusicPlaying) {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            scrollTopBtn.classList.add('rotating');
        }).catch(e => {
            console.log("Ошибка воспроизведения:", e);
        });
    }
}

function stopMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        isMusicPlaying = false;
        scrollTopBtn.classList.remove('rotating');
    }
}

// ========== ИГРОВАЯ МЕЛОДИЯ ==========
const gameSound = document.getElementById('gameSound');
let isGameSoundPlaying = false;

function startGameSound() {
    if (!isGameSoundPlaying) {
        gameSound.loop = true;
        gameSound.play().then(() => {
            isGameSoundPlaying = true;
        }).catch(e => console.log("Ошибка игровой мелодии:", e));
    }
}

function stopGameSound() {
    if (isGameSoundPlaying) {
        gameSound.pause();
        gameSound.currentTime = 0;
        isGameSoundPlaying = false;
    }
}

// ========== ИГРА В ЛЯГУШКИ ==========
let catchCount = 0;
let activeFrogs = [];
let frogSpawnInterval;
let isGameActive = false;
let timeLeft = 60;
let timerInterval = null;
let giftSpawned = false;
let scareTimeout = null;
let isScareActive = false;
const MAX_FROGS = 24; // 24 ЛЯГУШКИ

const frogImages = [
    'images/frog1.png',
    'images/frog2.png',
    'images/frog3.png',
    'images/frog6.png'
];

const counterElement = document.getElementById('frogCounter');

function showGameUI() {
    if (counterElement) counterElement.style.display = 'flex';
    if (timerElement) timerElement.style.display = 'flex';
}

function hideGameUI() {
    if (counterElement) counterElement.style.display = 'none';
    if (timerElement) timerElement.style.display = 'none';
}

const timerElement = document.createElement('div');
timerElement.className = 'frog-counter';
timerElement.style.position = 'fixed';
timerElement.style.top = '10px';
timerElement.style.right = '10px';
timerElement.style.left = 'auto';
timerElement.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))';
timerElement.style.display = 'none';
timerElement.innerHTML = `
    <img src="images/frog11.png" alt="таймер" class="counter-icon" style="animation: none;">
    <span id="timerCount">1:00</span>
`;
document.body.appendChild(timerElement);

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerCount').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (isGameActive && timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft === 10) {
                showMessage('⏰ Осталось 10 сек! ⏰');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                if (isGameActive) {
                    gameOver('time');
                }
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    timeLeft = 60;
    updateTimerDisplay();
}

function gameOver(reason) {
    if (!isGameActive) return;
    
    isGameActive = false;
    clearAllFrogs();
    stopTimer();
    stopGameSound();
    hideGameUI();
    
    const startBtn = document.getElementById('startGameBtn');
    startBtn.classList.remove('disabled');
    startBtn.innerHTML = '<img src="images/frog7.png" alt="старт" class="start-icon"><span>НАЧАТЬ ИГРУ!</span>';
    
    if (reason === 'time') {
        showMessage('⏰ ВРЕМЯ ВЫШЛО! Нажми НАЧАТЬ снова! ⏰', true);
    }
    
    catchCount = 0;
    updateCounter();
    giftSpawned = false;
}

function updateCounter() {
    document.getElementById('catchCount').textContent = catchCount;
    
    if (catchCount === 12 && isGameActive) {
        showHalfwayImage();
    }
    
    if (catchCount >= MAX_FROGS && isGameActive) {
        completeGame();
    }
}

function showHalfwayImage() {
    const existing = document.querySelector('.halfway-congrats');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'halfway-congrats';
    div.innerHTML = `<img src="images/frog.png" alt="Половина пути!">`;
    document.body.appendChild(div);
    
    setTimeout(() => {
        if (div && div.remove) div.remove();
    }, 3000);
}

function showMessage(text, isError = false) {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.position = 'fixed';
    msg.style.top = '50%';
    msg.style.left = '50%';
    msg.style.transform = 'translate(-50%, -50%)';
    msg.style.backgroundColor = isError ? 'rgba(139, 0, 0, 0.9)' : 'rgba(0,0,0,0.85)';
    msg.style.color = '#ffd966';
    msg.style.padding = '12px 20px';
    msg.style.borderRadius = '50px';
    msg.style.fontSize = '16px';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = '10000';
    msg.style.fontFamily = "'Nunito Sans', sans-serif";
    msg.style.border = '2px solid #f39c12';
    msg.style.textAlign = 'center';
    msg.style.whiteSpace = 'nowrap';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

function createFlyingFrog() {
    if (!isGameActive) return;
    if (activeFrogs.length >= 12) return;
    
    const frogDiv = document.createElement('div');
    frogDiv.className = 'flying-frog';
    
    const size = Math.random() * 35 + 30;
    frogDiv.style.width = size + 'px';
    frogDiv.style.height = size + 'px';
    
    const startX = Math.random() * (window.innerWidth - size - 20) + 10;
    const startY = Math.random() * (window.innerHeight - size - 100) + 50;
    frogDiv.style.left = startX + 'px';
    frogDiv.style.top = startY + 'px';
    
    const img = document.createElement('img');
    const randomFrog = frogImages[Math.floor(Math.random() * frogImages.length)];
    img.src = randomFrog;
    frogDiv.appendChild(img);
    
    let directionX = (Math.random() - 0.5) * 3.2;
    let directionY = (Math.random() - 0.5) * 3.2;
    let posX = startX;
    let posY = startY;
    
    const moveInterval = setInterval(() => {
        if (!document.body.contains(frogDiv)) {
            clearInterval(moveInterval);
            return;
        }
        
        posX += directionX;
        posY += directionY;
        
        if (posX <= 5 || posX >= window.innerWidth - size - 5) {
            directionX *= -1;
            posX = Math.max(5, Math.min(window.innerWidth - size - 5, posX));
        }
        if (posY <= 5 || posY >= window.innerHeight - size - 60) {
            directionY *= -1;
            posY = Math.max(5, Math.min(window.innerHeight - size - 60, posY));
        }
        
        frogDiv.style.left = posX + 'px';
        frogDiv.style.top = posY + 'px';
    }, 30);
    
    frogDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isGameActive) {
            showMessage('Сначала нажми СТАРТ! 🐸', true);
            return;
        }
        if (frogDiv.classList.contains('caught')) return;
        
        frogDiv.classList.add('caught');
        clearInterval(moveInterval);
        
        catchCount++;
        updateCounter();
        
        playCroak();
        
        const photos = document.querySelectorAll('.photo-item');
        if (photos.length > 0) {
            const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
            randomPhoto.classList.add('flash');
            setTimeout(() => randomPhoto.classList.remove('flash'), 400);
        }
        
        setTimeout(() => {
            if (frogDiv && frogDiv.remove) frogDiv.remove();
            const index = activeFrogs.findIndex(f => f.element === frogDiv);
            if (index !== -1) activeFrogs.splice(index, 1);
        }, 150);
    });
    
    document.body.appendChild(frogDiv);
    activeFrogs.push({ element: frogDiv, interval: moveInterval });
}

function clearAllFrogs() {
    activeFrogs.forEach(frog => {
        if (frog.interval) clearInterval(frog.interval);
        if (frog.element && frog.element.remove) frog.element.remove();
    });
    activeFrogs = [];
    if (frogSpawnInterval) clearInterval(frogSpawnInterval);
}

function startGame() {
    if (isGameActive) return;
    
    if (scareTimeout) {
        clearTimeout(scareTimeout);
        scareTimeout = null;
    }
    
    const gift = document.getElementById('floatingGift');
    if (gift) gift.style.display = 'none';
    giftSpawned = false;
    
    clearAllFrogs();
    stopTimer();
    resetTimer();
    catchCount = 0;
    updateCounter();
    isGameActive = true;
    
    showGameUI();
    
    const startBtn = document.getElementById('startGameBtn');
    startBtn.classList.add('disabled');
    startBtn.innerHTML = '<img src="images/frog7.png" alt="игра" class="start-icon"><span>ИГРА ИДЁТ...</span>';
    
    showMessage('🐸 ЛОВИ 24 ЛЯГУШКИ! 🐸');
    
    startGameSound();
    startTimer();
    
    frogSpawnInterval = setInterval(() => {
        if (isGameActive && activeFrogs.length < 12 && catchCount < MAX_FROGS) {
            createFlyingFrog();
        }
    }, 2000);
    
    setTimeout(() => createFlyingFrog(), 300);
    setTimeout(() => createFlyingFrog(), 700);
    setTimeout(() => createFlyingFrog(), 1100);
    setTimeout(() => createFlyingFrog(), 1500);
}

function startFallingFrogs() {
    const container = document.getElementById('falling-container');
    const frogFiles = ['frog1.png', 'frog2.png', 'frog3.png', 'frog6.png', 'frog5.png'];
    
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const frogDiv = document.createElement('div');
            frogDiv.className = 'falling-frog-celebrate';
            const randomFrog = frogFiles[Math.floor(Math.random() * frogFiles.length)];
            frogDiv.innerHTML = `<img src="images/${randomFrog}" alt="лягушка">`;
            frogDiv.style.left = Math.random() * 100 + '%';
            frogDiv.style.width = (Math.random() * 40 + 30) + 'px';
            frogDiv.style.height = (Math.random() * 40 + 30) + 'px';
            frogDiv.style.animationDuration = (Math.random() * 4 + 3) + 's';
            frogDiv.style.animationDelay = Math.random() * 1 + 's';
            container.appendChild(frogDiv);
            
            setTimeout(() => {
                if (frogDiv && frogDiv.remove) frogDiv.remove();
            }, 6000);
        }, i * 150);
    }
}

function spawnFloatingGift() {
    if (giftSpawned) return;
    giftSpawned = true;
    
    const gift = document.getElementById('floatingGift');
    if (!gift) return;
    
    const startX = Math.random() * (window.innerWidth - 100);
    const startY = Math.random() * (window.innerHeight - 150);
    gift.style.left = startX + 'px';
    gift.style.top = startY + 'px';
    gift.style.display = 'block';
    
    let dx = (Math.random() - 0.5) * 2;
    let dy = (Math.random() - 0.5) * 2;
    let posX = startX;
    let posY = startY;
    
    const moveInterval = setInterval(() => {
        if (!gift || gift.style.display === 'none') {
            clearInterval(moveInterval);
            return;
        }
        
        posX += dx;
        posY += dy;
        
        if (posX <= 10 || posX >= window.innerWidth - 90) {
            dx *= -1;
            posX = Math.max(10, Math.min(window.innerWidth - 90, posX));
        }
        if (posY <= 10 || posY >= window.innerHeight - 90) {
            dy *= -1;
            posY = Math.max(10, Math.min(window.innerHeight - 90, posY));
        }
        
        gift.style.left = posX + 'px';
        gift.style.top = posY + 'px';
    }, 50);
    
    gift.moveInterval = moveInterval;
}

function completeGame() {
    if (!isGameActive) return;
    
    isGameActive = false;
    clearAllFrogs();
    stopTimer();
    stopGameSound();
    hideGameUI();
    
    const startBtn = document.getElementById('startGameBtn');
    startBtn.classList.remove('disabled');
    startBtn.innerHTML = '<img src="images/frog7.png" alt="старт" class="start-icon"><span>НАЧАТЬ ИГРУ!</span>';
    
    catchCount = 0;
    updateCounter();
    
    startConfetti();
    startFallingFrogs();
    
    const winSound = document.getElementById('winSound');
    if (winSound) {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log('Sound error:', e));
    }
    
    showFinalCongrats();
    
    const checkInterval = setInterval(() => {
        const congrats = document.querySelector('.final-congrats');
        if (!congrats) {
            clearInterval(checkInterval);
            spawnFloatingGift();
        }
    }, 500);
}

function startConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.animationDuration = Math.random() * 2 + 1 + 's';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);
    }
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

function showFinalCongrats() {
    const oldCongrats = document.querySelector('.final-congrats');
    if (oldCongrats) oldCongrats.remove();
    
    const congratsDiv = document.createElement('div');
    congratsDiv.className = 'final-congrats';
    congratsDiv.innerHTML = `
        <h2>🎉 ПОБЕДА! 🎉</h2>
        <div class="frog-celebrate">🐸🏆🐸</div>
        <img src="images/photo_2026-04-16_01-22-08.jpg" alt="поздравление" class="win-photo">
        <p><strong>Ты поймала всех 24 лягушек!</strong></p>
        <p>✨ Ты — настоящая КОРОЛЕВА ЛЯГУШЕК! ✨</p>
        <p>🐸💚 24 года — это только начало приключений! 💚🐸</p>
        <p>Пусть каждый день приносит радость,<br>улыбки и новых пойманных лягушек!</p>
        <p>🎂 С ДНЁМ РОЖДЕНИЯ, Андрюха! 🎂</p>
        <button class="close-final" onclick="this.parentElement.remove()">🎉 СПАСИБО! 🎉</button>
    `;
    document.body.appendChild(congratsDiv);
}

// ========== СТРАШИЛКА (через 10 секунд после закрытия видео) ==========
function scheduleScareAfterVideo() {
    if (scareTimeout) {
        clearTimeout(scareTimeout);
    }
    scareTimeout = setTimeout(() => {
        if (!isScareActive) {
            showScare();
        }
    }, 10000);
}

function cancelScare() {
    if (scareTimeout) {
        clearTimeout(scareTimeout);
        scareTimeout = null;
    }
}

function showScare() {
    if (isScareActive) return;
    isScareActive = true;
    
    const wasGameSoundPlaying = isGameSoundPlaying;
    if (wasGameSoundPlaying) {
        gameSound.pause();
    }
    const wasMusicPlaying = isMusicPlaying;
    if (wasMusicPlaying) {
        bgMusic.pause();
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        z-index: 30000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 2s ease;
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 30001;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 1.5s ease;
        pointer-events: none;
    `;
    
    const img = document.createElement('img');
    img.src = 'images/ghe.jpg';
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 20px;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
    `;
    imgContainer.appendChild(img);
    document.body.appendChild(imgContainer);
    
    const scareSound = new Audio();
    scareSound.src = "images/chicken-screaming-on-a-tree.mp3";
    scareSound.volume = 0.8;
    scareSound.play().catch(e => console.log("Ошибка звука страшилки:", e));
    
    setTimeout(() => {
        imgContainer.style.opacity = '1';
    }, 500);
    
    setTimeout(() => {
        imgContainer.style.opacity = '0';
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                imgContainer.remove();
                isScareActive = false;
                
                if (wasGameSoundPlaying && isGameActive) {
                    gameSound.play().catch(e => console.log("Ошибка возобновления музыки:", e));
                }
                if (wasMusicPlaying) {
                    bgMusic.play().catch(e => console.log("Ошибка возобновления музыки:", e));
                }
            }, 1000);
        }, 500);
    }, 6000);
}

// ========== ВИДЕО ИЗ ПОДАРКА ==========
function showVideoFromGift() {
    const wasGameSoundPlaying = isGameSoundPlaying;
    if (wasGameSoundPlaying) {
        gameSound.pause();
    }
    const wasMusicPlaying = isMusicPlaying;
    if (wasMusicPlaying) {
        bgMusic.pause();
    }
    if (croakAudio) croakAudio.pause();
    if (burpAudio) burpAudio.pause();
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a5c3a, #0d3d23);
        border-radius: 30px;
        padding: 20px;
        text-align: center;
        border: 3px solid #ffd700;
        max-width: 90%;
        width: 500px;
        cursor: default;
        animation: zoomIn 0.3s ease;
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="color: #ffd966; font-family: 'Nunito Sans', sans-serif; margin: 0; font-size: 18px;">
                🎁 Видео-сюрприз от ЕЛЕНИЯ для Анечки! 🎁
            </h3>
            <button id="closeVideoBtn" style="
                background: #ffd700;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                font-weight: bold;
                color: #0a3d20;
            ">✕</button>
        </div>
        <video id="secretVideo" controls autoplay style="
            width: 100%;
            border-radius: 20px;
            max-height: 60vh;
            object-fit: contain;
        ">
            <source src="images/IMG_1423.MP4" type="video/mp4">
            Ваш браузер не поддерживает видео.
        </video>
        <p style="color: #c8e6b5; margin-top: 12px; font-size: 14px;">
            🎬 С любовью, Еления ❤️
        </p>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const video = document.getElementById('secretVideo');
    if (video) {
        video.volume = 0.8;
        video.addEventListener('ended', () => {
            if (wasGameSoundPlaying && isGameActive) {
                gameSound.play().catch(e => console.log("Ошибка возобновления музыки:", e));
            }
            if (wasMusicPlaying) {
                bgMusic.play().catch(e => console.log("Ошибка возобновления музыки:", e));
            }
        });
    }
    
    function closeModal() {
        const video = document.getElementById('secretVideo');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        modal.remove();
        
        if (wasGameSoundPlaying && isGameActive) {
            gameSound.play().catch(e => console.log("Ошибка возобновления музыки:", e));
        }
        if (wasMusicPlaying) {
            bgMusic.play().catch(e => console.log("Ошибка возобновления музыки:", e));
        }
        
        scheduleScareAfterVideo();
    }
    
    document.getElementById('closeVideoBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

const giftElement = document.getElementById('floatingGift');
if (giftElement) {
    giftElement.addEventListener('click', (e) => {
        e.stopPropagation();
        showVideoFromGift();
        giftElement.style.display = 'none';
        if (giftElement.moveInterval) {
            clearInterval(giftElement.moveInterval);
        }
    });
}

// ========== ФОТО В СЛУЧАЙНОМ ПОРЯДКЕ ==========
const masks = [
    'images/frog-mask.png',
    'images/frog-mask4.png',
    'images/frog-mask5.png',
    'images/frog-mask6.png',
    'images/frog-mask7.png',
    'images/frog-mask8.png',
    'images/frog-mask9.png'
];

const photosData = [
    { src: "images/20250517_191931.jpg", caption: "🍫 Шоколадная фея 🍫" },
    { src: "images/20250517_203053.jpg", caption: "🐱 Кис-кис, мяу!" },
    { src: "images/IMG_5803.JPG", caption: "🪰 Лови муху!" },
    { src: "images/photo_2025-06-12_18-01-57.jpg", caption: "🐸 Лягушачья принцесса" },
    { src: "images/photo_2025-06-14_23-52-13.jpg", caption: "🍫 Шоколадный понедельник" },
    { src: "images/photo_2025-06-15_06-29-28.jpg", caption: "💨 Вейп-вечеринка" },
    { src: "images/photo_2025-06-15_06-33-24.jpg", caption: "🪰 Поймай мечту" },
    { src: "images/photo_2025-06-15_07-53-48.jpg", caption: "🪰 Мушиные поцелуи" },
    { src: "images/photo_2025-06-15_07-59-06.jpg", caption: "🐸 Жабий кайф" },
    { src: "images/photo_2025-06-29_12-29-56.jpg", caption: "💨 Пар над головой" },
    { src: "images/photo_2025-06-29_14-47-28.jpg", caption: "🐱 Кошколюбовь" },
    { src: "images/photo_2025-06-29_14-48-16.jpg", caption: "🪰 Муха в шоколаде" },
    { src: "images/photo_2025-09-23_08-05-29.jpg", caption: "🐸 Лягушачий дождик" },
    { src: "images/photo_2025-10-05_10-06-05.jpg", caption: "🍫 Шоколадный закат" },
    { src: "images/photo_2025-10-12_08-10-55.jpg", caption: "🐱 Мяу-мяу, ты космос" },
    { src: "images/photo_2025-10-20_18-45-23.jpg", caption: "🐱 Кошачьи нежности" },
    { src: "images/photo_2025-10-27_15-00-24.jpg", caption: "🐸 Лягушка-путешественница" },
    { src: "images/photo_2025-11-10_13-58-39.jpg", caption: "🍫 Шоколадный поцелуй" },
    { src: "images/photo_2026-03-17_17-22-31.jpg", caption: "💨 Лягушачий вейп" },
    { src: "images/photo_2023-08-31_16-53-04.jpg", caption: "📸 Воспоминания 2023" },
    { src: "images/photo_2023-10-01_09-25-31.jpg", caption: "🍂 Осеннее настроение" },
    { src: "images/photo_2024-05-06_16-56-24.jpg", caption: "🌸 Весенняя лягушка" },
    { src: "images/photo_2024-07-21_23-36-02.jpg", caption: "🌙 Летняя ночь" },
    { src: "images/photo_2024-07-21_23-36-10.jpg", caption: "✨ Звёздный вечер" },
    { src: "images/photo_2024-08-06_21-17-00.jpg", caption: "🍦 Мороженко" },
    { src: "images/photo_2024-12-17_13-23-54.jpg", caption: "❄️ Зимняя сказка" }
];

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const shuffledPhotos = shuffleArray([...photosData]);
const gallery = document.querySelector('.gallery');
gallery.innerHTML = '';

shuffledPhotos.forEach((photo, index) => {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'photo-item';
    const maskIndex = index % masks.length;
    const maskUrl = masks[maskIndex];
    
    const cleanSrc = photo.src.replace(/\\/g, '/');
    
    photoDiv.innerHTML = `
        <div class="frog-mask-wrapper" style="-webkit-mask-image: url('${maskUrl}'); mask-image: url('${maskUrl}'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;">
            <img src="${cleanSrc}" alt="Фото" class="frog-mask-img" loading="lazy">
        </div>
        <span class="caption">${photo.caption}</span>
    `;
    gallery.appendChild(photoDiv);
});

// ЗВУК КВА ПРИ НАЖАТИИ НА ФОТО
document.querySelectorAll('.photo-item').forEach(photo => {
    photo.addEventListener('click', () => {
        playCroak();
        photo.style.transform = 'scale(0.98)';
        setTimeout(() => {
            photo.style.transform = '';
        }, 150);
    });
});

document.querySelectorAll('.main-frog-wrapper').forEach(photo => {
    photo.addEventListener('mouseenter', () => {
        if (!isGameActive) return;
        playCroak();
        photo.style.transform = 'translateY(-5px) scale(1.01)';
        setTimeout(() => {
            photo.style.transform = '';
        }, 150);
    });
});

// ========== АНИМАЦИЯ ПАДАЮЩИХ ТОРТИКОВ ==========
let isAnimating = false;
let activeAnimations = [];

function startFallingParty() {
    if (isAnimating) return;
    isAnimating = true;
    playBurp();
    startMusic();
    
    const container = document.getElementById('falling-container');
    const isMobile = window.innerWidth <= 768;
    const elementCount = isMobile ? 30 : 50;
    const spawnDelay = isMobile ? 100 : 80;
    
    activeAnimations.forEach(anim => {
        if (anim.interval) clearInterval(anim.interval);
        if (anim.element && anim.element.remove) anim.element.remove();
    });
    activeAnimations = [];
    
    container.innerHTML = '';
    
    for(let i = 0; i < elementCount; i++) {
        setTimeout(() => {
            createFallingCake(isMobile);
        }, i * spawnDelay);
    }
    
    setTimeout(() => {
        stopFallingParty();
    }, 10000);
}

function stopFallingParty() {
    isAnimating = false;
    activeAnimations.forEach(anim => {
        if (anim.interval) clearInterval(anim.interval);
        if (anim.element && anim.element.remove) anim.element.remove();
    });
    activeAnimations = [];
    const container = document.getElementById('falling-container');
    if (container) container.innerHTML = '';
}

function createFallingCake(isMobile) {
    const container = document.getElementById('falling-container');
    const element = document.createElement('div');
    
    element.innerHTML = `<img src="images/frog4.png" alt="тортик" style="width: ${isMobile ? 50 : 70}px; height: auto;">`;
    
    const startX = Math.random() * (window.innerWidth + 100) - 50;
    const driftAmount = (Math.random() - 0.5) * (isMobile ? 25 : 35);
    const speed = (isMobile ? 0.8 : 1.1) + Math.random() * (isMobile ? 1.2 : 1.5);
    
    element.style.position = 'fixed';
    element.style.left = startX + 'px';
    element.style.top = '-80px';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '10065';
    element.style.opacity = '0.95';
    element.style.willChange = 'transform';
    
    container.appendChild(element);
    
    let pos = -80;
    let rotation = (Math.random() - 0.5) * 30;
    let xPos = startX;
    let rotationSpeed = (Math.random() - 0.5) * 10;
    
    const interval = setInterval(() => {
        pos += speed;
        rotation += rotationSpeed;
        xPos += driftAmount * 0.3;
        
        element.style.transform = `translate(${xPos - startX}px, ${pos + 80}px) rotate(${rotation}deg)`;
        
        if(pos > window.innerHeight + 150) {
            clearInterval(interval);
            if (element && element.remove) element.remove();
            const index = activeAnimations.findIndex(a => a.interval === interval);
            if (index !== -1) activeAnimations.splice(index, 1);
        }
    }, isMobile ? 35 : 30);
    
    activeAnimations.push({ interval, element });
}

// ========== ФИНАЛЬНАЯ КАРТИНКА ОТ МЕНЯ ==========
function showFinalFromMe() {
    stopMusic();
    if (croakAudio) croakAudio.pause();
    if (burpAudio) burpAudio.pause();
    
    const finalDiv = document.createElement('div');
    finalDiv.className = 'final-from-me';
    finalDiv.innerHTML = `
        <img src="images/fdfb.jpg" alt="Подарок от меня">
        <div class="final-text">🔥 Это тебе от меня! 🔥</div>
        <button class="close-final-btn">✖️ Закрыть ✖️</button>
    `;
    document.body.appendChild(finalDiv);
    
    const closeBtn = finalDiv.querySelector('.close-final-btn');
    closeBtn.addEventListener('click', () => {
        finalDiv.remove();
    });
    
    finalDiv.addEventListener('click', (e) => {
        if (e.target === finalDiv) finalDiv.remove();
    });
}

const surpriseIcon = document.getElementById('surpriseIcon');
if (surpriseIcon) {
    surpriseIcon.addEventListener('click', () => {
        showFinalFromMe();
    });
}

// ========== КНОПКИ ==========
document.getElementById('startGameBtn').addEventListener('click', startGame);
document.getElementById('partyButton').addEventListener('click', startFallingParty);
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('beforeunload', () => {
    clearAllFrogs();
    stopFallingParty();
    stopGameSound();
    stopTimer();
    if (scareTimeout) clearTimeout(scareTimeout);
});
