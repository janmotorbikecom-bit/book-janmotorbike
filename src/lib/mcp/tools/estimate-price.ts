import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedBikes, calculateRentPrice } from "@/lib/bike-catalog";

export default defineTool({
  name: "estimate_price",
  title: "Estimate rental price",
  description:
    "Estimate the total rental price for a bike given a number of days. Uses the shop's tiered pricing curve (daily / weekly / monthly rates).",
  inputSchema: {
    id: z.string().min(1).describe("The bike id (e.g. 'b1')."),
    totalDays: z.number().int().min(1).describe("Total rental duration in days."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id, totalDays }) => {
    const bike = seedBikes.find((b) => b.id === id);
    if (!bike) {
      return {
        content: [{ type: "text", text: `No bike found with id "${id}".` }],
        isError: true,
      };
    }
    const total = calculateRentPrice(
      totalDays,
      bike.pricePerDay,
      bike.pricePerWeek,
      bike.pricePerMonth,
    );
    const summary = {
      bikeId: bike.id,
      bikeName: bike.name,
      totalDays,
      totalPriceUsd: total,
      deposit: bike.deposit,
      rates: {
        day: bike.pricePerDay,
        week: bike.pricePerWeek,
        month: bike.pricePerMonth,
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
