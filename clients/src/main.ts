import "./style.css";

function app() {
  const buttons = document.querySelectorAll<HTMLAnchorElement>(".button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("clicked");

      window.setTimeout(() => {
        button.classList.remove("clicked");
      }, 180);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => app());
