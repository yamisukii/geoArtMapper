import { countryColors } from "./CountryColors.js";

export function initializeMap(mapId) {
  const map = L.map(mapId).setView([50, 10], 4); // Centered in Europe
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

export function addLegend(map) {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.style.backgroundColor = "black";
    div.style.color = "white";
    div.style.padding = "10px";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

    div.innerHTML = `
      <h4 style="margin: 0; padding: 0; font-size: 16px;">Legend</h4>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <div style="width: 15px; height: 15px; background-color: orange; border-radius: 50%; margin-right: 5px;"></div>
        <span>City/Venue</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <svg width="15" height="15" style="margin-right: 5px;">
          <polygon points="7.5,0 15,15 0,15" style="fill: #c51b8a;"></polygon>
        </svg>
        <span>City Marker (Triangle)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <div style="width: 15px; height: 15px; background-color: maroon; border-radius: 50%; margin-right: 5px;"></div>
        <span>Nationality Cluster</span>
      </div>
      <div style="display: flex; align-items: center;">
        <div style="width: 15px; height: 2px; background-color: white; margin-right: 5px;"></div>
        <span>Connection Line</span>
      </div>
    `;
    return div;
  };

  legend.addTo(map);
}

export async function addCountryClusters(map, dataset) {
  const countryClusters = {};

  dataset.forEach((row) => {
    const country = row["nationality"];
    if (!country) {
      console.warn("Row is missing nationality:", row);
      return;
    }
    countryClusters[country] = (countryClusters[country] || 0) + 1;
  });

  let geojson;
  try {
    const response = await fetch("./data/europe.geojson");
    geojson = await response.json();
  } catch (error) {
    console.error("Failed to load GeoJSON data:", error);
    return;
  }

  const countryCentroids = {};
  geojson.features.forEach((feature) => {
    const countryCode = feature.properties.NAME;
    const lat = parseFloat(feature.properties.LAT);
    const lon = parseFloat(feature.properties.LON);

    if (countryCode && !isNaN(lat) && !isNaN(lon)) {
      countryCentroids[countryCode] = { lat, lon };
    } else {
      console.warn(
        "Invalid or missing coordinates for country:",
        feature.properties
      );
    }
  });

  Object.keys(countryClusters).forEach((country) => {
    const color = countryColors[country] || "gray";
    const coords = countryCentroids[country];

    if (!coords) {
      return;
    }

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

export function addCityMarkers(map, dataset) {
  dataset.forEach((row) => {
    const lat = parseFloat(row["e.latitude"]);
    const lon = parseFloat(row["e.longitude"]);
    const city = row["e.city"];
    const country = row["e.country"];
    const year = row["e.startdate"];

    if (!isNaN(lat) && !isNaN(lon)) {
      // Calculate additional stats for the popup
      const cityData = dataset.filter((entry) => entry["e.city"] === city);
      const amountOfNationalities = new Set(
        cityData.map((entry) => entry["nationality"])
      ).size;
      const amountOfVenues = new Set(cityData.map((entry) => entry["e.venue"]))
        .size;
      const amountOfArtists = cityData.length;

      // Define triangle marker coordinates
      const size = 0.5; // Adjust size as needed
      const triangle = [
        [lat - size, lon - size], // Bottom-left
        [lat - size, lon + size], // Bottom-right
        [lat + size, lon], // Top
      ];

      // Add the triangle marker to the map
      L.polygon(triangle, {
        color: "#c51b8a", // Marker border color
        fillColor: "#c51b8a", // Marker fill color
        fillOpacity: 0.7, // Marker fill opacity
        weight: 1, // Marker border weight
      }).addTo(map).bindPopup(`
          <div style="color: white; background-color: black; padding: 10px; border-radius: 5px;">
              <strong>City:</strong> ${city}<br>
              <strong>Year:</strong> ${year}<br>
              <strong>Amount of Nationality:</strong> ${amountOfNationalities}<br>
              <strong>Amount of Venues in this City:</strong> ${amountOfVenues}<br>
              <strong>Amount of Artists:</strong> ${amountOfArtists}
          </div>
        `);
    }
  });
}

export async function addConnectingLines(
  map,
  dataset,
  selectedNationality = null
) {
  let geojson;
  try {
    const response = await fetch("./data/europe.geojson");
    geojson = await response.json();
  } catch (error) {
    console.error("Failed to load GeoJSON data:", error);
    return;
  }

  const countryCentroids = {};
  geojson.features.forEach((feature) => {
    const countryCode = feature.properties.NAME;
    const lat = parseFloat(feature.properties.LAT);
    const lon = parseFloat(feature.properties.LON);

    if (countryCode && !isNaN(lat) && !isNaN(lon)) {
      countryCentroids[countryCode] = { lat, lon };
    } else {
      console.warn(
        "Invalid or missing coordinates for country:",
        feature.properties
      );
    }
  });

  const filteredDataset = selectedNationality
    ? dataset.filter((row) => row["nationality"] === selectedNationality)
    : dataset;

  if (filteredDataset.length === 0) {
    console.warn(`No data found for nationality: ${selectedNationality}`);
    return;
  }

  filteredDataset.forEach((row) => {
    const cityLat = parseFloat(row["e.latitude"]);
    const cityLon = parseFloat(row["e.longitude"]);
    const artistCountry = row["nationality"];

    if (isNaN(cityLat) || isNaN(cityLon)) {
      console.warn("Skipping row due to invalid city coordinates:", row);
      return;
    }

    const clusterCoords = countryCentroids[artistCountry];
    if (!clusterCoords) {
      return;
    }

    const { lat: clusterLat, lon: clusterLon } = clusterCoords;

    L.polyline(
      [
        [cityLat, cityLon],
        [clusterLat, clusterLon],
      ],
      { color: countryColors[artistCountry] || "gray", weight: 2 }
    ).addTo(map);
  });
}
