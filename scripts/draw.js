import { resizeCanvas } from "./resize.js";
import { menuSvg, exitSvg, activeState } from "./styles.js";

const toggleBtn = document.getElementById("toggle-btn");
const penBtn = document.getElementById("pen-btn");
const circleBtn = document.getElementById("circle-btn");
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const navbar = document.querySelector(".draw-row");
const squareBtn = document.getElementById("square-btn");
const colorInput = document.getElementById("color-input");
const strokeSelectorsSvgs = [...document.getElementsByClassName("stroke-svg")];
const strokeSelectorBtns = strokeSelectorsSvgs.map((selector) => selector.parentElement);

toggleBtn.innerHTML = menuSvg;

const toolBtns = [penBtn, circleBtn, eraserBtn, squareBtn];

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
    isCircleActive: false,
    isEraserActive: false,
    isSquareActive: false,
    strokeColor: colorInput.value,
    fillColor: "black",
    width: 1
};

// Canvas setup and set pen tool as default

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set menu button to show the menu svg.
toggleBtn.innerHTML = menuSvg;

//Initialize drawing feature and apply active state CSS to pen button and current stroke size.
canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);
penBtn.style.border = `3px outset rgb(0, 212, 169)`;
strokeSelectorBtns[0].style.border = `3px outset rgb(0, 212, 169)`;

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

// Update mouse object {x,y} position everytime it moves relative to canvas size/positioning. Prevents offset from cursor after resizing the window.
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

// Draw - Pencil/Pen & Eraser function
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

// Function to set tool button state inactive and remove their corresponding event listeners
function setInactive(toolBtn) {
    switch (toolBtn) {
        case penBtn:
            toolBtn.style.border = "none";
            canvas.removeEventListener("mousedown", startPosition);
            canvas.removeEventListener("mouseup", finishedPosition);
            canvas.removeEventListener("mousemove", draw);
        case eraserBtn:
            toolBtn.style.border = "none";
            state.isEraserActive = false;
            state.strokeColor = colorInput.value;
            //renable the color input.
            colorInput.disabled = false;
            colorInput.style.cursor = "default";
            canvas.removeEventListener("mousedown", startPosition);
            canvas.removeEventListener("mouseup", finishedPosition);
            canvas.removeEventListener("mousemove", draw);
        case squareBtn:
            toolBtn.style.border = "none";
            state.isSquareActive = false;
            canvas.removeEventListener("mousedown", mouseDown);
            canvas.removeEventListener("mousemove", mouseMove);
            canvas.removeEventListener("mouseup", mouseUp);
        case circleBtn:
            toolBtn.style.border = "none";
            state.isCircleActive = false;
            canvas.removeEventListener("mousedown", mouseDownC);
            canvas.removeEventListener("mouseup", mouseUpC);
        default:
            return;
    }
}

penBtn.addEventListener("click", () => {
    state.strokeColor = colorInput.value;
    toolBtns.filter((btn) => btn !== penBtn).forEach((oBtn) => setInactive(oBtn));
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishedPosition);
    canvas.addEventListener("mousemove", draw);
    penBtn.style.border = activeState;
});

//Eraser Button event listener - activate eraser and remove all other listeners
eraserBtn.addEventListener("click", () => {
    toolBtns.filter((btn) => btn !== eraserBtn).forEach((oBtn) => setInactive(oBtn));
    state.strokeColor = "#ffffff";
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishedPosition);
    canvas.addEventListener("mousemove", draw);
    eraserBtn.style.border = activeState;
    state.isEraserActive = true;

    //Disable color input to prevent eraser color change.
    colorInput.disabled = true;
    colorInput.style.cursor = "not-allowed";
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
    ctx.strokeStyle = state.strokeColor;
    strokeSelectorsSvgs.forEach((selector) => selector.setAttribute("fill", state.strokeColor));
};

// Onclick function for each stroke Width Selection Btn
// Also adding active state for chosen btn and removing active state for other stroke btns.
strokeSelectorBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
        state.width = parseInt(btn.dataset.value);
        ctx.lineWidth = state.width;
        btn.style.border = activeState;

        const otherBtns = strokeSelectorBtns.filter((selectedBtn) => selectedBtn.dataset.value !== btn.dataset.value);

        otherBtns.forEach((btn) => (btn.style.border = "none"));
    })
);

// Onclick Function to clear canvas board.
clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// these vars will hold the starting mouse position
let startX;
let startY;
let width = 0;
let height = 0;

function mouseDown() {
    // save the x/y
    startX = mouse.x;
    startY = mouse.y;

    //  flag indicating the drag has begun
    state.isSquareActive = true;
}

function mouseUp() {
    // When click is released, create rectangle drawing.
    ctx.strokeRect(startX, startY, width, height);
    state.isSquareActive = false;
    // Reset rectangle parameters to prevent a duplicate of rectangle on click
    startX = 0;
    startY = 0;
    width = 0;
    height = 0;
}

function mouseMove() {
    // if we're not clicking down to draw a square, return to prevent fire of the below code.
    if (!state.isSquareActive) return;

    // current mouse position
    let mouseXEndPos = mouse.x;
    let mouseYEndPos = mouse.y;

    // calculate the rectangle width/height based
    // on starting vs current mouse position
    width = mouseXEndPos - startX;
    height = mouseYEndPos - startY;
}

// circle and rect
squareBtn.addEventListener("click", () => {
    circleBtn.style.border = "none";
    state.strokeColor = colorInput.value;
    ctx.strokeStyle = state.strokeColor;
    toolBtns.filter((btn) => btn !== squareBtn).forEach((oBtn) => setInactive(oBtn));
    squareBtn.style.border = activeState;

    // this flage is true when the user is dragging the mouse
    state.isSquareActive = false;

    // mouse movement event listeners
    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("mouseup", mouseUp);
});

// circle

function drawEllipse(x, y) {
    if (!state.isCircleActive) {
        return;
    }
    ctx.beginPath();
    ctx.moveTo(startX, startY + (y - startY) / 2);
    ctx.bezierCurveTo(startX, startY, x, startY, x, startY + (y - startY) / 2);
    ctx.bezierCurveTo(x, y, startX, y, startX, startY + (y - startY) / 2);
    ctx.closePath();
    ctx.stroke();
}
function mouseDownC() {
    startX = mouse.x;
    startY = mouse.y;
}
function mouseUpC() {
    drawEllipse(mouse.x, mouse.y);
    ctx.beginPath();
}

circleBtn.addEventListener("click", () => {
    toolBtns.filter((btn) => btn !== circleBtn).forEach((oBtn) => setInactive(oBtn));
    circleBtn.style.border = activeState;
    ctx.strokeStyle = state.strokeColor;
    ctx.lineWidth = state.width;
    state.isCircleActive = true;
    canvas.addEventListener("mousedown", mouseDownC);
    canvas.addEventListener("mouseup", mouseUpC);
});

const dwnld=document.getElementById('dl');
dwnld.addEventListener('click', dlCanvas, false);
function dlCanvas(e) {
 
    var dt = canvas.toDataURL('image/png');
    this.href = dt;
};
