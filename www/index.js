import {Universe, Cell} from "wasm-demo";
import {memory} from "wasm-demo/wasm_demo_bg";

// greet("hello world");

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCC";
const DEAD_COLOR = "#FFF";
const ALIVE_COLOR = "#000";


const universe = Universe.new(128);
const width = universe.width();
const height = universe.height();

const CS_PLUS = CELL_SIZE + 1;
/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("game-of-life-canvas");
canvas.width = CS_PLUS * width + 1;
canvas.height = CS_PLUS * height + 1;

const ctx = canvas.getContext("2d");

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * CS_PLUS + 1, 0);
        ctx.lineTo(i * CS_PLUS, CS_PLUS * height + 1);
    }
    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * CS_PLUS + 1);
        ctx.lineTo(CS_PLUS * width + 1, j * CS_PLUS + 1);
    }
    ctx.stroke();
}

const getIndex = (row, column) => {
    return row * width + column;
}

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
    ctx.beginPath();

    // Alive cells
    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] === Cell.Dead) {
                continue;
            }
            ctx.fillRect(
                col * CS_PLUS + 1,
                row * CS_PLUS + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] !== Cell.Dead) {
                continue;
            }
            ctx.fillRect(
                col * CS_PLUS + 1,
                row * CS_PLUS + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
}

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasLeft = (e.clientX - rect.left) * scaleX;
    const canvasTop = (e.clientY - rect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / CS_PLUS), height - 1);
    const col = Math.min(Math.floor(canvasLeft / CS_PLUS), width - 1);

    universe.toggle_cell(row, col);

    drawGrid();
    drawCells();
});

let animationId = null;
const isPaused = () => {
    return animationId === null;
};
window.addEventListener("keydown", e => {
    if (e.code === "Enter") {
        if (isPaused()) {
            render();
        } else {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
})

const fps = new class {
    constructor() {
        this.fps = document.getElementById("fps");
        this.frames = [];
        this.lastFrameTimeStamp = performance.now();
    }

    render() {
        const now = performance.now();
        const delta = now - this.lastFrameTimeStamp;
        this.lastFrameTimeStamp = now;
        const fps = 1 / delta * 1000;

        this.frames.push(fps);
        if (this.frames.length > 100) {
            this.frames.shift();
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        this.frames.forEach((it) => {
            sum += it;
            min = Math.min(min, it);
            max = Math.max(max, it);
        });
        let mean = sum / this.frames.length;
        this.fps.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
    }
}

const render = () => {
    drawGrid();
    drawCells();
    animationId = requestAnimationFrame(renderLoop);
}
const renderLoop = () => {
    fps.render();
    universe.tick();
    render()
}

render();