let board = [];
let rows, cols, mineCount;
let currentScore = 0;
let highScore = localStorage.getItem('highScore') || 0;
let revealedCells = 0;
let gameOver = false;

const gridSizeSelect = document.getElementById('gridSize');
const startButton = document.getElementById('startGame');
const retryButton = document.getElementById('retryGame');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const gameBoard = document.getElementById('gameBoard');

highScoreEl.textContent = highScore;

startButton.addEventListener('click', setupGame);
retryButton.addEventListener('click', () => {
    retryButton.style.display = 'none';
    setupGame();
});

function setupGame() {
    currentScore = 0;
    revealedCells = 0;
    gameOver = false;
    currentScoreEl.textContent = `점수: ${currentScore}`;

    retryButton.style.display = 'none';

    const size = parseInt(gridSizeSelect.value);
    rows = size;
    cols = size;
    mineCount = Math.floor((size * size) / 6);

    board = Array.from({ length: rows }, () => Array(cols).fill(null));

    placeMines();
    calculateNumbers();
    renderBoard();
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        if (!board[row][col]) {
            board[row][col] = { mine: true, revealed: false };
            minesPlaced++;
        }
    }
}

function calculateNumbers() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col]?.mine) continue;

            let mineCount = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (
                        nr >= 0 &&
                        nr < rows &&
                        nc >= 0 &&
                        nc < cols &&
                        board[nr][nc]?.mine
                    ) {
                        mineCount++;
                    }
                }
            }
            if (mineCount > 0) {
                board[row][col] = { mineCount, revealed: false };
            }else {
                board[row][col] = { mineCount: 0, revealed: false };
            }
        }
    }
}

function renderBoard() {
    const boxSize = 300;
    const cellSize = Math.floor(boxSize / cols);

    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    gameBoard.style.width = `${boxSize}px`;
    gameBoard.style.height = `${boxSize}px`;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            // 셀 크기 설정
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            cell.addEventListener('click', onCellClick);

            gameBoard.appendChild(cell);
        }
    }
}

function onCellClick(e) {
    if (gameOver) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    const cell = board[row][col];
    if (cell?.revealed) return;

    if (cell?.mine) {
        gameOver = true;
        e.target.classList.add('mine');
        alert('게임 오버! 지뢰를 찾았습니다!');
        revealAllMines();
        retryButton.style.display = 'inline';
    } else {
        revealCell(row, col);
    }
}

function revealCell(row, col) {
    const cell = board[row][col];
    if (!cell || cell.revealed) return;

    cell.revealed = true;
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cellElement.classList.add('revealed');

    if (cell.mineCount) {
        cellElement.textContent = cell.mineCount;
    } else {
        cellElement.classList.add('empty');
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    revealCell(nr, nc);
                }
            }
        }
    }
    revealedCells++;
    if (revealedCells === rows * cols - mineCount) {
        alert('게임 클리어!');
        gameOver = true;
    }
    updateScore(row, col);
}

function revealAllMines() {
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
        if (cell?.mine) {
            const cellElement = document.querySelector(`.cell[data-row="${rowIndex}"][data-col="${colIndex}"]`);
            cellElement.classList.add('mine');
        }
        });
    });
}

function updateScore(row, col) {
    const cell = board[row][col];
    if (!cell || cell.revealed === "scored") return;

    currentScore += 10;
    currentScoreEl.textContent = `점수: ${currentScore}`;

    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreEl.textContent = highScore;
        localStorage.setItem('highScore', highScore);
    }
    cell.revealed = "scored";
}