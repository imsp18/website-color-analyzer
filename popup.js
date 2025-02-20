document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const colorPalette = document.getElementById("colorPalette");

  analyzeBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "analyzeColors" });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.colors) {
      displayColorPalette(request.colors);
    }
  });

  function displayColorPalette(colors) {
    colorPalette.innerHTML = "";
    colors.forEach((color) => {
      const colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = color;

      const colorCode = document.createElement("span");
      colorCode.className = "color-code";
      colorCode.textContent = color;

      colorBox.appendChild(colorCode);
      colorPalette.appendChild(colorBox);

      colorBox.addEventListener("click", () => {
        navigator.clipboard.writeText(color).then(() => {
          alert("Color code copied to clipboard!");
        });
      });
    });
  }
});
