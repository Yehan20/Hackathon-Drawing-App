const toggleBtn = document.getElementById("toggle-btn");
const toggleBtnImg = document.getElementById("toggle-btn-img");
const navbar = document.querySelector(".draw-row");

toggleBtn.addEventListener("click", () => {
    if (navbar.classList.contains("d-none")) {
        navbar.classList.remove("d-none");
        toggleBtn.style.border = "1px solid black";
        toggleBtnImg.src = "images/exit.svg";
    } else {
        navbar.classList.add("d-none");
        toggleBtn.style.background = "white";
        toggleBtn.style.border = "none";
        toggleBtnImg.src = "images/menu.svg";
    }
});
console.log(toggleBtn);
