const toggleBtn = document.getElementById("toggle-btn");
const toggleBtnImg = document.getElementById("toggle-btn-img");
const navbar = document.querySelector(".draw-row");

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

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
let inMemCanvas = document.createElement("canvas");
let inMemCtx = inMemCanvas.getContext("2d");

// Function that saves canvas state (current drawing) on a memory canvas => resizes => draws memory canvas back on original canvas.
function resizeCanvas() {
    inMemCanvas.width = canvas.width;
    inMemCanvas.height = canvas.height;
    inMemCtx.drawImage(canvas, 0, 0);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.drawImage(inMemCanvas, 0, 0);
}

// Debounce function that will fire a callback method after 1 second from the last resize event.
function setResizeHandler(callback, timeout) {
    let timer_id = undefined;
    window.addEventListener("resize", function () {
        if (!timer_id) {
            clearTimeout(timer_id);
            timer_id = undefined;
        }
        timer_id = setTimeout(function () {
            timer_id = undefined;
            callback();
        }, timeout);
    });
}
setResizeHandler(resizeCanvas, 1000);

let painting = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Draw - Pencil/Pen function
function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.save();
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);

// Update mouse object {x,y} position everytime it moves relative to canvas size/positioning. (Including resize)
// let mouse = { x: 0, y: 0 };
// window.addEventListener("mousemove", function (evt) {
//     var mousePos = getMousePos(canvas, evt);
//     mouse.x = mousePos.x;
//     mouse.y = mousePos.y;
// });

// function getMousePos(canvas, event) {
//     let rect = canvas.getBoundingClientRect();
//     return {
//         x: event.clientX - rect.left,
//         y: event.clientY - rect.top
//     };
// }
