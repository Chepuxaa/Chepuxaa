// Переменные
let isCardVisible = false;
let musicPlaying = false;
let visitCount = 0;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    initMatrix();
    initCursor();
    initVisitCounter();
    updateTime();
    initEventListeners();
});

// Обработчики событий
function initEventListeners() {
    const pressBtn = document.getElementById('pressBtn');
    console.log('Кнопка найдена:', pressBtn);
    
    if (!pressBtn) {
        console.error('Кнопка pressBtn не найдена!');
        return;
    }
    
    // Кнопка Press me
    pressBtn.addEventListener('click', function(e) {
        console.log('Клик по кнопке!');
        e.preventDefault();
        showInfoCard();
    });
    
    pressBtn.addEventListener('mouseenter', function(e) {
        console.log('Hover на кнопку');
        createParticles(e);
    });
    
    // Остальные элементы
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideInfoCard);
    }
    
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // Пасхалки
    document.addEventListener('keydown', handleEasterEggs);
}

// Показать карточку
function showInfoCard() {
    console.log('Показываем карточку');
    const card = document.getElementById('infoCard');
    const container = document.getElementById('mainContainer');
    
    if (!card || !container) {
        console.error('Элементы карточки не найдены');
        return;
    }
    
    container.style.display = 'none';
    card.classList.remove('hidden');
    isCardVisible = true;
    
    // Запуск печатающегося текста
    typeText('Chepuxaa (Stepan)', 'typingName');
    
    // Запуск музыки
    playMusic();
}

// Скрыть карточку
function hideInfoCard() {
    console.log('Скрываем карточку');
    const card = document.getElementById('infoCard');
    const container = document.getElementById('mainContainer');
    
    card.classList.add('hidden');
    container.style.display = 'flex';
    isCardVisible = false;
    
    stopMusic();
}

// Печатающийся текст
function typeText(text, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = '';
    
    let i = 0;
    const timer = setInterval(() => {
        element.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            element.style.borderRight = 'none';
        }
    }, 100);
}

// Создание частиц
function createParticles(e) {
    const particles = document.getElementById('particles');
    if (!particles) return;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const dx = (Math.random() - 0.5) * 100;
        const dy = (Math.random() - 0.5) * 100;
        
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        particles.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 1000);
    }
}

// Матричный дождь
function initMatrix() {
    const matrix = document.getElementById('matrix');
    if (!matrix) return;
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
    
    for (let i = 0; i < 30; i++) {
        const column = document.createElement('div');
        column.style.position = 'absolute';
        column.style.left = Math.random() * 100 + '%';
        column.style.color = '#00ff00';
        column.style.fontSize = '14px';
        column.style.animation = `fall ${Math.random() * 3 + 2}s linear infinite`;
        column.style.animationDelay = Math.random() * 2 + 's';
        column.style.opacity = '0.7';
        
        let text = '';
        for (let j = 0; j < 15; j++) {
            text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
        }
        column.innerHTML = text;
        matrix.appendChild(column);
    }
    
    // CSS для анимации падения
    if (!document.getElementById('matrix-style')) {
        const style = document.createElement('style');
        style.id = 'matrix-style';
        style.textContent = `
            @keyframes fall {
                0% { transform: translateY(-100vh); opacity: 0.7; }
                100% { transform: translateY(100vh); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Анимированный курсор
function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
}

// Счетчик посещений
function initVisitCounter() {
    try {
        visitCount = parseInt(localStorage.getItem('visitCount')) || 0;
        visitCount++;
        localStorage.setItem('visitCount', visitCount.toString());
        
        const visitElement = document.getElementById('visitCount');
        if (visitElement) {
            visitElement.textContent = visitCount;
        }
    } catch (e) {
        console.log('LocalStorage недоступен');
        const visitElement = document.getElementById('visitCount');
        if (visitElement) {
            visitElement.textContent = '1';
        }
    }
}

// Обновление времени
function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {
            timeZone: 'Europe/Moscow',
            hour12: false
        });
        timeElement.textContent = timeString + ' MSK';
    }
    setTimeout(updateTime, 1000);
}

function playMusic() {
    const music = document.getElementById('bgMusic');
    if (music) {
        music.play().then(() => {
            console.log('Музыка играет');
            musicPlaying = true;
            updateMusicButton();
        }).catch((error) => {
            console.log('Автовоспроизведение заблокировано:', error);
            // Музыка запустится после взаимодействия пользователя
        });
    }
}

// Копирование Discord
function copyDiscord() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText('kissdpups').then(() => {
            alert('Discord скопирован: kissdpups');
        });
    } else {
        // Fallback для старых браузеров
        const textArea = document.createElement("textarea");
        textArea.value = 'kissdpups';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Discord скопирован: kissdpups');
    }
}

// Пасхалки
function handleEasterEggs(e) {
    if (e.key === 'Escape' && isCardVisible) {
        hideInfoCard();
    }
}

// Дополнительная проверка
window.addEventListener('load', function() {
    console.log('Страница полностью загружена');
    
    // Проверяем, что все элементы на месте
    const pressBtn = document.getElementById('pressBtn');
    const infoCard = document.getElementById('infoCard');
    
    console.log('pressBtn:', pressBtn);
    console.log('infoCard:', infoCard);
});
