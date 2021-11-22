import { resizeCanvas, appendEventListeners, removeEventListeners } from "./helper.js";
import { menuSvg, exitSvg, activeState } from "./styles.js";

const toggleBtn = document.getElementById("toggle-btn");
const undoBtn = document.getElementById("undo-btn");
const penBtn = document.getElementById("pen-btn");
const circleBtn = document.getElementById("circle-btn");
const lineBtn = document.getElementById("line-btn");
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const menubar = document.querySelector(".menu");
const squareBtn = document.getElementById("square-btn");
const colorInput = document.getElementById("color-input");
const strokeSelectorsSvgs = [...document.getElementsByClassName("stroke-svg")];
const strokeSelectorBtns = strokeSelectorsSvgs.map((selector) => selector.parentElement);

const toolBtns = [penBtn, circleBtn, eraserBtn, squareBtn, lineBtn];

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

// Initialize history tracking of elements being drawn.
let drawHistory = [];
let drawHistoryIndex = -1;

// these variables will hold the start/end mouse position
const mouseStartPos = { x: 0, y: 0 };
const mouseEndPos = { x: 0, y: 0 };

// Default state
const state = {
    isPainting: false,
    isCircleActive: false,
    isSquareActive: false,
    isLineActive: false,
    strokeColor: colorInput.value,
    fillColor: "black",
    width: 5
};

// Canvas setup and set pen tool as default
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set menu button to show the menu svg.
toggleBtn.innerHTML = exitSvg;

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
const mouse = { x: 0, y: 0 };
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

//Initialize drawing feature and apply active state CSS to pen button and current stroke size.
appendEventListeners(canvas, startPenPos, finishedPenPos, drawPen);
penBtn.style.border = activeState;
strokeSelectorBtns[0].style.border = activeState;

// Draw - Pencil/Pen & Eraser function
function startPenPos() {
    state.isPainting = true;
    // This allows drawing of a dot.
    drawPen();
}

function finishedPenPos() {
    state.isPainting = false;
    ctx.beginPath();
    addDrawHistory();
}

function drawPen() {
    if (!state.isPainting) return;
    ctx.lineWidth = state.width;
    ctx.lineCap = "round";
    ctx.strokeStyle = state.strokeColor;
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
}

// Event listener for input [type=color], change state color base on color selected.
colorInput.onchange = () => {
    state.strokeColor = colorInput.value;
    state.fillColor = colorInput.value;
    ctx.strokeStyle = state.strokeColor;
    strokeSelectorsSvgs.forEach((selector) => selector.setAttribute("fill", state.strokeColor));
};

/////
//Button Event Listeners -
/////

// When toggle button click, change inner html to corresponding SVG.
toggleBtn.addEventListener("click", () => {
    if (!menubar.classList.contains("close")) {
        toggleBtn.innerHTML = menuSvg;
    } else {
        toggleBtn.innerHTML = exitSvg;
    }
    menubar.classList.toggle("close");
    toggleBtn.classList.toggle("close");
});

// Pen Button Event Listener - activate pen feature and remove all other listeners
penBtn.addEventListener("click", () => {
    state.strokeColor = colorInput.value;
    toolBtns.filter((btn) => btn !== penBtn).forEach((oBtn) => setInactive(oBtn));
    appendEventListeners(canvas, startPenPos, finishedPenPos, drawPen);
    penBtn.style.border = activeState;
});

//Eraser Button event listener - activate eraser feature and remove all other listeners
eraserBtn.addEventListener("click", () => {
    toolBtns.filter((btn) => btn !== eraserBtn).forEach((oBtn) => setInactive(oBtn));
    state.strokeColor = "#ffffff";
    appendEventListeners(canvas, startPenPos, finishedPenPos, drawPen);
    eraserBtn.style.border = activeState;
    //Disable color input to prevent eraser color change.
    colorInput.disabled = true;
    colorInput.style.cursor = "not-allowed";
});

// Square Button event listener - activate square feature and remove all other listeners
squareBtn.addEventListener("click", () => {
    state.strokeColor = colorInput.value;
    ctx.strokeStyle = state.strokeColor;
    ctx.lineWidth = state.width;
    toolBtns.filter((btn) => btn !== squareBtn).forEach((oBtn) => setInactive(oBtn));
    squareBtn.style.border = activeState;

    // this flag is true when the user is dragging the mouse
    state.isSquareActive = false;

    // mouse movement event listeners
    appendEventListeners(canvas, mouseDownSquare, mouseUpSquare, mouseMoveSquare);
});

// Circle Button event listener - activate circle feature and remove all other listeners
circleBtn.addEventListener("click", () => {
    toolBtns.filter((btn) => btn !== circleBtn).forEach((oBtn) => setInactive(oBtn));
    circleBtn.style.border = activeState;
    ctx.strokeStyle = state.strokeColor;
    ctx.lineWidth = state.width;
    state.isCircleActive = true;
    appendEventListeners(canvas, mouseDownCircle, mouseUpCircle);
});

// Line Button event listener - activate line feature and remove all other listeners
lineBtn.addEventListener("click", (e) => {
    toolBtns.filter((btn) => btn !== lineBtn).forEach((oBtn) => setInactive(oBtn));
    lineBtn.style.border = activeState;
    ctx.strokeStyle = state.strokeColor;
    ctx.lineWidth = state.width;
    state.isLineActive = true;
    appendEventListeners(canvas, mouseDownLine, mouseUpLine, mouseMoveLine);
});

// Undo Button event listener - will undo last drawing or clear action.
undoBtn.addEventListener("click", undoLast);

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
    addDrawHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/////
// Draw square/rect functions
/////
// variable to hold width and height
let width = 0;
let height = 0;

function mouseDownSquare() {
    // save the x/y start position
    mouseStartPos.x = mouse.x;
    mouseStartPos.y = mouse.y;

    //  flag indicating the drag has begun
    state.isSquareActive = true;
}

function mouseUpSquare() {
    // When click is released, create rectangle drawing.
    ctx.strokeRect(mouseStartPos.x, mouseStartPos.y, width, height);
    console.log("mouseStartPos:", mouseStartPos);
    state.isSquareActive = false;
    // Reset rectangle parameters to prevent a duplicate of rectangle on click
    width = 0;
    height = 0;
    addDrawHistory();
}

function mouseMoveSquare() {
    // if we're not clicking down to draw a square, return to prevent fire of the below code.
    if (!state.isSquareActive) return;

    // current mouse position
    mouseEndPos.x = mouse.x;
    mouseEndPos.y = mouse.y;

    // calculate the rectangle width/height based
    // on starting vs current mouse position
    width = mouseEndPos.x - mouseStartPos.x;
    height = mouseEndPos.y - mouseStartPos.y;
}

////
// Draw Circle Functions
////
function drawEllipse(x, y) {
    if (!state.isCircleActive) {
        return;
    }
    ctx.beginPath();
    ctx.moveTo(mouseStartPos.x, mouseStartPos.y + (y - mouseStartPos.y) / 2);
    ctx.bezierCurveTo(mouseStartPos.x, mouseStartPos.y, x, mouseStartPos.y, x, mouseStartPos.y + (y - mouseStartPos.y) / 2);
    ctx.bezierCurveTo(x, y, mouseStartPos.x, y, mouseStartPos.x, mouseStartPos.y + (y - mouseStartPos.y) / 2);
    ctx.closePath();
    ctx.stroke();
}
function mouseDownCircle() {
    mouseStartPos.x = mouse.x;
    mouseStartPos.y = mouse.y;
}
function mouseUpCircle() {
    drawEllipse(mouse.x, mouse.y);
    ctx.beginPath();
    addDrawHistory();
}

const dwnld = document.getElementById("dl");
dwnld.addEventListener("click", dlCanvas, false);

function dlCanvas() {
    var dt = canvas.toDataURL("image/png");
    this.href = dt;
}

////
// Draw straight line Functions
////
function drawLine() {
    ctx.moveTo(mouseStartPos.x, mouseStartPos.y);
    ctx.lineTo(mouseEndPos.x, mouseEndPos.y);
    ctx.stroke();
}

function mouseDownLine() {
    mouseStartPos.x = mouse.x;
    mouseStartPos.y = mouse.y;
}

function mouseMoveLine() {
    if (!state.isLineActive) return;
    ctx.beginPath();
    mouseEndPos.x = mouse.x;
    mouseEndPos.y = mouse.y;
}

function mouseUpLine(e) {
    drawLine();
    // reset to a new drawing instance on canvas. (prevents each individual drawing from connecting)
    ctx.beginPath();
    addDrawHistory();
}

////
// Function to add drawing action to history array
////
function addDrawHistory() {
    drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawHistoryIndex++;
}

////
// Undo function to revert to last snapshot of canvas.
////
function undoLast() {
    if (drawHistoryIndex <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHistory.pop();
        drawHistoryIndex = -1;
    } else {
        ctx.putImageData(drawHistory[drawHistoryIndex - 1], 0, 0);
        drawHistory.pop();
        drawHistoryIndex--;
    }
}

////
// Function to set tool button state inactive and remove their corresponding event listeners
////
function setInactive(toolBtn) {
    switch (toolBtn) {
        case penBtn:
            toolBtn.style.border = "none";
            removeEventListeners(canvas, startPenPos, finishedPenPos, drawPen);
        case eraserBtn:
            toolBtn.style.border = "none";
            state.strokeColor = colorInput.value;
            //renable the color input.
            colorInput.disabled = false;
            colorInput.style.cursor = "default";
            removeEventListeners(canvas, startPenPos, finishedPenPos, drawPen);
        case squareBtn:
            toolBtn.style.border = "none";
            state.isSquareActive = false;
            removeEventListeners(canvas, mouseDownSquare, mouseUpSquare, mouseMoveSquare);
        case circleBtn:
            toolBtn.style.border = "none";
            state.isCircleActive = false;
            removeEventListeners(canvas, mouseDownCircle, mouseUpCircle);
        case lineBtn:
            toolBtn.style.border = "none";
            state.isLineActive = false;
            removeEventListeners(canvas, mouseDownLine, mouseUpLine, mouseMoveLine);
        default:
            return;
    }
}
