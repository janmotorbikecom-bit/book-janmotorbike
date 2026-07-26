import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kzxuaajqquykeahdcvtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eHVhYWpxcXV5a2VhaGRjdnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjE0MzAsImV4cCI6MjEwMDUzNzQzMH0.CZENFEtrpGit6ZWY2bC2AgFEI6rS2bGBiB_O3RmMTh8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDelete() {
  console.log("Deleting mock data...");
  const { data, error } = await supabase
    .from("bikes")
    .delete()
    .like("name", "Test%")
    .select();

  console.log(data);
  console.log("Error:", error);
}

testDelete();
