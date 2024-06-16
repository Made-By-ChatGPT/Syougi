// main.js
const boardElement = document.getElementById('board');
const startGameButton = document.getElementById('start-game');
const signalingTextarea = document.getElementById('signaling');
const connectPeerButton = document.getElementById('connect-peer');

const boardState = Array(81).fill(null);
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
}

function handleMove(event) {
    const index = event.target.dataset.index;
    if (boardState[index] || !gameActive || currentTurn !== '先手') return;

    boardState[index] = currentTurn;
    event.target.textContent = '先';
    currentTurn = '後手';

    sendMove(index);
}

function sendMove(index) {
    if (peer) {
        peer.send(index.toString());
    }
}

function receiveMove(index) {
    if (boardState[index]) return;

    boardState[index] = currentTurn;
    const square = boardElement.children[index];
    square.textContent = '後';
    currentTurn = '先手';
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
        const index = parseInt(data);
        receiveMove(index);
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
