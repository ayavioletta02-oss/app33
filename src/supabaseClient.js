import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lucmcqsnfmoqoqlxftub.supabase.co";

const supabaseKey = "sb_publishable_ZKUa786FVMsyHvvh3IJmpw_6M0q-4mm";

export const supabase = createClient(supabaseUrl, supabaseKey);