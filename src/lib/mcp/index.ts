import { defineMcp } from "@lovable.dev/mcp-js";
import listBikes from "./tools/list-bikes";
import getBike from "./tools/get-bike";
import estimatePrice from "./tools/estimate-price";

export default defineMcp({
  name: "moto-rental-mcp",
  title: "Moto Rental MCP",
  version: "0.1.0",
  instructions:
    "Tools for browsing this motorbike rental shop's public catalog: list available bikes, look up a specific bike's details and images, and estimate rental prices from the shop's tiered day/week/month pricing.",
  tools: [listBikes, getBike, estimatePrice],
});
