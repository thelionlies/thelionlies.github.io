window.onload = () => {
  const toggle = document.getElementById("personaToggle");
  if (!toggle) return;

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const layonIndex = pathParts.indexOf("layon");
  const inLayon = layonIndex !== -1;

  if (inLayon) {
    document.body.classList.add("layon");
    toggle.checked = true;
    localStorage.setItem("personaMode", "layon");
  } else {
    document.body.classList.remove("layon");
    toggle.checked = false;
    localStorage.setItem("personaMode", "lion");
  }

  const buildTargetPath = () => {
    const parts = [...pathParts];
    const lastPart = parts[parts.length - 1];
    const hasFile = lastPart && lastPart.includes(".");

    if (inLayon) {
      parts.splice(layonIndex, 1);
      if (!hasFile) {
        parts.push("index.html");
      }
      return "/" + parts.join("/");
    }

    if (parts.length === 0) {
      return "/layon/index.html";
    }

    if (hasFile) {
      parts.splice(parts.length - 1, 0, "layon");
      return "/" + parts.join("/");
    }

    parts.push("layon", "index.html");
    return "/" + parts.join("/");
  };

  toggle.addEventListener("change", () => {
    const targetPath = buildTargetPath();
    window.location.href = targetPath;
  });
};
