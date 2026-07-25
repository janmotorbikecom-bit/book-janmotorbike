import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedBikes } from "@/lib/bike-catalog";

export default defineTool({
  name: "get_bike",
  title: "Get bike details",
  description:
    "Get full details for a single motorbike by id, including description, image gallery, deposit, and daily/weekly/monthly pricing.",
  inputSchema: {
    id: z.string().min(1).describe("The bike id (e.g. 'b1')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const bike = seedBikes.find((b) => b.id === id);
    if (!bike) {
      return {
        content: [{ type: "text", text: `No bike found with id "${id}".` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(bike, null, 2) }],
      structuredContent: { bike },
    };
  },
});
