function analyzeColors() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "Anonymous";

  function getScreenshot() {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawWindow(
      window,
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      "rgb(255,255,255)"
    );
    return canvas.toDataURL();
  }

  img.src = getScreenshot();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = extractColors(imageData.data);
    chrome.runtime.sendMessage({ colors: colors });
  };
}

function extractColors(pixels) {
  const colorCounts = {};
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const rgb = `rgb(${r},${g},${b})`;
    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
  }

  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);

  return sortedColors;
}

analyzeColors();
