import { countryColors } from "./CountryColors.js";

export function initializeMap() {
  const map = L.map("map").setView([50, 10], 4); // Centered in Europe
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  return map;
}

export function addMarkersToMap(map, data) {
  data.forEach((item) => {
    const latitude = parseFloat(item.latitude || item["e.latitude"]);
    const longitude = parseFloat(item.longitude || item["e.longitude"]);

    if (isNaN(latitude) || isNaN(longitude)) {
      console.warn("Skipping item due to invalid coordinates:", item);
      return;
    }

    // Add a marker to the map
    L.circleMarker([latitude, longitude], {
      radius: 5,
      color: "blue",
    })
      .addTo(map)
      .bindPopup(
        `<strong>${item["e.title"]}</strong><br>
         City: ${item["e.city"]}<br>
         Country: ${item["e.country"]}<br>
         Paintings: ${item["e.paintings"]}`
      );
  });
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
        cityData.map((entry) => entry["a.nationality"])
      ).size;
      const amountOfVenues = new Set(cityData.map((entry) => entry["e.venue"]))
        .size;
      const amountOfArtists = cityData.length;

      // Add a circle marker to the map
      L.circleMarker([lat, lon], {
        radius: 8, // Adjust marker size
        color: "orange", // Marker border color
        fillColor: "orange", // Marker fill color
        fillOpacity: 0.7, // Marker fill opacity
        weight: 1, // Marker border weight
      }).addTo(map).bindPopup(`
                  <div style="color: white; background-color: black; padding: 10px; border-radius: 5px;">
                      <strong>City:</strong> ${city}<br>
                      <strong>Country:</strong> ${country}<br>
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
