window.onload = () => {
  const toggle = document.getElementById("personaToggle");

  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      event.preventDefault();
      window.location.replace(`${href}${window.location.search}${window.location.hash}`);
    });
  });

  if (!toggle) return;

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const inLayon = pathParts.includes("layon");
  const lastPart = pathParts[pathParts.length - 1] || "";
  const hasFile = lastPart.includes(".");
  const fileName = hasFile ? lastPart : "index.html";

  if (inLayon) {
    document.body.classList.add("layon");
    toggle.checked = true;
    localStorage.setItem("personaMode", "layon");
  } else {
    document.body.classList.remove("layon");
    toggle.checked = false;
    localStorage.setItem("personaMode", "lion");
  }

  toggle.addEventListener("change", () => {
    const targetPath = toggle.checked
      ? (inLayon ? fileName : `layon/${fileName}`)
      : (inLayon ? `../${fileName}` : fileName);

    window.location.replace(`${targetPath}${window.location.search}${window.location.hash}`);
  });
};
