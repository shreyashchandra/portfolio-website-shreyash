// asset/main.js
import "./styles/styles.css";

const controls = document.querySelectorAll(".control");
const themeBtn = document.querySelector(".theme-btn");

function setupNavigation() {
  controls.forEach((control) => {
    control.addEventListener("click", (event) => {
      // Smooth scroll to section
      event.preventDefault();

      const id = control.dataset.id;
      if (id) {
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      // Update active button
      const current = document.querySelector(".control.active-btn");
      if (current) {
        current.classList.remove("active-btn");
      }
      control.classList.add("active-btn");
    });
  });
}

function setupThemeToggle() {
  if (!themeBtn) return;
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
}

function init() {
  setupNavigation();
  setupThemeToggle();
}

init();
