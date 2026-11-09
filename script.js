const menu = document.getElementById("menu");
const game = document.getElementById("game");

const modeButtons = document.querySelectorAll(".mode-btn");
const cells = document.querySelectorAll(".cell");

const backButton = document.getElementById("backButton");
const restartButton = document.getElementById("restartButton");
const playAgainButton = document.getElementById("playAgainButton");

const resultModal = document.getElementById("resultModal");
const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");

const modalAgainButton = document.getElementById("modalAgainButton");
const modalMenuButton = document.getElementById("modalMenuButton");

const message = document.getElementById("message");

const playerX = document.getElementById("playerX");
const playerO = document.getElementById("playerO");

const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");

const opponentName = document.getElementById("opponentName");
const scoreOName = document.getElementById("scoreOName");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameMode = "";
let gameActive = false;
let machineThinking = false;

let scoreX = 0;
let scoreO = 0;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

modeButtons.forEach(button => {
    button.addEventListener("click", () => {
        gameMode = button.dataset.mode;

        if (gameMode === "machine") {
            opponentName.textContent = "Máquina";
            scoreOName.textContent = "Máquina";
        } else {
            opponentName.textContent = "Jogador O";
            scoreOName.textContent = "Jogador O";
        }

        menu.classList.remove("active");
        game.classList.add("active");

        startGame();
    });
});

cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

function handleCellClick(event) {
    const cell = event.currentTarget;
    const index = Number(cell.dataset.index);

    if (!gameActive) {
        return;
    }

    if (machineThinking) {
        return;
    }

    if (currentPlayer !== "X" && gameMode === "machine") {
        return;
    }

    if (board[index] !== "") {
        return;
    }

    makeMove(index, currentPlayer);

    if (
        gameActive &&
        gameMode === "machine" &&
        currentPlayer === "O"
    ) {
        machineThinking = true;
        updateStatus();

        setTimeout(() => {
            if (!gameActive) {
                machineThinking = false;
                return;
            }

            const move = findBestMove();

            if (move !== -1 && board[move] === "") {
                makeMove(move, "O");
            }

            machineThinking = false;

            if (gameActive) {
                updateStatus();
            }
        }, 400);
    }
}

function startGame() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    machineThinking = false;

    cells.forEach(cell => {
        cell.className = "cell";
        cell.disabled = false;
        cell.innerHTML = "";
    });

    playAgainButton.classList.remove("visible");

    updateStatus();
    closeModal();
}

function makeMove(index, player) {
    if (!gameActive) {
        return false;
    }

    if (index < 0 || index > 8) {
        return false;
    }

    if (board[index] !== "") {
        return false;
    }

    board[index] = player;

    const cell = cells[index];

    cell.classList.remove("x", "o");
    cell.classList.add(player.toLowerCase());
    cell.disabled = true;

    const result = checkWinner();

    if (result) {
        finishGame(result);
        return true;
    }

    currentPlayer = player === "X" ? "O" : "X";

    return true;
}

function checkWinner() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return {
                winner: board[a],
                combination
            };
        }
    }

    if (board.every(cell => cell !== "")) {
        return {
            winner: "draw",
            combination: []
        };
    }

    return null;
}

function finishGame(result) {
    gameActive = false;
    machineThinking = false;

    cells.forEach(cell => {
        cell.disabled = true;
    });

    if (result.winner === "draw") {
        message.textContent = "A partida terminou empatada.";

        showResult(
            "draw",
            "Empate!",
            "Ninguém venceu desta vez. Que tal tentar novamente?"
        );
    } else {
        result.combination.forEach(index => {
            cells[index].classList.add("win");
        });

        if (result.winner === "X") {
            scoreX++;
            scoreXElement.textContent = scoreX;
        } else {
            scoreO++;
            scoreOElement.textContent = scoreO;
        }

        const winnerName = getPlayerName(result.winner);

        message.textContent = `${winnerName} venceu a partida!`;

        showResult(
            result.winner,
            "Vitória!",
            `${winnerName} venceu a partida.`
        );
    }

    playAgainButton.classList.add("visible");
}

function getPlayerName(player) {
    if (player === "X") {
        return "Jogador X";
    }

    return gameMode === "machine"
        ? "A Máquina"
        : "Jogador O";
}

function updateStatus() {
    if (!gameActive) {
        return;
    }

    playerX.classList.remove("active-player");
    playerO.classList.remove("active-player");

    if (currentPlayer === "X") {
        playerX.classList.add("active-player");
        message.textContent = "Vez do jogador X";
    } else {
        playerO.classList.add("active-player");

        if (machineThinking) {
            message.textContent = "A máquina está pensando...";
        } else {
            message.textContent =
                gameMode === "machine"
                    ? "Vez da máquina"
                    : "Vez do jogador O";
        }
    }
}

function findBestMove() {
    const availableMoves = getAvailableMoves();

    if (availableMoves.length === 0) {
        return -1;
    }

    const winningMove = findWinningMove("O");

    if (winningMove !== -1) {
        return winningMove;
    }

    const blockingMove = findWinningMove("X");

    if (blockingMove !== -1) {
        return blockingMove;
    }

    if (board[4] === "") {
        return 4;
    }

    const oppositeCorner = findOppositeCorner();

    if (oppositeCorner !== -1) {
        return oppositeCorner;
    }

    const availableCorners = [0, 2, 6, 8]
        .filter(index => board[index] === "");

    if (availableCorners.length > 0) {
        return randomChoice(availableCorners);
    }

    const availableSides = [1, 3, 5, 7]
        .filter(index => board[index] === "");

    if (availableSides.length > 0) {
        return randomChoice(availableSides);
    }

    return randomChoice(availableMoves);
}

function findWinningMove(player) {
    const availableMoves = getAvailableMoves();

    for (const index of availableMoves) {
        board[index] = player;

        const winner = checkWinner();

        board[index] = "";

        if (winner && winner.winner === player) {
            return index;
        }
    }

    return -1;
}

function findOppositeCorner() {
    const pairs = [
        [0, 8],
        [2, 6]
    ];

    for (const [playerCorner, machineCorner] of pairs) {
        if (
            board[playerCorner] === "X" &&
            board[machineCorner] === ""
        ) {
            return machineCorner;
        }

        if (
            board[machineCorner] === "X" &&
            board[playerCorner] === ""
        ) {
            return playerCorner;
        }
    }

    return -1;
}

function getAvailableMoves() {
    return board
        .map((value, index) => value === "" ? index : -1)
        .filter(index => index !== -1);
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function showResult(type, title, text) {
    resultTitle.textContent = title;
    resultMessage.textContent = text;

    if (type === "X") {
        resultIcon.textContent = "X";
        resultIcon.style.background = "var(--accent)";
    } else if (type === "O") {
        resultIcon.textContent = "O";
        resultIcon.style.background = "var(--blue)";
    } else {
        resultIcon.textContent = "≡";
        resultIcon.style.background = "#777269";
    }

    setTimeout(() => {
        resultModal.classList.add("show");
    }, 300);
}

function closeModal() {
    resultModal.classList.remove("show");
}

function returnToMenu() {
    gameActive = false;
    machineThinking = false;

    closeModal();

    game.classList.remove("active");
    menu.classList.add("active");

    scoreX = 0;
    scoreO = 0;

    scoreXElement.textContent = "0";
    scoreOElement.textContent = "0";

    board = Array(9).fill("");

    cells.forEach(cell => {
        cell.className = "cell";
        cell.disabled = false;
        cell.innerHTML = "";
    });
}

playAgainButton.addEventListener("click", startGame);

restartButton.addEventListener("click", startGame);

backButton.addEventListener("click", returnToMenu);

modalAgainButton.addEventListener("click", startGame);

modalMenuButton.addEventListener("click", returnToMenu);

resultModal.addEventListener("click", event => {
    if (event.target === resultModal) {
        closeModal();
    }
});
