# Audit Securite - Aviation Portal

## Phase 1 - Durcissement frontend initial

Corrections deja mises en place ou conservees dans cette branche :

- Ne pas stocker de mot de passe dans `localStorage`.
- Ne pas transmettre d'objet utilisateur contenant un champ `password`.
- Limiter les actions sensibles cote interface selon le role `Admin` / `Pilote`.
- Documenter que les controles frontend ne remplacent pas des regles serveur.

## Phase 2 - Firebase Authentication

### Ce qui a ete remplace

| Element | Avant | Phase 2 |
| --- | --- | --- |
| Authentification | Login temporaire local / Supabase partiel selon branche | Firebase Authentication avec `signInWithEmailAndPassword` |
| Source de verite session | `localStorage` | `onAuthStateChanged(auth, ...)` |
| Deconnexion | Suppression locale | `signOut(auth)` |
| Objet utilisateur UI | Objet libre potentiellement trop large | `{ uid, email, name, role }` |
| `users.js` | Liste locale de comptes | Fichier deprecie, sans identifiants |

### Fichiers modifies

- `src/firebase.js` : initialisation Firebase via variables `REACT_APP_*`, export de `auth`.
- `src/pages/Login.js` : connexion Firebase Auth email/password, erreurs en francais, aucun stockage du mot de passe.
- `src/App.js` : ecoute `onAuthStateChanged`, suppression de `localStorage` comme source de verite, deconnexion via `signOut`.
- `src/data/users.js` : marque comme deprecie, sans comptes ni mots de passe.
- `src/pages/NewMission.js` : soumission sensible reservee a Admin, sauvegarde locale conservee pour la demo.
- `src/pages/Equipment.js` : actions d'administration masquees/desactivees pour Pilote.
- `src/pages/PDFGenerator.js` : generation PDF reservee a Admin.
- `src/pages/GlobalAuthorizations.js` : liens Gmail/mailto DGAC/DTA reserves a Admin.
- `src/supabaseClient.js` : plus de cle hardcodee, configuration optionnelle par variables d'environnement.
- `.env.example` : modele de configuration locale sans vraies valeurs.
- `package.json` / `package-lock.json` : ajout de la dependance `firebase`.

### Variables d'environnement Firebase

Create React App expose seulement les variables prefixees par `REACT_APP_`.
Les vraies valeurs Firebase doivent etre placees uniquement dans `.env.local`.
Le fichier `.env.example` reste committe avec des valeurs vides.

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

`.env` et `.env.local` sont ignores par `.gitignore` et ne doivent pas etre committes.

Firebase Analytics n'est pas utilise dans cette phase : aucun `measurementId`, `getAnalytics` ou module Analytics n'est initialise. La phase 2 utilise uniquement Firebase App et Firebase Authentication.

### Role temporaire cote frontend

En attendant la Phase 3, le role est determine cote frontend avec `REACT_APP_ADMIN_EMAILS`.

Exemple :

```env
REACT_APP_ADMIN_EMAILS=admin@sepret.ma,responsable@sepret.ma
```

Tout utilisateur non liste est considere `Pilote`.

Cette approche est temporaire et contournable : elle sert uniquement a conserver une experience de demonstration. La vraie autorisation devra utiliser Firestore profiles, custom claims ou Security Rules.

### Limites restantes

- Les roles ne sont pas encore garantis par le serveur.
- Les missions restent en memoire ou dans les services temporaires existants.
- L'envoi optionnel Supabase de mission est conserve seulement s'il est configure par variables d'environnement.
- Les PDF et liens email restent generes cote navigateur.
- Firestore et Storage ne sont pas encore integres.
- Les regles de securite Firebase ne sont pas encore ecrites.
- Les anciennes dependances vulnerables restent a traiter dans une phase dediee.
  Les phases suivantes pourront couvrir Capacitor, Docker et Trivy.

### Prochaine etape

Phase 3 :

- Creer une collection Firestore `profiles`.
- Associer chaque utilisateur Firebase a un profil applicatif.
- Migrer les roles Admin/Pilote vers Firestore ou custom claims.
- Ajouter Firestore Security Rules.
- Ajouter ensuite Firebase Storage et ses Storage Rules pour PDF/KML/photos.
