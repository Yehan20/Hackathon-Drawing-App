const canvas = document.querySelector("#canvas");
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

const ctx = canvas.getContext("2d");

let painting = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: 0, y: 0 };

// Update mouse object {x,y} position everytime it moves relative to canvas size/positioning. (Including resize)

window.addEventListener("mousemove", function (evt) {
    var mousePos = getMousePos(canvas, evt);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
});

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Draw - Pencil/Pen function
function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);

//
