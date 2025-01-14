export async function loadData() {
  const data = await d3.csv("./data/dataset.csv");
  console.log("Loaded Dataset:", data);
  return data;
}
