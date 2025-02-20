document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const savedPalettesBtn = document.getElementById("savedPalettesBtn");
  const colorPalette = document.getElementById("colorPalette");
  const harmonies = document.getElementById("harmonies");
  const savedPalettes = document.getElementById("savedPalettes");

  analyzeBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "analyzeColors" });
  });

  savedPalettesBtn.addEventListener("click", () => {
    showSavedPalettes();
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.colors) {
      displayColorPalette(request.colors);
      savePalette(request.url, request.colors);
      showColorHarmonies(request.colors[0]);
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

  function savePalette(url, colors) {
    chrome.storage.local.get("savedPalettes", (result) => {
      const savedPalettes = result.savedPalettes || {};
      savedPalettes[url] = colors;
      chrome.storage.local.set({ savedPalettes: savedPalettes });
    });
  }

  function showSavedPalettes() {
    chrome.storage.local.get("savedPalettes", (result) => {
      const savedPalettesObj = result.savedPalettes || {};
      savedPalettes.innerHTML = "";

      for (const [url, colors] of Object.entries(savedPalettesObj)) {
        const paletteDiv = document.createElement("div");
        paletteDiv.className = "saved-palette";

        const colorsDiv = document.createElement("div");
        colorsDiv.className = "saved-palette-colors";

        colors.forEach((color) => {
          const colorDiv = document.createElement("div");
          colorDiv.className = "saved-palette-color";
          colorDiv.style.backgroundColor = color;
          colorsDiv.appendChild(colorDiv);
        });

        const urlSpan = document.createElement("span");
        urlSpan.className = "saved-palette-url";
        urlSpan.textContent = url;

        paletteDiv.appendChild(colorsDiv);
        paletteDiv.appendChild(urlSpan);
        savedPalettes.appendChild(paletteDiv);
      }
    });
  }

  function showColorHarmonies(baseColor) {
    const harmoniesData = calculateHarmonies(baseColor);
    harmonies.innerHTML = "";

    for (const [name, colors] of Object.entries(harmoniesData)) {
      const harmonyDiv = document.createElement("div");
      harmonyDiv.className = "harmony";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = name + ": ";
      harmonyDiv.appendChild(nameSpan);

      colors.forEach((color) => {
        const colorDiv = document.createElement("div");
        colorDiv.className = "harmony-color";
        colorDiv.style.backgroundColor = color;
        harmonyDiv.appendChild(colorDiv);
      });

      harmonies.appendChild(harmonyDiv);
    }
  }

  function calculateHarmonies(baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    return {
      Complementary: [baseColor, hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)],
      Analogous: [
        baseColor,
        hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
      ],
      Triadic: [
        baseColor,
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
      ],
    };
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null;
  }

  function rgbToHsl(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }
});
