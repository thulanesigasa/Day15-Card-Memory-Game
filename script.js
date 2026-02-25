const allIcons = [
    'anchor', 'moon', 'sun', 'cpu', 'cloud-lightning', 'music', 'heart', 'star',
    'umbrella', 'activity', 'bell', 'box', 'camera', 'coffee', 'compass', 'droplet', 'gift', 'globe'
];

// Progressive Levels (Number of pairs per level)
const levels = [4, 6, 8, 10, 12, 15, 18];
let currentLevel = 1;

let currentCardsArray = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

let moves = 0;
let matchesCounter = 0;
let timeElapsed = 0;
let timerInterval = null;
let isTimerRunning = false;

// DOM Elements
const gameBoard = document.getElementById('game-board');
const movesVal = document.getElementById('moves-val');
const timeVal = document.getElementById('time-val');
const pairsVal = document.getElementById('pairs-val');
const totalPairsVal = document.getElementById('total-pairs-val');
const levelVal = document.getElementById('level-val');

const restartBtn = document.getElementById('restart-btn');
const modalRestartBtn = document.getElementById('modal-restart');
const nextLevelBtn = document.getElementById('next-level-btn');
const winModal = document.getElementById('win-modal');
const modalTitle = document.getElementById('modal-title');

const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    restartBtn.addEventListener('click', () => { currentLevel = 1; initGame(); });
    modalRestartBtn.addEventListener('click', () => { currentLevel = 1; initGame(); });
    nextLevelBtn.addEventListener('click', () => {
        currentLevel++;
        initGame();
    });
});

function initGame() {
    let numPairs = levels[currentLevel - 1]; // e.g. 4 for level 1
    totalPairsVal.textContent = numPairs;
    levelVal.textContent = currentLevel;

    // Slice icons needed for this level
    let selectedIcons = allIcons.slice(0, numPairs);
    currentCardsArray = selectedIcons.map(icon => ({ name: icon, icon: icon }));

    // Reset Stats
    moves = 0;
    matchesCounter = 0;
    timeElapsed = 0;
    movesVal.textContent = moves;
    pairsVal.textContent = matchesCounter;
    timeVal.textContent = "00:00";

    stopTimer();
    isTimerRunning = false;

    // Reset Board State
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;

    winModal.classList.add('hidden');
    gameBoard.innerHTML = ''; // Clear existing cards

    // Adjust Grid Layout based on number of cards
    let totalCards = numPairs * 2;
    if (totalCards <= 12) {
        gameBoard.style.gridTemplateColumns = `repeat(4, 1fr)`;
    } else if (totalCards <= 20) {
        gameBoard.style.gridTemplateColumns = `repeat(5, 1fr)`;
    } else {
        gameBoard.style.gridTemplateColumns = `repeat(6, 1fr)`;
    }

    // Generate Deck
    let gameGrid = [...currentCardsArray, ...currentCardsArray]; // Duplicate for pairs
    gameGrid.sort(() => 0.5 - Math.random()); // Simple Fisher-Yates alternative

    // Build DOM Elements
    gameGrid.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.name = item.name;

        // Front Face (The Icon)
        const front = document.createElement('div');
        front.classList.add('front-face');
        front.innerHTML = `<i data-feather="${item.icon}"></i>`;

        // Back Face (The Cover)
        const back = document.createElement('div');
        back.classList.add('back-face');

        card.appendChild(front);
        card.appendChild(back);

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    feather.replace(); // Render icons
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; // Prevent double clicking same card

    if (!isTimerRunning) {
        startTimer();
        isTimerRunning = true;
    }

    this.classList.add('flip');

    if (!hasFlippedCard) {
        // First click
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Second click
    secondCard = this;
    moves++;
    movesVal.textContent = moves;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchesCounter++;
    pairsVal.textContent = matchesCounter;

    let numPairs = levels[currentLevel - 1];
    if (matchesCounter === numPairs) {
        gameWon();
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        resetBoard();
    }, 1000); // 1-second delay
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Timer Functions
function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        let minutes = Math.floor(timeElapsed / 60);
        let seconds = timeElapsed % 60;

        let displayMins = minutes < 10 ? `0${minutes}` : minutes;
        let displaySecs = seconds < 10 ? `0${seconds}` : seconds;

        timeVal.textContent = `${displayMins}:${displaySecs}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function gameWon() {
    stopTimer();

    // Small delay to allow final card animation to finish
    setTimeout(() => {
        finalMoves.textContent = moves;
        finalTime.textContent = timeVal.textContent;

        if (currentLevel < levels.length) {
            modalTitle.innerHTML = `Level ${currentLevel} <span class="mil-accent">Complete!</span>`;
            nextLevelBtn.classList.remove('hidden');
        } else {
            modalTitle.innerHTML = `Game <span class="mil-accent">Beaten!</span>`;
            nextLevelBtn.classList.add('hidden'); // No more levels
        }

        winModal.classList.remove('hidden');
    }, 500);
}
