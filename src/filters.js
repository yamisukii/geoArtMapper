/**
 * Filters exhibitions based on the provided year.
 *
 * @param {Array} data - Array of exhibition data objects.
 * @param {number|string} year - The year to filter the exhibitions by.
 * @returns {Array} Array of exhibition objects that match the specified year.
 */
export function filterExhibitionsByYear(data, year) {
  return data.filter((row) => row["e.startdate"] === year.toString());
}

/**
 * Retrieves the list of selected nationalities from the UI.
 *
 * This function scans the container holding selected nationality tags
 * and extracts the dataset value (nationality) from each tag.
 *
 * @param {string} containerId - The ID of the container holding selected nationality tags.
 * @returns {string[]} Array of selected nationalities.
 */
export function getSelectedNationalities(containerId) {
  // Find all selected tags within the container
  const selectedTags = document.querySelectorAll(
    `#${containerId} .selected-tag`
  );

  // Extract and return the dataset value of each tag as an array
  return Array.from(selectedTags).map((tag) => tag.dataset.value);
}
