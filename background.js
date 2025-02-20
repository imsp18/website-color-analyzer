chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeColors") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: analyzeColors,
      });
    });
  }
});

function analyzeColors() {
  const colorCounts = {};
  const elements = document.querySelectorAll("*");

  function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    return result
      ? `#${(
          (1 << 24) |
          (parseInt(result[0]) << 16) |
          (parseInt(result[1]) << 8) |
          parseInt(result[2])
        )
          .toString(16)
          .slice(1)
          .toUpperCase()}`
      : rgb;
  }

  elements.forEach((element) => {
    const styles = window.getComputedStyle(element);
    const color = rgbToHex(styles.color);
    const bgColor = rgbToHex(styles.backgroundColor);

    if (color.startsWith("#")) {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
    if (bgColor.startsWith("#")) {
      colorCounts[bgColor] = (colorCounts[bgColor] || 0) + 1;
    }
  });

  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);

  chrome.runtime.sendMessage({ colors: sortedColors });

  chrome.runtime.sendMessage({ action: "saveColors", colors: sortedColors });
}
