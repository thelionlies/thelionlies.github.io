window.onload = () => {
  const toggle = document.getElementById("personaToggle");
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

    window.location.href = `${targetPath}${window.location.search}${window.location.hash}`;
  });
};
