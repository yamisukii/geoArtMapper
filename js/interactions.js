export function exportMapAsImage() {
  const mapContainer = document.getElementById("map");

  html2canvas(mapContainer, {
    useCORS: true, // Handle cross-origin issues
  }).then((canvas) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "map-screenshot.png";
    link.click();
  });
}
