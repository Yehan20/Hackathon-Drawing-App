import { resizeCanvas } from "./resize.js";

const toggleBtn = document.getElementById("toggle-btn");
const penBtn = document.getElementById("pen-btn");
const toggleBtnImg = document.getElementById("toggle-btn-img");
const navbar = document.querySelector(".draw-row");
const colorInput = document.getElementById("color-input");
const strokeSelectors = [...document.querySelectorAll("button > svg")];

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
let inMemCanvas = document.createElement("canvas");
let inMemCtx = inMemCanvas.getContext("2d");

// Default state

const state = {
    isPainting: false,
    isPenActive: true,
    strokeColor: "black",
    fillColor: "black",
    width: 1
};

// Canvas setup and set pen tool as default

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);
penBtn.style.border = "2px solid red";
strokeSelectors[0].parentElement.style.border = "2px solid red";

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
penBtn.addEventListener("click", () => {
    if (!state.isPenActive) {
        state.isPenActive = true;
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishedPosition);
        canvas.addEventListener("mousemove", draw);
        penBtn.style.border = "3px solid red";
    } else {
        state.isPenActive = false;
        canvas.removeEventListener("mousedown", startPosition);
        canvas.removeEventListener("mouseup", finishedPosition);
        canvas.removeEventListener("mousemove", draw);
        penBtn.style.border = "none";
    }
});

toggleBtn.addEventListener("click", () => {
    if (navbar.classList.contains("d-none")) {
        navbar.classList.remove("d-none");
        toggleBtn.style.left = "50px";
        toggleBtnImg.src = "images/exit.svg";
    } else {
        navbar.classList.add("d-none");
        toggleBtn.style.left = 0;
        toggleBtnImg.src = "images/menu.svg";
    }
});

colorInput.onchange = () => {
    state.strokeColor = colorInput.value;
    state.fillColor = colorInput.value;
    strokeSelectors.forEach((selector) => selector.setAttribute("fill", state.strokeColor));
};

strokeSelectors.forEach((selector) =>
    selector.parentElement.addEventListener("click", () => {
        state.width = parseInt(selector.parentElement.dataset.value);
        selector.parentElement.style.border = "2px solid red";

        let otherSelectors = strokeSelectors.filter((selected) => selected.parentElement.dataset.value !== selector.parentElement.dataset.value);

        otherSelectors.forEach((oSelector) => (oSelector.parentElement.style.border = "none"));
    })
);
