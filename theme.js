function toggleMode() {
  document.body.classList.toggle("layon");
  const mode = document.body.classList.contains("layon") ? "layon" : "lion";
  localStorage.setItem("mode", mode);
}

window.onload = () => {
  const saved = localStorage.getItem("mode");
  if (saved === "layon") {
    document.body.classList.add("layon");
  }
};
