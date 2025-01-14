export function filterExhibitionsByYear(data, year) {
  return data.filter((row) => row["e.startdate"] === year.toString());
}
