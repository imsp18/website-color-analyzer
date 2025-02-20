document.getElementById("analyzeBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "analyzeColors" });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.colors) {
    updateColorList("colorList", message.colors);
    document.getElementById("saveBtn").style.display = "block";
  }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url).hostname.replace("www.", ""); // Shortened domain name

    chrome.storage.local.get("savedPalettes", (data) => {
      const savedPalettes = data.savedPalettes || {};
      savedPalettes[url] = currentColors; // Save with website name

      chrome.storage.local.set({ savedPalettes }, () => {
        alert("Palette saved for " + url);
        loadSavedPalettes();
      });
    });
  });
});

// Updates the UI color list
function updateColorList(listId, colors) {
  const colorList = document.getElementById(listId);
  colorList.innerHTML = "";

  colors.forEach((color) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<span class="color-box" style="background:${color}"></span> ${color}`;

    listItem.addEventListener("click", () => {
      navigator.clipboard.writeText(color);
      alert(`Copied: ${color}`);
    });

    colorList.appendChild(listItem);
  });

  currentColors = colors; // Store current colors for saving
}

// Load saved palettes when popup opens
function loadSavedPalettes() {
  const savedList = document.getElementById("savedColors");
  savedList.innerHTML = "";

  chrome.storage.local.get("savedPalettes", (data) => {
    const savedPalettes = data.savedPalettes || {};

    for (const site in savedPalettes) {
      const palette = savedPalettes[site];

      const siteItem = document.createElement("li");
      siteItem.innerHTML = `<strong>${site}</strong>: ${palette.join(", ")}`;
      savedList.appendChild(siteItem);
    }
  });
}

loadSavedPalettes();
