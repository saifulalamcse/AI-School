import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envContent = fs.readFileSync(".env", "utf8");
const supabaseUrl = envContent
  .match(/VITE_SUPABASE_URL=(.*)/)?.[1]
  ?.trim()
  .replace(/"/g, "");
const supabaseKey = envContent
  .match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)?.[1]
  ?.trim()
  .replace(/"/g, "");

console.log("Supabase URL:", supabaseUrl);
if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: enrollments, error: err1 } = await supabase.from("enrollments").select("*");
  console.log("Enrollments count:", enrollments?.length);
  console.log("Enrollments:", enrollments);

  const { data: profiles, error: err2 } = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profiles?.length);
}
