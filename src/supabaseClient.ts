/* eslint-disable prettier/prettier */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://sxhnfnuyvandvrxyppaq.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aG5mbnV5dmFuZHZyeHlwcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MjEyMjEsImV4cCI6MjA0ODM5NzIyMX0.7AJF5tL5C1gCGDfAz-npDLkBP5SUw3R2WwU5Id1NSjA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
