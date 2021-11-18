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
