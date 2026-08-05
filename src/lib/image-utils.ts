/**
 * Helper to return a relevant category-specific fallback image
 * when an inventory item image is missing or fails to load.
 */
export function getItemFallbackImage(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("chair")) return "/images/folding-chair.png";
  if (cat.includes("table")) return "/images/banquet-table.png";
  if (cat.includes("water") || cat.includes("slide")) return "/images/water-slide-1.png";
  if (cat.includes("bounce") || cat.includes("inflatable")) return "/images/water-slide-2.png";
  if (cat.includes("photo") || cat.includes("booth")) return "/images/photo-booth.png";
  if (cat.includes("popcorn")) return "/images/popcorn-machine.png";
  if (cat.includes("cotton") || cat.includes("candy")) return "/images/kids-cotton-candy.png";
  if (cat.includes("snow")) return "/images/kids-snowcones.png";
  if (cat.includes("tent")) return "/images/canopy-tent.png";
  return "/images/placeholder.png";
}
