/**
 * Adds a legend to the given Leaflet map.
 *
 * @param {Object} L - The Leaflet library object.
 * @param {Object} map - The Leaflet map instance.
 */
export function addLegend(L, map) {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    Object.assign(div.style, {
      backgroundColor: "black",
      color: "white",
      padding: "10px",
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
      fontSize: "12px",
    });

    div.innerHTML = `
        <h4 style="margin: 0; padding: 0; font-size: 14px; text-align: center;">Legend</h4>
        <div style="display: flex; align-items: center; margin: 8px 0;">
          <img src="https://static.vecteezy.com/system/resources/thumbnails/034/759/406/small/location-map-pin-gps-pointer-markers-3d-realistic-icon-png.png" width="20" height="20">
          <span style="margin-left: 8px;">City Marker</span>
        </div>
        <div style="display: flex; align-items: center; margin: 8px 0;">
          <div style="width: 20px; height: 20px; background-color: maroon; border-radius: 50%;"></div>
          <span style="margin-left: 8px;">Nationality Cluster</span>
        </div>
        <div style="display: flex; align-items: center; margin: 8px 0;">
          <div style="width: 20px; height: 3px; background-color: white;"></div>
          <span style="margin-left: 8px;">Connection Line</span>
        </div>
      `;
    return div;
  };

  legend.addTo(map);
}

/**
 * Creates a selected nationality tag element.
 *
 * This function generates a tag element to represent a selected nationality,
 * complete with a remove button for user interaction.
 *
 * @param {string} nationality - The nationality to create a tag for.
 * @returns {HTMLElement} The created tag element with the specified nationality.
 */
export function createSelectedTag(nationality) {
  // Create a container div for the tag
  const tag = document.createElement("div");
  tag.className = "selected-tag"; // Add class for styling
  tag.dataset.value = nationality; // Store nationality as a dataset value

  // Set the inner HTML of the tag, including the remove button
  tag.innerHTML = `
      ${nationality}
      <button data-value="${nationality}">&times;</button>
    `;

  return tag; // Return the constructed tag element
}
