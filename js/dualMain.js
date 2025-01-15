import { restrictedCountryColors } from "./CountryColors.js";
import { loadData } from "./dataLoader.js";
import { filterExhibitionsByYear } from "./filters.js";
import {
  addCityMarkers,
  addConnectingLines,
  addCountryClusters,
  addLegend,
  initializeMap,
} from "./map.js";

async function initializeMapInstance(
  mapId,
  controlsId,
  yearSliderId,
  yearLabelId,
  nationalityDropdownId,
  toggleLinesButtonId,
  defaultYear = 1905,
  defaultNationality = null
) {
  console.log("Initializing map instance for:", mapId); // Debug log
  const mapContainer = document.getElementById(mapId);
  if (!mapContainer) {
    console.error(`Map container not found: ${mapId}`);
    return;
  }

  const map = initializeMap(mapId);
  addLegend(map); // Ensure this is defined
  const data = await loadData();

  const yearSlider = document.getElementById(yearSliderId);
  const yearLabel = document.getElementById(yearLabelId);
  const nationalityDropdown = document.getElementById(nationalityDropdownId);
  const toggleLinesButton = document.getElementById(toggleLinesButtonId);
  const selectedContainer = document.getElementById(
    `${nationalityDropdownId}-selected`
  );

  if (!yearSlider || !yearLabel || !nationalityDropdown || !toggleLinesButton) {
    console.error(
      `Missing elements: ${yearSliderId}, ${yearLabelId}, ${nationalityDropdownId}, ${toggleLinesButtonId}`
    );
    return;
  }

  let showLines = true;

  // Populate dropdown
  Object.keys(restrictedCountryColors).forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    nationalityDropdown.appendChild(option);
  });

  yearSlider.value = defaultYear;
  yearLabel.textContent = defaultYear;

  if (defaultNationality) {
    nationalityDropdown.value = defaultNationality;

    const tag = document.createElement("div");
    tag.className = "selected-tag";
    tag.dataset.value = defaultNationality;
    tag.innerHTML = `
      ${defaultNationality}
      <button data-value="${defaultNationality}">&times;</button>
    `;
    selectedContainer.appendChild(tag);
  }

  async function updateMap() {
    console.log("Updating map:", mapId);
    map.eachLayer((layer) => {
      if (
        layer instanceof L.CircleMarker ||
        layer instanceof L.Marker ||
        layer instanceof L.Polyline
      ) {
        map.removeLayer(layer);
      }
    });

    const year = yearSlider.value;
    const selectedNationalities = getSelectedNationalities();

    const filteredExhibitions = filterExhibitionsByYear(data, year).filter(
      (exhibition) =>
        selectedNationalities.length === 0 ||
        selectedNationalities.includes(exhibition["nationality"])
    );

    await addCountryClusters(map, filteredExhibitions);
    addCityMarkers(map, filteredExhibitions);

    if (showLines) {
      await addConnectingLines(map, filteredExhibitions);
    }
  }

  function getSelectedNationalities() {
    const selectedTags = document.querySelectorAll(
      `#${nationalityDropdownId}-selected .selected-tag`
    );
    return Array.from(selectedTags).map((tag) => tag.dataset.value);
  }

  // Event Listeners
  nationalityDropdown.addEventListener("change", async () => {
    const selectedValue = nationalityDropdown.value;
    if (
      Array.from(selectedContainer.children).some(
        (tag) => tag.dataset.value === selectedValue
      )
    ) {
      nationalityDropdown.value = "";
      return;
    }

    const tag = document.createElement("div");
    tag.className = "selected-tag";
    tag.dataset.value = selectedValue;
    tag.innerHTML = `
      ${selectedValue}
      <button data-value="${selectedValue}">&times;</button>
    `;
    selectedContainer.appendChild(tag);

    await updateMap();
    nationalityDropdown.value = "";
  });

  selectedContainer.addEventListener("click", async (event) => {
    if (event.target.tagName === "BUTTON") {
      const valueToRemove = event.target.dataset.value;
      const tagToRemove = Array.from(selectedContainer.children).find(
        (tag) => tag.dataset.value === valueToRemove
      );
      if (tagToRemove) {
        selectedContainer.removeChild(tagToRemove);
      }
      await updateMap();
    }
  });

  toggleLinesButton.addEventListener("click", async () => {
    showLines = !showLines;
    toggleLinesButton.textContent = showLines ? "Hide Lines" : "Show Lines";
    await updateMap();
  });

  yearSlider.addEventListener("input", async () => {
    yearLabel.textContent = yearSlider.value;
    await updateMap();
  });

  await updateMap();
}

document.addEventListener("DOMContentLoaded", async () => {
  await initializeMapInstance(
    "map1",
    "controls1",
    "yearSlider1",
    "yearLabel1",
    "nationalityDropdown1",
    "toggleShowLines1",
    1905,
    "Austria"
  );

  await initializeMapInstance(
    "map2",
    "controls2",
    "yearSlider2",
    "yearLabel2",
    "nationalityDropdown2",
    "toggleShowLines2",
    1915,
    "Austria"
  );
});
