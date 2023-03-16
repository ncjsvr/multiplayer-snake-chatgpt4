const socket = io();
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 20;
const canvasSize = 700;
let players = null;
let food = null;
let lastDirection = '';

document.addEventListener('keydown', (event) => {
    let direction;
    if (event.key === 'ArrowUp' && lastDirection !== 'down') {
        direction = { dx: 0, dy: -1 };
        lastDirection = 'up';
    } else if (event.key === 'ArrowDown' && lastDirection !== 'up') {
        direction = { dx: 0, dy: 1 };
        lastDirection = 'down';
    } else if (event.key === 'ArrowLeft' && lastDirection !== 'right') {
        direction = { dx: -1, dy: 0 };
        lastDirection = 'left';
    } else if (event.key === 'ArrowRight' && lastDirection !== 'left') {
        direction = { dx: 1, dy: 0 };
        lastDirection = 'right';
    }

    if (direction) {
        socket.emit('player-move', direction);
    }
});

socket.on('update-players', (data) => {
    const { players: updatedPlayers, food: updatedFood } = data;

    if (updatedPlayers) {
        players = updatedPlayers;
    }

    if (updatedFood) {
        food = updatedFood;
    }
});

function update() {
    if (!players || !food) {
        requestAnimationFrame(update);
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(); // Draw the grid lines

    // Draw food
    context.fillStyle = 'red';
    context.fillRect(food.x * grid, food.y * grid, grid, grid);

    // Draw players
    for (const id in players) {
        const player = players[id];
        context.fillStyle = id === socket.id ? 'blue' : 'green';

        for (const cell of player.cells) {
            context.fillRect(cell.x * grid, cell.y * grid, grid, grid);
        }
    }

    requestAnimationFrame(update);
}


update();


function drawGrid() {
    context.strokeStyle = 'rgba(200, 200, 200, 0.2)';
    for (let x = 0; x < canvas.width; x += grid) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }
    for (let y = 0; y < canvas.height; y += grid) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    }
}
