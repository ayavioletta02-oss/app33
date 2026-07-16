import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebase";

const getFirebaseAuthErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/invalid-credential":
      return "Identifiants invalides.";
    case "auth/user-not-found":
      return "Utilisateur introuvable.";
    case "auth/wrong-password":
      return "Mot de passe incorrect.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Reessayez plus tard.";
    case "auth/network-request-failed":
      return "Erreur reseau. Verifiez votre connexion.";
    case "auth/invalid-email":
      return "Adresse email invalide.";
    default:
      return "Connexion impossible. Verifiez vos informations.";
  }
};

export default function Login({ authMessage = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFirebaseConfigured || !auth) {
      console.error("[Firebase Auth] Configuration manquante", {
        code: "firebase/not-configured",
        message: "Firebase Authentication n'est pas configure."
      });
      setError("Firebase Authentication n'est pas configure.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (authError) {
      console.error("[Firebase Auth] Echec de connexion", {
        code: authError?.code,
        message: authError?.message
      });
      setError(getFirebaseAuthErrorMessage(authError));
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

        {(authMessage || error) && (
          <div
            style={{
              color: "#dc2626",
              marginBottom: 15,
              fontSize: 14,
            }}
          >
            {error || authMessage}
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
