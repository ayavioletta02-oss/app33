# Audit Securite - Phase 1

## Perimetre

Ce document trace la premiere phase de securisation legere de Aviation Portal. Aucune integration Firebase, aucun backend et aucune refonte d'architecture majeure n'ont ete ajoutes dans cette phase.

## Vulnerabilites Identifiees Au Depart

| Risque | Emplacement | Severite | Notes |
| --- | --- | --- | --- |
| Comptes de demonstration et mots de passe en clair | `src/data/users.js` | Critique | Les identifiants sont inclus dans le bundle frontend et ne doivent pas etre utilises en production. |
| Verification d'authentification cote client | `src/pages/Login.js` | Critique | La logique de login peut etre inspectee et contournee depuis le navigateur. |
| Objet utilisateur complet stocke localement | `src/App.js` | Eleve | L'ancien flux pouvait persister des champs sensibles comme `password`. |
| Roles non appliques | `src/App.js`, pages metier | Eleve | Les roles Admin/Pilote existaient mais ne limitaient pas les actions sensibles. |
| Donnees mission dans les PDF et liens mail | `src/pages/PDFGenerator.js`, `src/pages/GlobalAuthorizations.js` | Moyen | Client, pilote, materiel et zone peuvent sortir via fichiers locaux ou URL. |
| Configuration Supabase inutilisee exposee | `src/supabaseClient.js` | Moyen | Une URL/cle etait codee en dur alors que Supabase n'est pas integre. |
| Chaine npm vulnerable | `package-lock.json` | Moyen/Eleve | `npm audit` signale surtout `react-scripts` et des dependances transitives. |

## Corrections Realisees En Phase 1

| Correction | Fichiers | Resultat |
| --- | --- | --- |
| Session locale assainie | `src/App.js`, `src/pages/Login.js` | Seuls `id`, `username`, `name` et `role` sont persistes. `password` n'est jamais stocke dans `localStorage`. |
| Avertissement sur l'authentification demo | `src/data/users.js`, `src/pages/Login.js` | `users.js` est clairement marque comme donnees de demonstration locale. |
| Helpers de roles cote interface | `src/App.js` | Les decisions temporaires Admin/Pilote sont centralisees. |
| Restriction UI des actions sensibles pour Pilote | `src/pages/Equipment.js`, `src/pages/PDFGenerator.js`, `src/pages/GlobalAuthorizations.js` | Le Pilote garde la lecture, mais ajout/suppression/changement d'etat materiel, generation PDF et envoi mail sont masques ou desactives. |
| Nettoyage du placeholder Supabase | `src/supabaseClient.js` | Le fichier ne contient plus d'URL, de cle ni d'import vers une dependance Supabase absente. |

## Limites Restantes

- Les controles de role frontend sont seulement une protection d'interface temporaire. Ils ne fournissent pas une vraie autorisation.
- `users.js` contient encore des mots de passe de demonstration pour les tests locaux. Il doit etre retire avant toute production.
- `localStorage` peut etre modifie depuis DevTools. Il ne doit pas etre considere comme une source de verite securisee.
- Les missions, clients, zones GPS, PDF et autorisations restent cote client ou en memoire.
- La generation PDF et les liens mail restent executes dans le navigateur.
- Il n'existe pas encore de journal d'audit, validation backend, regles Firestore ou regles Storage.
- Les vulnerabilites npm restent a traiter dans une phase dediee.

## Pourquoi `users.js` Reste Temporaire

`src/data/users.js` est acceptable uniquement pour une demonstration locale. Tout son contenu est livre au navigateur. Un utilisateur peut inspecter le JavaScript, retrouver les identifiants de demonstration et modifier la logique de connexion. L'authentification de production doit passer par un fournisseur comme Firebase Authentication.

## Pourquoi `localStorage` Ne Doit Pas Stocker De Secrets

`localStorage` est lisible et modifiable par le JavaScript de la page. Il est visible depuis DevTools et peut etre expose en cas de faille XSS. Il peut contenir des preferences non sensibles, mais jamais des mots de passe, secrets API, tokens prives ou donnees d'autorisation de confiance.

## Prochaines Etapes Recommandees

1. Remplacer `users.js` et le controle local par Firebase Authentication.
2. Stocker les profils et roles dans Firestore ou via custom claims Firebase.
3. Migrer missions, materiel et autorisations vers Firestore.
4. Ajouter des Firestore Security Rules pour Admin/Pilote.
5. Stocker PDF, fichiers KML et photos dans Firebase Storage.
6. Ajouter des Storage Security Rules par mission et par role.
7. Preparer Capacitor Android/iOS et revoir les permissions mobiles.
8. Ajouter Docker et des controles CI.
9. Lancer les scans de dependances et d'image avec npm audit et Trivy.
10. Produire un rapport final avec preuves avant/apres pour la soutenance.
