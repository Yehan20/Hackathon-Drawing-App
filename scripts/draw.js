import { resizeCanvas } from "./resize.js";
import { menuSvg, exitSvg, activeState } from "./styles.js";

const toggleBtn = document.getElementById("toggle-btn");
const penBtn = document.getElementById("pen-btn");
const circleBtn = document.getElementById("circle-btn");
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const navbar = document.querySelector(".draw-row");
const squareBtn=document.getElementById('square-btn');
const colorInput = document.getElementById("color-input");
const strokeSelectorsSvgs = [...document.getElementsByClassName("stroke-svg")];
const strokeSelectorBtns = strokeSelectorsSvgs.map((selector) => selector.parentElement);

toggleBtn.innerHTML = menuSvg;

const toolBtns = [penBtn, circleBtn, eraserBtn];

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
    isCircleActive: false,
    isEraserActive: false,
    isSqaure:false,
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
            state.isPenActive = false;
            canvas.removeEventListener("mousedown", startPosition);
            canvas.removeEventListener("mouseup", finishedPosition);
            canvas.removeEventListener("mousemove", draw);
        case eraserBtn:
            toolBtn.style.border = "none";
            state.isEraserActive = false;
            state.strokeColor = colorInput.value;
            canvas.removeEventListener("mousedown", startPosition);
            canvas.removeEventListener("mouseup", finishedPosition);
            canvas.removeEventListener("mousemove", draw);
        default:
            return;
    }
}

penBtn.addEventListener("click", () => {
    state.strokeColor = colorInput.value;
    squareBtn.style.border="none";
    circleBtn.style.border='none';
    toolBtns.filter((btn) => btn !== penBtn).forEach((oBtn) => setInactive(oBtn));
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishedPosition);
    canvas.addEventListener("mousemove", draw);
    penBtn.style.border = activeState;
    state.isPenActive = true;
    console.log(state);
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
        btn.style.border = `3px outset rgb(0, 212, 169)`;

        const otherBtns = strokeSelectorBtns.filter((selectedBtn) => selectedBtn.dataset.value !== btn.dataset.value);

        otherBtns.forEach((btn) => (btn.style.border = "none"));
    })
);

// Onclick Function to clear canvas board.
clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};


// circle and rect
squareBtn.addEventListener('click',()=>{
    state.strokeColor = colorInput.value;
    ctx.lineWidth = state.width;
    circleBtn.style.border='none';
     if(!state.isSqaure){
         toolBtns.filter((btn) => btn !== squareBtn).forEach((oBtn) => setInactive(oBtn));
         squareBtn.style.border = `3px outset teal`;
         state.isPainting=false;
         state.isEraserActive=false;
         let canvasOffset = canvas.getBoundingClientRect();
         
         
         // this flage is true when the user is dragging the mouse
         state.isSqaure = false;
         
         // these vars will hold the starting mouse position
         let startX;
         let startY;
         let x1 = null
         let x2 = null
         let y1 = null
         let y2 = null
         
         function mouseDown(e) {
             console.log('handleMouseDown')
         
             // save the starting x/y of the rectangle
             startX = parseInt(e.clientX);
             startY = parseInt(e.clientY);
         
             // set a flag indicating the drag has begun
             state.isSqaure = true;
         }
         
         function mouseUp(e) {
             console.log('handleMouseUp')
     
         
             // the drag is over, clear the dragging flag
             state.isSqaure = false;
          
         }
         
         function mouseOut(e) {
             console.log('handleMouseOut')
         
         
             // the drag is over, clear the dragging flag
             state.isSqaure = false; 
         }
         
         function mouseMove(e) {
             console.log('handleMouseMove')
     
         
             // if we're not dragging, just return
             if (!state.isSqaure)return;
         
             // get the current mouse position
             let mouseX,mouseY;
             mouseX = parseInt(e.clientX);
             mouseY = parseInt(e.clientY);
             
             ctx.strokeStyle = state.strokeColor;
             ctx.lineWidth = state.width;
         
             // Put your mousemove stuff here
         
             // clear the canvas
             ctx.clearRect(0, 0, canvas.width, canvas.height);
         
             // calculate the rectangle width/height based
             // on starting vs current mouse position
             let width = mouseX - startX;
             let height = mouseY - startY;
         
             // draw a new rect from the start position 
             // to the current mouse position
             ctx.strokeRect(startX, startY, width, height);
             x1 = startX
             y1 = startY
             x2 = width
             y2 = height
         
         }
         
         // mouse movement event listeners
         canvas.addEventListener('mousedown', mouseDown);
         canvas.addEventListener('mousemove',mouseMove);
         canvas.addEventListener('mouseup',mouseUp);
         canvas.addEventListener('mouseout',mouseOut );
         }
         else{
             state.isSqaure=false;
             squareBtn.style.border='none';
             console.log('none');
         }
  
  
    
 });
 
 
 // circle
 circleBtn.addEventListener('click',()=>{
     
   
     squareBtn.style.border='none';
     state.isPainting=false;
     state.isSqaure=false;
     let canvasOffset = canvas.getBoundingClientRect();
     let offsetX=canvasOffset.left;
     let offsetY=canvasOffset.top;
     let startX, startY, mouseX, mouseY;
     let isDown=false;
     if (!isDown) {
         isDown = true;
         toolBtns.filter((btn) => btn !== circleBtn).forEach((oBtn) => setInactive(oBtn));
         circleBtn.style.border = `3px outset teal`;
     }
     function drawOval(x,y){
         ctx.clearRect(0,0,canvas.width,canvas.height);
         ctx.beginPath();
         ctx.moveTo(startX, startY + (y-startY)/2);
         ctx.bezierCurveTo(startX, startY, x, startY, x, startY + (y-startY)/2);
         ctx.bezierCurveTo(x, y, startX, y, startX, startY + (y-startY)/2);
         ctx.closePath();
         ctx.stroke();
     }
     function handleMouseDown(e){
     
       startX=parseInt(e.clientX-offsetX);
       startY=parseInt(e.clientY-offsetY);
       isDown=true;
     }
     function handleMouseUp(e){
       if(!isDown){ return; }
      
       isDown=false;
     }
     function handleMouseOut(e){
       if(!isDown){ return; }
      
       isDown=false;
     }
     function handleMouseMove(e){
       if(!isDown){ return; }
       ctx.strokeStyle = state.strokeColor;
       ctx.lineWidth = state.width;
   
       mouseX=parseInt(e.clientX-offsetX);
       mouseY=parseInt(e.clientY-offsetY);
       drawOval(mouseX,mouseY);
     }
     canvas.addEventListener('mousedown',handleMouseDown);
     canvas.addEventListener('mousemove',handleMouseMove);
     canvas.addEventListener('mouseup',handleMouseUp);
     canvas.addEventListener('mouseout',handleMouseOut);
 });
