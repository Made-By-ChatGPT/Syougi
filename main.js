// main.js
const boardElement = document.getElementById('board');
const startGameButton = document.getElementById('start-game');
const signalingTextarea = document.getElementById('signaling');
const connectPeerButton = document.getElementById('connect-peer');

const boardState = Array(81).fill(null);
let selectedPiece = null;
let currentTurn = '先手';
let peer;
let gameActive = false;

function createBoard() {
    for (let i = 0; i < 81; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.dataset.index = i;
        square.addEventListener('click', handleMove);
        boardElement.appendChild(square);
    }
    initializeBoard();
}

function initializeBoard() {
    // 基本的な初期配置（例：王、金、銀など）
    // 駒の記号: 王: 'K', 金: 'G', 銀: 'S', 香: 'L', 桂: 'N', 歩: 'P', 角: 'B', 飛: 'R'
    const initialPositions = {
        '0': 'L', '1': 'N', '2': 'S', '3': 'G', '4': 'K', '5': 'G', '6': 'S', '7': 'N', '8': 'L',
        '9': '', '10': 'R', '11': '', '12': '', '13': '', '14': '', '15': '', '16': 'B', '17': '',
        '18': 'P', '19': 'P', '20': 'P', '21': 'P', '22': 'P', '23': 'P', '24': 'P', '25': 'P', '26': 'P',
        // 後手の駒
        '54': 'p', '55': 'p', '56': 'p', '57': 'p', '58': 'p', '59': 'p', '60': 'p', '61': 'p', '62': 'p',
        '63': '', '64': 'b', '65': '', '66': '', '67': '', '68': '', '69': '', '70': 'r', '71': '',
        '72': 'l', '73': 'n', '74': 's', '75': 'g', '76': 'k', '77': 'g', '78': 's', '79': 'n', '80': 'l'
    };

    for (let i = 0; i < 81; i++) {
        const square = boardElement.children[i];
        square.textContent = initialPositions[i] || '';
        boardState[i] = initialPositions[i] || null;
    }
}

function handleMove(event) {
    const index = event.target.dataset.index;

    if (!gameActive || currentTurn === '後手') return;

    if (selectedPiece !== null) {
        // 動かせるかどうかのチェック（簡単な移動のみ）
        movePiece(selectedPiece, index);
        selectedPiece = null;
    } else if (boardState[index] && boardState[index].toUpperCase() === boardState[index]) {
        // 駒を選択
        selectedPiece = index;
    }
}

function movePiece(from, to) {
    boardState[to] = boardState[from];
    boardState[from] = null;
    boardElement.children[to].textContent = boardElement.children[from].textContent;
    boardElement.children[from].textContent = '';

    currentTurn = '後手';
    sendMove({ from, to });
}

function receiveMove(move) {
    boardState[move.to] = boardState[move.from];
    boardState[move.from] = null;
    boardElement.children[move.to].textContent = boardElement.children[move.from].textContent;
    boardElement.children[move.from].textContent = '';

    currentTurn = '先手';
}

function sendMove(move) {
    if (peer) {
        peer.send(JSON.stringify(move));
    }
}

function startGame() {
    peer = new SimplePeer({
        initiator: location.hash === '#init',
        trickle: false
    });

    peer.on('signal', data => {
        signalingTextarea.value = JSON.stringify(data);
    });

    peer.on('data', data => {
        const move = JSON.parse(data);
        receiveMove(move);
    });

    peer.on('connect', () => {
        gameActive = true;
    });

    peer.on('error', err => {
        console.error('WebRTCエラー:', err);
    });

    peer.on('close', () => {
        gameActive = false;
        alert('接続が切断されました。');
    });
}

createBoard();

startGameButton.addEventListener('click', startGame);

connectPeerButton.addEventListener('click', () => {
    const signal = JSON.parse(signalingTextarea.value);
    peer.signal(signal);
});
