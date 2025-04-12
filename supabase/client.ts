import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { env } from "@/lib/env";

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
