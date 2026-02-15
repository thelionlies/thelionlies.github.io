function toggleMode() {
  const currentPath = window.location.pathname;

  if (currentPath.includes("/layon/")) {
    // switch to Lion equivalent page
    window.location.pathname = currentPath.replace("/layon/", "/");
  } else {
    // switch to Láyon equivalent page
    window.location.pathname = "/layon/" + currentPath.split("/").pop();
  }
}
