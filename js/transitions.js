function fadeTo(url) {
  const overlay = document.getElementById("fade-overlay");
  overlay.classList.add("active");
  setTimeout(() => {
    window.location.href = url;
  }, 2800);
}

window.onload = () => {
  const overlay = document.getElementById("fade-overlay");
  setTimeout(() => {
    overlay.classList.remove("active");
  }, 2100);
};
