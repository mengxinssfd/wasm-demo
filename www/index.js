import {greet, Universe} from "wasm-demo";

greet("hello world");

const pre = document.getElementById("game-of-life-canvas");
const universe = Universe.new();


const renderLoop = () => {
    pre.textContent = universe.render();
    universe.tick();
    requestAnimationFrame(renderLoop);
}
renderLoop();