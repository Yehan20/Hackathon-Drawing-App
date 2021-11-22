// Function that saves canvas state (current drawing) on a memory canvas => resizes => draws memory canvas back on original canvas.
export function resizeCanvas(inMemCanvas, inMemCtx, canvas, ctx) {
    inMemCanvas.width = canvas.width;
    inMemCanvas.height = canvas.height;
    inMemCtx.drawImage(canvas, 0, 0);
    if (window.innerWidth < inMemCanvas.width) {
        ctx.drawImage(inMemCanvas, 0, 0);
    } else if (window.innerWidth > inMemCanvas.width) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.drawImage(inMemCanvas, 0, 0);
    }
}

// Function to add group of event listeners.
export const removeEventListeners = (canvas, mousedown, mouseup, mousemove = null) => {
    canvas.removeEventListener("mousedown", mousedown);
    canvas.removeEventListener("mouseup", mouseup);
    if (mousemove) {
        canvas.removeEventListener("mousemove", mousemove);
    } else {
        return;
    }
};
export const appendEventListeners = (canvas, mousedown, mouseup, mousemove = null) => {
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    if (mousemove) {
        canvas.addEventListener("mousemove", mousemove);
    } else {
        return;
    }
};
