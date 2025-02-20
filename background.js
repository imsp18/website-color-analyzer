chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeColors") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: analyzeColors,
      });
    });
  }
});

function analyzeColors() {
  const colorCounts = {};
  const elements = document.getElementsByTagName("*");

  for (const element of elements) {
    const color = window.getComputedStyle(element).color;
    const backgroundColor = window.getComputedStyle(element).backgroundColor;

    if (color !== "rgba(0, 0, 0, 0)") {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
    if (backgroundColor !== "rgba(0, 0, 0, 0)") {
      colorCounts[backgroundColor] = (colorCounts[backgroundColor] || 0) + 1;
    }
  }

  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => rgbToHex(color));

  chrome.runtime.sendMessage({
    colors: sortedColors,
    url: window.location.hostname,
  });
}

function rgbToHex(rgb) {
  const [r, g, b] = rgb.match(/\d+/g);
  return (
    "#" +
    (
      (1 << 24) +
      (Number.parseInt(r) << 16) +
      (Number.parseInt(g) << 8) +
      Number.parseInt(b)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
}
