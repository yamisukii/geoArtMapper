export async function loadData() {
  const data = await d3.csv("./data/dataset.csv"); // Load original dataset
  console.log("Loaded Dataset:", data);
  return data; // Return the unified dataset
}
