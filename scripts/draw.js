import { resizeCanvas } from "./resize.js";
import { menuSvg, exitSvg, activeState } from "./styles.js";

const toggleBtn = document.getElementById("toggle-btn");
const undoBtn = document.getElementById("undo-btn");
const penBtn = document.getElementById("pen-btn");
const circleBtn = document.getElementById("circle-btn");
const lineBtn=document.getElementById('line-btn');
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const menubar = document.querySelector(".menu");
const squareBtn = document.getElementById("square-btn");
const colorInput = document.getElementById("color-input");
const strokeSelectorsSvgs = [...document.getElementsByClassName("stroke-svg")];
const strokeSelectorBtns = strokeSelectorsSvgs.map((selector) => selector.parentElement);

const toolBtns = [penBtn, circleBtn, eraserBtn, squareBtn,lineBtn];

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
    isSquareActive: false,
    isLineActive:false,
    strokeColor: colorInput.value,
    fillColor: "black",
    width: 5
};

// Canvas setup and set pen tool as default

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set menu button to show the menu svg.
toggleBtn.innerHTML = exitSvg;

//Initialize drawing feature and apply active state CSS to pen button and current stroke size.
canvas.addEventListener("mousedown", startPenPos);
canvas.addEventListener("mouseup", finishedPenPos);
canvas.addEventListener("mousemove", drawPen);
penBtn.style.border = activeState;
strokeSelectorBtns[0].style.border = activeState;

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
function startPenPos() {
    state.isPainting = true;
    // This allows drawing of a dot.
    drawPen();
}

function finishedPenPos() {
    state.isPainting = false;
    ctx.save();
    ctx.beginPath();
    drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawHistoryIndex++;
}

function drawPen(e) {
    if (!state.isPainting) return;
    console.log(e);
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
            canvas.removeEventListener("mousedown", startPenPos);
            canvas.removeEventListener("mouseup", finishedPenPos);
            canvas.removeEventListener("mousemove", drawPen);
        case eraserBtn:
            toolBtn.style.border = "none";
            state.strokeColor = colorInput.value;
            //renable the color input.
            colorInput.disabled = false;
            colorInput.style.cursor = "default";
            canvas.removeEventListener("mousedown", startPenPos);
            canvas.removeEventListener("mouseup", finishedPenPos);
            canvas.removeEventListener("mousemove", drawPen);
        case squareBtn:
            toolBtn.style.border = "none";
            state.isSquareActive = false;
            canvas.removeEventListener("mousedown", mouseDownSquare);
            canvas.removeEventListener("mousemove", mouseMoveSquare);
            canvas.removeEventListener("mouseup", mouseUpSquare);
        case circleBtn:
            toolBtn.style.border = "none";
            state.isCircleActive = false;

            canvas.removeEventListener("mousedown", mouseDownCircle);
            canvas.removeEventListener("mouseup", mouseUpCircle);

         case lineBtn:
             toolBtn.style.border= "none";
             state.isLineActive=false;     
             canvas.removeEventListener('mousedown', mouseDownL);
             canvas.removeEventListener('mousemove', mouseMoveL);
             canvas.removeEventListener('mouseup', mouseupL);
           

            canvas.removeEventListener("mousedown", mouseDownCircle);
            canvas.removeEventListener("mouseup", mouseUpCircle);

        default:
            return;
    }
}

penBtn.addEventListener("click", () => {
    state.strokeColor = colorInput.value;
    toolBtns.filter((btn) => btn !== penBtn).forEach((oBtn) => setInactive(oBtn));
    canvas.addEventListener("mousedown", startPenPos);
    canvas.addEventListener("mouseup", finishedPenPos);
    canvas.addEventListener("mousemove", drawPen);
    penBtn.style.border = activeState;
});

//Eraser Button event listener - activate eraser and remove all other listeners
eraserBtn.addEventListener("click", () => {
    toolBtns.filter((btn) => btn !== eraserBtn).forEach((oBtn) => setInactive(oBtn));
    state.strokeColor = "#ffffff";
    canvas.addEventListener("mousedown", startPenPos);
    canvas.addEventListener("mouseup", finishedPenPos);
    canvas.addEventListener("mousemove", drawPen);
    eraserBtn.style.border = activeState;

    //Disable color input to prevent eraser color change.
    colorInput.disabled = true;
    colorInput.style.cursor = "not-allowed";
});

toggleBtn.addEventListener("click", () => {
    if (menubar.classList.contains("open")) {
        toggleBtn.innerHTML = exitSvg;
    } else {
        toggleBtn.innerHTML = menuSvg;
    }
    menubar.classList.toggle("open");
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
let mouseXStartPos;
let mouseYStartPos;
let width = 0;
let height = 0;

function mouseDownSquare() {
    // save the x/y
    mouseXStartPos = mouse.x;
    mouseYStartPos = mouse.y;

    //  flag indicating the drag has begun
    state.isSquareActive = true;
}

function mouseUpSquare() {
    // When click is released, create rectangle drawing.
    ctx.strokeRect(mouseXStartPos, mouseYStartPos, width, height);
    state.isSquareActive = false;
    // Reset rectangle parameters to prevent a duplicate of rectangle on click
    mouseXStartPos = 0;
    mouseYStartPos = 0;
    width = 0;
    height = 0;
    drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawHistoryIndex++;
}

function mouseMoveSquare() {
    // if we're not clicking down to draw a square, return to prevent fire of the below code.
    if (!state.isSquareActive) return;

    // current mouse position
    let mouseXEndPos = mouse.x;
    let mouseYEndPos = mouse.y;

    // calculate the rectangle width/height based
    // on starting vs current mouse position
    width = mouseXEndPos - mouseXStartPos;
    height = mouseYEndPos - mouseYStartPos;
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
    canvas.addEventListener("mousedown", mouseDownSquare);
    canvas.addEventListener("mousemove", mouseMoveSquare);
    canvas.addEventListener("mouseup", mouseUpSquare);
});

// circle

function drawEllipse(x, y) {
    if (!state.isCircleActive) {
        return;
    }
    ctx.beginPath();
    ctx.moveTo(mouseXStartPos, mouseYStartPos + (y - mouseYStartPos) / 2);
    ctx.bezierCurveTo(mouseXStartPos, mouseYStartPos, x, mouseYStartPos, x, mouseYStartPos + (y - mouseYStartPos) / 2);
    ctx.bezierCurveTo(x, y, mouseXStartPos, y, mouseXStartPos, mouseYStartPos + (y - mouseYStartPos) / 2);
    ctx.closePath();
    ctx.stroke();
}
function mouseDownCircle() {
    mouseXStartPos = mouse.x;
    mouseYStartPos = mouse.y;
}
function mouseUpCircle() {
    drawEllipse(mouse.x, mouse.y);
    ctx.beginPath();
    drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawHistoryIndex++;
}

circleBtn.addEventListener("click", () => {
    toolBtns.filter((btn) => btn !== circleBtn).forEach((oBtn) => setInactive(oBtn));
    circleBtn.style.border = activeState;
    ctx.strokeStyle = state.strokeColor;
    ctx.lineWidth = state.width;
    state.isCircleActive = true;
    canvas.addEventListener("mousedown", mouseDownCircle);
    canvas.addEventListener("mouseup", mouseUpCircle);
});

const dwnld = document.getElementById("dl");
dwnld.addEventListener("click", dlCanvas, false);
function dlCanvas(e) {
    var dt = canvas.toDataURL("image/png");
    this.href = dt;
}

// line btn here

let startPosition = {x: 0, y: 0};
let lineCoordinates = {x: 0, y: 0};
let isDrawStart = false;

const getClientOffset = (e) => {
    const {pageX, pageY} = e.touches ? e.touches[0] : e;
    const x = pageX - canvas.offsetLeft;
    const y = pageY - canvas.offsetTop;
   
    return {
       x,
       y
    } 
}

console.log(canvas.offsetTop);
function drawLine () {
   
   ctx.moveTo(startPosition.x, startPosition.y);
   ctx.lineTo(lineCoordinates.x, lineCoordinates.y);
   ctx.stroke();
}

function mouseDownL(e) {
   startPosition = getClientOffset(e);
   console.log('sp',startPosition);
   isDrawStart = true;
 
}

function mouseMoveL (e) {
  if(!isDrawStart) return;
  ctx.beginPath();
  lineCoordinates = getClientOffset(e);
  console.log('lc',lineCoordinates);

  
}

function mouseupL (e) {
    drawLine();
  isDrawStart = false;
}
lineBtn.addEventListener('click',(e)=>{
    toolBtns.filter((btn) => btn !== lineBtn).forEach((oBtn) => setInactive(oBtn));
    lineBtn.style.border = activeState;
    ctx.strokeStyle = state.strokeColor;
    ctx.lineWidth = state.width;
    state.isLineActive = true;

    canvas.addEventListener('mousedown', mouseDownL);
    canvas.addEventListener('mousemove', mouseMoveL);
    canvas.addEventListener('mouseup', mouseupL);
})


let drawHistory = [];
let drawHistoryIndex = -1;

function undoLast() {
    if (drawHistoryIndex <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHistory.pop();
        drawHistoryIndex--;
    } else {
        ctx.putImageData(drawHistory[drawHistoryIndex - 1], 0, 0);
        drawHistory.pop();
        drawHistoryIndex--;
    }
}

undoBtn.addEventListener("click", undoLast);
