export async function attachmentScan(fileName: string): Promise<"clean" | "infected" | "error"> {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const name = fileName.toLowerCase();

  if (name.includes("virus") || name.includes("vírus")) return "infected";
  if (name.includes("error")) return "error";
  return "clean";
}
