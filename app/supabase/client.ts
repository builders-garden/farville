import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
