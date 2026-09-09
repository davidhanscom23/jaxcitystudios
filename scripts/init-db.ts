import { getDb } from "../src/lib/db";
import { getAvailableStarts } from "../src/lib/availability";

getDb();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const date = tomorrow.toISOString().slice(0, 10);

const venus = getAvailableStarts("venus", date, 2);
console.log("Studio DB ready.");
console.log(`Venus ${date} 2h starts:`, venus.availableStarts.length);
console.log("Booked blocks:", venus.bookedBlocks);
if (!venus.availableStarts.includes("14:00") && venus.bookedBlocks.some((b) => b.start === "14:00")) {
  console.log("Seed block for Venus 14:00–16:00 is correctly excluded.");
}
