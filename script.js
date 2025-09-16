


// Este archivo solo controla los tabs en index.html

document.addEventListener('DOMContentLoaded', () => {
  function openTab(evt, tabId) {
    const contents = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-button");

    contents.forEach(c => c.classList.remove("active"));
    buttons.forEach(b => b.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
  }

  window.openTab = openTab;
});
