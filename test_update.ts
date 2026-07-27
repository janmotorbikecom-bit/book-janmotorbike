import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kzxuaajqquykeahdcvtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eHVhYWpxcXV5a2VhaGRjdnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjE0MzAsImV4cCI6MjEwMDUzNzQzMH0.CZENFEtrpGit6ZWY2bC2AgFEI6rS2bGBiB_O3RmMTh8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data: oneReview } = await supabase.from('reviews').select('*').limit(1);
  if (oneReview && oneReview.length > 0) {
    const id = oneReview[0].id;
    console.log("Trying to update:", id);
    const { data, error } = await supabase.from('reviews').update({ rating: 1 }).eq('id', id).select();
    console.log("Update result data:", data);
    console.log("Update result error:", error);
  }
}
test();
