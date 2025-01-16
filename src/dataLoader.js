/**
 * Loads dataset from a CSV file using D3.js.
 *
 * This function asynchronously fetches data from the specified CSV file,
 * parses it into an array of objects, and logs the result for debugging purposes.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of data objects from the CSV file.
 */
export async function loadData() {
  // Use D3 to load and parse the CSV file
  const data = await d3.csv("./data/dataset.csv");

  // Log the loaded dataset for debugging
  console.log("Loaded Dataset:", data);

  // Return the parsed dataset
  return data;
}
