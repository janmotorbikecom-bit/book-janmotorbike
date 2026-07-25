import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedBikes } from "@/lib/bike-catalog";

const categorySchema = z
  .enum(["Manual", "Automatic", "Semi-Automatic"])
  .describe("Filter by transmission category.");

export default defineTool({
  name: "list_bikes",
  title: "List motorbikes",
  description:
    "List motorbikes in the rental catalog with pricing, engine size, transmission, and current availability. Optionally filter by category or availability.",
  inputSchema: {
    category: categorySchema.optional(),
    availableOnly: z
      .boolean()
      .optional()
      .describe("If true, only bikes currently available for rent are returned."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, availableOnly }) => {
    const bikes = seedBikes
      .filter((b) => (category ? b.category === category : true))
      .filter((b) => (availableOnly ? b.available : true))
      .map(
        ({
          id,
          name,
          category,
          engineCc,
          transmission,
          pricePerDay,
          pricePerWeek,
          pricePerMonth,
          deposit,
          available,
        }) => ({
          id,
          name,
          category,
          engineCc,
          transmission,
          pricePerDay,
          pricePerWeek,
          pricePerMonth,
          deposit,
          available,
        }),
      );
    return {
      content: [{ type: "text", text: JSON.stringify(bikes, null, 2) }],
      structuredContent: { bikes },
    };
  },
});
