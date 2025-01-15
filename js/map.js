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
    div.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
    div.style.fontSize = "12px";

    div.innerHTML = `
      <h4 style="margin: 0; padding: 0; font-size: 14px; text-align: center;">Legend</h4>
      <div style="display: flex; align-items: center; margin: 8px 0;">
        <img src="https://static.vecteezy.com/system/resources/thumbnails/034/759/406/small/location-map-pin-gps-pointer-markers-3d-realistic-icon-png.png" width="20" height="20">
        </svg>
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

      L.marker([lat, lon]).addTo(map).bindPopup(`
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
