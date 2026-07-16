import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const notConfiguredError = () => ({
  data: null,
  error: new Error("Supabase n'est pas configure. Renseigner REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY.")
});

const unavailableSupabase = {
  auth: {
    signInWithPassword: async () => notConfiguredError()
  },
  from: () => ({
    insert: async () => notConfiguredError()
  })
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : unavailableSupabase;
