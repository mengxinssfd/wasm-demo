import {Universe, Cell} from "wasm-demo";
import {memory} from "wasm-demo/wasm_demo_bg";

// greet("hello world");

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCC";
const DEAD_COLOR = "#FFF";
const ALIVE_COLOR = "#000";


const universe = Universe.new();
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
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
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

const renderLoop = () => {
    universe.tick();
    drawGrid();
    drawCells();
    requestAnimationFrame(renderLoop);
}
drawGrid();
drawCells();
requestAnimationFrame(renderLoop);