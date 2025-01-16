import { countryColors } from "./CountryColors.js";
import { addLegend } from "./functionalities.js";

/**
 * Initializes a Leaflet map and centers it in Europe.
 *
 * @param {string} mapId - The ID of the HTML element where the map will be rendered.
 * @returns {Object} The initialized Leaflet map instance.
 */
export function initializeMap(mapId) {
  const map = L.map(mapId).setView([50, 10], 4); // Centered in Europe
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Pass L to addLegend
  addLegend(L, map);

  return map;
}

/**
 * Adds nationality clusters to the map based on the dataset.
 *
 * @param {Object} map - The Leaflet map instance.
 * @param {Array} dataset - The dataset containing nationality information.
 */
export async function addCountryClusters(map, dataset) {
  const countryClusters = {};

  // Aggregate the dataset by nationality
  dataset.forEach((row) => {
    const country = row["nationality"];
    if (!country) {
      console.warn("Row is missing nationality:", row);
      return;
    }
    countryClusters[country] = (countryClusters[country] || 0) + 1;
  });

  // Load GeoJSON data
  let geojson;
  try {
    const response = await fetch("./data/europe.geojson");
    geojson = await response.json();
  } catch (error) {
    console.error("Failed to load GeoJSON data:", error);
    return;
  }

  // Extract country centroids from GeoJSON
  const countryCentroids = {};
  geojson.features.forEach((feature) => {
    const { NAME: countryCode, LAT: lat, LON: lon } = feature.properties;
    if (countryCode && !isNaN(lat) && !isNaN(lon)) {
      countryCentroids[countryCode] = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
    } else {
      console.warn(
        "Invalid or missing coordinates for country:",
        feature.properties
      );
    }
  });

  // Add clusters to the map
  Object.keys(countryClusters).forEach((country) => {
    const color = countryColors[country] || "gray";
    const coords = countryCentroids[country];
    if (!coords) return;

    const { lat, lon } = coords;

    L.circleMarker([lat, lon], {
      radius: 17,
      color: color,
      fillOpacity: 0.5,
    })
      .addTo(map)
      .bindPopup(
        `<strong>${country}</strong><br>
         Number of Artists: ${countryClusters[country]}`
      );
  });
}

/**
 * Adds city markers to the map based on the dataset.
 *
 * @param {Object} map - The Leaflet map instance.
 * @param {Array} dataset - The dataset containing city and artist information.
 */
export function addCityMarkers(map, dataset) {
  dataset.forEach((row) => {
    const lat = parseFloat(row["e.latitude"]);
    const lon = parseFloat(row["e.longitude"]);
    const city = row["e.city"];
    const year = row["e.startdate"];

    if (!isNaN(lat) && !isNaN(lon)) {
      // Collect city-specific stats
      const cityData = dataset.filter((entry) => entry["e.city"] === city);
      const amountOfNationalities = new Set(
        cityData.map((entry) => entry["nationality"])
      ).size;
      const amountOfVenues = new Set(cityData.map((entry) => entry["e.venue"]))
        .size;
      const amountOfArtists = cityData.length;

      // Add marker to the map
      L.marker([lat, lon]).addTo(map).bindPopup(`
        <div style="color: white; background-color: black; padding: 10px; border-radius: 5px;">
          <strong>City:</strong> ${city}<br>
          <strong>Year:</strong> ${year}<br>
          <strong>Amount of Nationalities:</strong> ${amountOfNationalities}<br>
          <strong>Amount of Venues:</strong> ${amountOfVenues}<br>
          <strong>Amount of Artists:</strong> ${amountOfArtists}
        </div>
      `);
    }
  });
}

/**
 * Adds connecting lines between cities and country clusters based on the dataset.
 *
 * @param {Object} map - The Leaflet map instance.
 * @param {Array} dataset - The dataset containing city and nationality information.
 * @param {string|null} [selectedNationality=null] - A specific nationality to filter the dataset.
 */
export async function addConnectingLines(
  map,
  dataset,
  selectedNationality = null
) {
  // Load GeoJSON data
  let geojson;
  try {
    const response = await fetch("./data/europe.geojson");
    geojson = await response.json();
  } catch (error) {
    console.error("Failed to load GeoJSON data:", error);
    return;
  }

  // Extract country centroids from GeoJSON
  const countryCentroids = {};
  geojson.features.forEach((feature) => {
    const { NAME: countryCode, LAT: lat, LON: lon } = feature.properties;
    if (countryCode && !isNaN(lat) && !isNaN(lon)) {
      countryCentroids[countryCode] = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
    } else {
      console.warn(
        "Invalid or missing coordinates for country:",
        feature.properties
      );
    }
  });

  // Filter dataset by nationality if specified
  const filteredDataset = selectedNationality
    ? dataset.filter((row) => row["nationality"] === selectedNationality)
    : dataset;

  // Add connecting lines to the map
  filteredDataset.forEach((row) => {
    const cityLat = parseFloat(row["e.latitude"]);
    const cityLon = parseFloat(row["e.longitude"]);
    const artistCountry = row["nationality"];

    if (isNaN(cityLat) || isNaN(cityLon)) {
      console.warn("Skipping row due to invalid city coordinates:", row);
      return;
    }

    const clusterCoords = countryCentroids[artistCountry];
    if (!clusterCoords) return;

    L.polyline(
      [
        [cityLat, cityLon],
        [clusterCoords.lat, clusterCoords.lon],
      ],
      { color: countryColors[artistCountry] || "gray", weight: 2 }
    ).addTo(map);
  });
}
