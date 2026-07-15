const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const notConfiguredError = () => ({
  data: null,
  error: new Error("Supabase n'est pas configure. Renseigner REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY.")
});

const supabaseRequest = async (path, options = {}) => {
  if (!isSupabaseConfigured) return notConfiguredError();

  try {
    const response = await fetch(`${supabaseUrl}${path}`, {
      ...options,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return {
        data: null,
        error: new Error(data?.msg || data?.message || "Erreur Supabase.")
      };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Client minimal sans cle hardcodee. A remplacer par le SDK officiel apres validation backend.
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }) =>
      supabaseRequest("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })
  },
  from: (table) => ({
    insert: async (rows) =>
      supabaseRequest(`/rest/v1/${encodeURIComponent(table)}`, {
        method: "POST",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify(rows)
      })
  })
};
