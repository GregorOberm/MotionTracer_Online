document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.querySelector("#site-footer");
  if (!placeholder) return;

  const response = await fetch("footer.html");
  if (!response.ok) throw new Error("Footer konnte nicht geladen werden");

  placeholder.outerHTML = await response.text();
});