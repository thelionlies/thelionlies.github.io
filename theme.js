window.onload = () => {
  const toggle = document.getElementById("personaToggle");
  
  // Load saved mode from previous visit
  const savedMode = localStorage.getItem("personaMode");
  if (savedMode === "layon") {
    document.body.classList.add("layon");
    toggle.checked = true;
  }

  // Listen for toggle changes
  toggle.addEventListener("change", () => {
    if(toggle.checked) {
      // Switch to Láyon (dark mode)
      document.body.classList.add("layon");
      localStorage.setItem("personaMode", "layon");
    } else {
      // Switch to Lion (light mode)
      document.body.classList.remove("layon");
      localStorage.setItem("personaMode", "lion");
    }
  });
};
