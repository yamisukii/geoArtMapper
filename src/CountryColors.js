/**
 * Color mapping for countries.
 * Each country is assigned a specific color for visualization purposes.
 */
export const countryColors = {
  Armenia: "maroon",
  Austria: "darkred",
  "Bosnia and Herzegovina": "darkblue",
  Belgium: "yellow",
  Bulgaria: "purple",
  Belarus: "cyan",
  Switzerland: "darkgreen",
  "Czech Republic": "teal",
  Germany: "blue",
  Denmark: "darkorange",
  Estonia: "indigo",
  Spain: "red",
  Finland: "lightgreen",
  France: "orange",
  "United Kingdom": "navy",
  Georgia: "brown",
  Greece: "lime",
  Croatia: "steelblue",
  Hungary: "darkmagenta",
  Ireland: "forestgreen",
  Italy: "green",
  Lithuania: "lavender",
  Luxembourg: "khaki",
  Latvia: "orchid",
  Montenegro: "goldenrod",
  Netherlands: "orange",
  Norway: "lightblue",
  Poland: "darkcyan",
  Portugal: "dodgerblue",
  Romania: "magenta",
  Serbia: "darkslateblue",
  Russia: "black",
  Sweden: "skyblue",
  Slovenia: "silver",
  Slovakia: "mediumblue",
  Turkey: "cyan",
  Ukraine: "blueviolet",
};

/**
 * Restricted color mapping for European countries.
 * Filters the `countryColors` object to include only European countries.
 */
export const restrictedCountryColors = Object.fromEntries(
  Object.entries(countryColors).filter(([country]) => {
    const europeanCountries = [
      "Armenia",
      "Austria",
      "Bosnia and Herzegovina",
      "Belgium",
      "Bulgaria",
      "Belarus",
      "Switzerland",
      "Czech Republic",
      "Germany",
      "Denmark",
      "Estonia",
      "Spain",
      "Finland",
      "France",
      "United Kingdom",
      "Georgia",
      "Greece",
      "Croatia",
      "Hungary",
      "Ireland",
      "Italy",
      "Lithuania",
      "Luxembourg",
      "Latvia",
      "Montenegro",
      "Netherlands",
      "Norway",
      "Poland",
      "Portugal",
      "Romania",
      "Serbia",
      "Russia",
      "Sweden",
      "Slovenia",
      "Slovakia",
      "Turkey",
      "Ukraine",
    ];
    return europeanCountries.includes(country); // Check if the country is in the list
  })
);
