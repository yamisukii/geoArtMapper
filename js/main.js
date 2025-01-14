import { restrictedCountryColors } from "./CountryColors.js";
import { loadData } from "./dataLoader.js";
import { filterExhibitionsByYear } from "./filters.js";
import {
  addCityMarkers,
  addConnectingLines,
  addCountryClusters,
  initializeMap,
} from "./map.js";

// Function to populate the nationality checkboxes dynamically
function populateNationalityCheckboxes() {
  const container = document.getElementById("nationalityFilterContainer");

  // Clear any existing checkboxes
  container.innerHTML = "<h3>Select Nationalities:</h3>";

  // Add checkboxes dynamically from restrictedCountryColors
  Object.keys(restrictedCountryColors).forEach((country) => {
    const checkboxContainer = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `checkbox-${country}`;
    checkbox.value = country;
    checkbox.className = "nationality-checkbox";

    const label = document.createElement("label");
    label.setAttribute("for", `checkbox-${country}`);
    label.textContent = country;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    container.appendChild(checkboxContainer);
  });
}

// Utility function to get selected nationalities from checkboxes
function getSelectedNationalities() {
  const checkboxes = document.querySelectorAll(".nationality-checkbox:checked");
  return Array.from(checkboxes).map((checkbox) => checkbox.value);
}

document.addEventListener("DOMContentLoaded", () => {
  populateNationalityCheckboxes();
});

async function main() {
  const data = await loadData(); // Load dataset
  const map = initializeMap(); // Initialize Leaflet map

  const yearSlider = document.getElementById("yearSlider");
  const yearLabel = document.getElementById("yearLabel");
  const showLinesCheckbox = document.getElementById("showLines");

  // Function to update the map based on filters
  async function updateMap(year, selectedNationalities, showLines) {
    map.eachLayer((layer) => {
      if (
        layer instanceof L.CircleMarker ||
        layer instanceof L.Marker ||
        layer instanceof L.Polyline
      ) {
        map.removeLayer(layer);
      }
    });

    const filteredExhibitions = filterExhibitionsByYear(data, year).filter(
      (exhibition) =>
        selectedNationalities.length === 0 || // Show all if no nationality is selected
        selectedNationalities.includes(exhibition["nationality"])
    );

    await addCountryClusters(map, filteredExhibitions);
    addCityMarkers(map, filteredExhibitions);

    if (showLines) {
      await addConnectingLines(map, filteredExhibitions);
    }
  }

  // Event listener for the year slider
  yearSlider.addEventListener("input", async () => {
    const year = yearSlider.value;
    const selectedNationalities = getSelectedNationalities();
    console.log(selectedNationalities);
    const showLines = showLinesCheckbox.checked;
    yearLabel.textContent = year; // Update the displayed year
    await updateMap(year, selectedNationalities, showLines);
  });

  // Event listener for nationality checkboxes
  document
    .getElementById("nationalityFilterContainer")
    .addEventListener("change", async () => {
      const year = yearSlider.value;
      const selectedNationalities = getSelectedNationalities();
      const showLines = showLinesCheckbox.checked;
      await updateMap(year, selectedNationalities, showLines);
    });

  // Event listener for the "Show Connecting Lines" checkbox
  showLinesCheckbox.addEventListener("change", async () => {
    const year = yearSlider.value;
    const selectedNationalities = getSelectedNationalities();
    const showLines = showLinesCheckbox.checked;
    await updateMap(year, selectedNationalities, showLines);
  });

  // Populate the nationality checkboxes and initialize the map
  populateNationalityCheckboxes();
  await updateMap(yearSlider.value, [], true);
}

main();
