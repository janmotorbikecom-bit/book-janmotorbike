import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kzxuaajqquykeahdcvtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eHVhYWpxcXV5a2VhaGRjdnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjE0MzAsImV4cCI6MjEwMDUzNzQzMH0.CZENFEtrpGit6ZWY2bC2AgFEI6rS2bGBiB_O3RmMTh8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateVinfast() {
  console.log("Updating Vinfast bikes to Electric category...");
  
  // Try matching by brand="Vinfast" or name contains "Vinfast"
  const { data, error } = await supabase
    .from("bikes")
    .update({ category: "Electric", transmission: "Electric" })
    .ilike("brand", "%Vinfast%")
    .select();

  console.log("Updated by brand:", data);
  console.log("Error:", error);

  const { data: data2, error: error2 } = await supabase
    .from("bikes")
    .update({ category: "Electric", transmission: "Electric" })
    .ilike("name", "%Vinfast%")
    .select();

  console.log("Updated by name:", data2);
  console.log("Error:", error2);
}

updateVinfast();
