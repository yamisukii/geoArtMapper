// Import required modules and functions
import { restrictedCountryColors } from "./CountryColors.js"; // Color mapping for countries
import { loadData } from "./dataLoader.js"; // Function to load exhibition data
import {
  filterExhibitionsByYear, // Filters exhibition data by a given year
  getSelectedNationalities, // Retrieves selected nationalities from the UI
} from "./filters.js";
import {
  createSelectedTag, // Creates a UI tag for a selected nationality
} from "./functionalities.js";

import {
  addCityMarkers, // Adds city markers to the map
  addConnectingLines, // Adds connecting lines between cities on the map
  addCountryClusters, // Adds clusters of exhibitions for countries
  initializeMap, // Initializes the map instance
} from "./map.js";

/**
 * Initializes a map instance with interactive controls.
 *
 * @param {string} mapId - The ID of the map container.
 * @param {string} controlsId - The ID of the controls container.
 * @param {string} yearSliderId - The ID of the year slider element.
 * @param {string} yearLabelId - The ID of the year label element.
 * @param {string} nationalityDropdownId - The ID of the nationality dropdown element.
 * @param {string} toggleLinesButtonId - The ID of the toggle lines button.
 * @param {number} defaultYear - The default year for the slider (default: 1905).
 * @param {string|null} defaultNationality - The default nationality selection (default: null).
 */
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
  console.log(`Initializing map instance for: ${mapId}`);

  // Get references to required DOM elements
  const mapContainer = document.getElementById(mapId);
  if (!mapContainer) {
    console.error(`Map container not found: ${mapId}`);
    return;
  }

  // Initialize the map and add a legend
  const map = initializeMap(mapId);

  // Load exhibition data
  const data = await loadData();

  // Get control elements from the DOM
  const yearSlider = document.getElementById(yearSliderId);
  const yearLabel = document.getElementById(yearLabelId);
  const nationalityDropdown = document.getElementById(nationalityDropdownId);
  const toggleLinesButton = document.getElementById(toggleLinesButtonId);
  const selectedContainer = document.getElementById(
    `${nationalityDropdownId}-selected`
  );

  // Ensure all necessary elements exist
  if (!yearSlider || !yearLabel || !nationalityDropdown || !toggleLinesButton) {
    console.error(
      `Missing elements: ${yearSliderId}, ${yearLabelId}, ${nationalityDropdownId}, ${toggleLinesButtonId}`
    );
    return;
  }

  // Track whether connecting lines should be shown
  let showLines = true;

  // Populate the nationality dropdown with available options
  Object.keys(restrictedCountryColors).forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    nationalityDropdown.appendChild(option);
  });

  // Set default year and nationality if provided
  yearSlider.value = defaultYear;
  yearLabel.textContent = defaultYear;

  if (defaultNationality) {
    nationalityDropdown.value = defaultNationality;

    // Create and append a tag for the default nationality
    const tag = createSelectedTag(defaultNationality);
    selectedContainer.appendChild(tag);
  }

  /**
   * Updates the map with filtered data based on the current UI settings.
   */
  async function updateMap() {
    console.log(`Updating map: ${mapId}`);

    // Clear existing layers from the map
    map.eachLayer((layer) => {
      if (
        layer instanceof L.CircleMarker ||
        layer instanceof L.Marker ||
        layer instanceof L.Polyline
      ) {
        map.removeLayer(layer);
      }
    });

    // Retrieve current filter settings
    const year = yearSlider.value;
    const selectedNationalities = getSelectedNationalities(
      `${nationalityDropdownId}-selected`
    );

    // Filter data based on year and selected nationalities
    const filteredExhibitions = filterExhibitionsByYear(data, year).filter(
      (exhibition) =>
        selectedNationalities.length === 0 ||
        selectedNationalities.includes(exhibition["nationality"])
    );

    // Add filtered data to the map
    await addCountryClusters(map, filteredExhibitions);
    addCityMarkers(map, filteredExhibitions);
    if (showLines) {
      await addConnectingLines(map, filteredExhibitions);
    }
  }

  // Event listener: Handle nationality selection
  nationalityDropdown.addEventListener("change", async () => {
    const selectedValue = nationalityDropdown.value;

    // Prevent adding duplicate tags
    if (
      Array.from(selectedContainer.children).some(
        (tag) => tag.dataset.value === selectedValue
      )
    ) {
      nationalityDropdown.value = "";
      return;
    }

    // Add a new tag for the selected nationality
    const tag = createSelectedTag(selectedValue);
    selectedContainer.appendChild(tag);

    await updateMap();
    nationalityDropdown.value = ""; // Reset dropdown
  });

  // Event listener: Remove nationality filter when tag is removed
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

  // Event listener: Toggle visibility of connecting lines
  toggleLinesButton.addEventListener("click", async () => {
    showLines = !showLines;
    toggleLinesButton.textContent = showLines ? "Hide Lines" : "Show Lines";
    await updateMap();
  });

  // Event listener: Update map when the year slider value changes
  yearSlider.addEventListener("input", async () => {
    yearLabel.textContent = yearSlider.value;
    await updateMap();
  });

  // Perform initial map update
  await updateMap();
}

// Initialize map instances when the DOM content is loaded
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
