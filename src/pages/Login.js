import React, { useState } from "react";
import { isSupabaseConfigured, supabase } from "../supabaseClient";
import users from "../data/users";

const toSessionUser = (user) => ({
  id: user.id || user.username,
  username: user.username || user.email || user.user_metadata?.username,
  name:
    user.name ||
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    user.username,
  role: user.role || user.user_metadata?.role || "Pilote"
});

const findLocalDemoUser = (email, password) => {
  const login = email.trim().toLowerCase();

  return users.find((user) => {
    const username = user.username.toLowerCase();
    const demoEmail = `${username}@sepret.ma`;

    return user.password === password && (login === username || login === demoEmail);
  });
};

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data?.user) {
          onLogin(toSessionUser(data.user));
          return;
        }
      }

      // Authentification locale de demonstration. A remplacer par Firebase Auth ou un backend valide.
      const found = findLocalDemoUser(email, password);
      if (found) {
        onLogin(toSessionUser(found));
      } else {
        setError("Identifiant ou mot de passe incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 360,
          background: "#ffffff",
          borderRadius: 20,
          padding: 35,
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 60,
          }}
        >
          ✈️
        </div>

        <h2
          style={{
            textAlign: "center",
            marginTop: 10,
            marginBottom: 5,
            color: "#0f172a",
          }}
        >
          Aviation Portal
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: 30,
          }}
        >
          SEPRET
        </p>

        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Email
        </label>

        <input
          type="email"
          placeholder="admin@sepret.ma"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            marginBottom: 20,
            fontSize: 15,
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Mot de passe
        </label>

        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            marginBottom: 20,
            fontSize: 15,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <div
            style={{
              color: "#dc2626",
              marginBottom: 15,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            border: "none",
            borderRadius: 10,
            background: "#0f766e",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
