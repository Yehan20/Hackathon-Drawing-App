import { resizeCanvas } from "./resize.js";
import { menuSvg, exitSvg } from "./svg.js";

const toggleBtn = document.getElementById("toggle-btn");
const penBtn = document.getElementById("pen-btn");
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const navbar = document.querySelector(".draw-row");
const colorInput = document.getElementById("color-input");
const strokeSelectorsSvgs = [...document.getElementsByClassName("stroke-svg")];
const strokeSelectorBtns = strokeSelectorsSvgs.map((selector) => selector.parentElement);
toggleBtn.innerHTML = menuSvg;
const darkTeal = `rgb(0, 212, 169)`;

const toolBtns = [penBtn, eraserBtn];

//Enable tooltop for Bootstrap
let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Initialize Canvas API and memory canvas for responsiveness
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
let inMemCanvas = document.createElement("canvas");
let inMemCtx = inMemCanvas.getContext("2d");

// Default state
const state = {
    isPainting: false,
    isPenActive: true,
    isEraserActive: false,
    strokeColor: colorInput.value,
    fillColor: "black",
    width: 1
};

// Canvas setup and set pen tool as default

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);
penBtn.style.border = `2px outset ${darkTeal}`;
strokeSelectorBtns[0].style.border = `2px outset ${darkTeal}`;

// Debounce - This will fire resizeCanvas once after 1 second from the last resize event.
let timer_id = undefined;
window.addEventListener("resize", function () {
    if (timer_id !== undefined) {
        clearTimeout(timer_id);
        timer_id = undefined;
    }
    timer_id = setTimeout(function () {
        timer_id = undefined;
        resizeCanvas(inMemCanvas, inMemCtx, canvas, ctx);
    }, 1000);
});

// Update mouse object {x,y} position everytime it moves relative to canvas size/positioning. (Including resize)
let mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", function (evt) {
    var mousePos = getMousePos(canvas, evt);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
});

function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Draw - Pencil/Pen function
function startPosition() {
    state.isPainting = true;
    // This allows drawing of a dot.
    draw();
}

function finishedPosition() {
    state.isPainting = false;
    ctx.save();
    ctx.beginPath();
}

function draw() {
    if (!state.isPainting) return;
    ctx.lineWidth = state.width;
    ctx.lineCap = "round";
    ctx.strokeStyle = state.strokeColor;
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
}
function setInactive(toolBtn) {
    switch (toolBtn) {
        case penBtn:
            toolBtn.style.border = "none";
            state.isPenActive = false;
        case eraserBtn:
            toolBtn.style = "none";
            state.isEraserActive = false;
        default:
            return;
    }
}

penBtn.addEventListener("click", () => {
    if (!state.isPenActive) {
        state.isPenActive = true;
        state.strokeColor = colorInput.value;
        toolBtns.filter((btn) => btn !== penBtn).forEach((oBtn) => setInactive(oBtn));
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishedPosition);
        canvas.addEventListener("mousemove", draw);
        penBtn.style.border = `3px outset ${darkTeal}`;
    } else {
        state.isPenActive = false;
        canvas.removeEventListener("mousedown", startPosition);
        canvas.removeEventListener("mouseup", finishedPosition);
        canvas.removeEventListener("mousemove", draw);
        penBtn.style.border = "none";
    }
});

eraserBtn.addEventListener("click", () => {
    if (!state.isEraserActive) {
        state.isEraserActive = true;
        toolBtns.filter((btn) => btn !== eraserBtn).forEach((oBtn) => setInactive(oBtn));
        state.strokeColor = "#ffffff";
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishedPosition);
        canvas.addEventListener("mousemove", draw);
        eraserBtn.style.border = `3px outset ${darkTeal}`;
    } else {
        state.isEraserActive = false;
        state.strokeColor = colorInput.value;
        canvas.removeEventListener("mousedown", startPosition);
        canvas.removeEventListener("mouseup", finishedPosition);
        canvas.removeEventListener("mousemove", draw);
        eraserBtn.style.border = "none";
    }
});

toggleBtn.addEventListener("click", () => {
    if (navbar.classList.contains("open")) {
        toggleBtn.innerHTML = menuSvg;
    } else {
        toggleBtn.innerHTML = exitSvg;
    }
    navbar.classList.toggle("open");
    toggleBtn.classList.toggle("open");
});

colorInput.onchange = () => {
    state.strokeColor = colorInput.value;
    state.fillColor = colorInput.value;
    strokeSelectorsSvgs.forEach((selector) => selector.setAttribute("fill", state.strokeColor));
};

// Onclick function for each stroke Width Selection Btn
// Also adding active state for chosen btn and removing active state for other stroke btns.
strokeSelectorBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
        state.width = parseInt(btn.dataset.value);
        btn.style.border = `2px outset ${darkTeal}`;

        const otherBtns = strokeSelectorBtns.filter((selectedBtn) => selectedBtn.dataset.value !== btn.dataset.value);

        otherBtns.forEach((btn) => (btn.style.border = "none"));
    })
);

// Onclick Function to clear canvas board.
clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};
