const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const grid = 20;

function createFood() {
    return {
        x: Math.floor(Math.random() * (700 / grid)),
        y: Math.floor(Math.random() * (700 / grid)),
    };
}

let players = {};
let food = createFood();

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.emit('update-players', { players, food });

    players[socket.id] = {
        cells: [
            { x: Math.floor(Math.random() * (700 / grid)), y: Math.floor(Math.random() * (700 / grid)) },
        ],
        dx: 1,
        dy: 0,
    };

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
    });

    socket.on('player-move', (direction) => {
        const player = players[socket.id];
        player.dx = direction.dx;
        player.dy = direction.dy;
    });
});

function gameLoop() {
    for (const id in players) {
        const player = players[id];
        const head = { x: player.cells[0].x + player.dx, y: player.cells[0].y + player.dy };

        // Check for collision with walls
        if (head.x < 0 || head.x >= 700 / grid || head.y < 0 || head.y >= 700 / grid) {
            players[id] = spawnSnake();
            continue;
        }

        // Check for collision with itself
        if (player.cells.some((cell, index) => index > 0 && cell.x === head.x && cell.y === head.y)) {
            players[id] = spawnSnake();
            continue;
        }

        // Check for collision with other snakes
        for (const otherId in players) {
            if (id !== otherId && players[otherId].cells.some(cell => cell.x === head.x && cell.y === head.y)) {
                players[id] = spawnSnake();
                continue;
            }
        }

        if (head.x === food.x && head.y === food.y) {
            food = createFood();
        } else {
            player.cells.pop();
        }

        player.cells.unshift(head);
    }

    io.emit('update-players', { players, food });
    setTimeout(gameLoop, 100);
}



gameLoop();


function spawnSnake() {
    return {
        cells: [
            { x: Math.floor(Math.random() * (700 / grid)), y: Math.floor(Math.random() * (700 / grid)) },
        ],
        dx: 1,
        dy: 0,
    };
}
