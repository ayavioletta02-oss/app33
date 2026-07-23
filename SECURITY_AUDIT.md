# Audit Securite - Aviation Portal

## Phase 3.1 - Chargement des profils Firestore

Cette phase connecte Firebase Authentication a Cloud Firestore pour charger le profil applicatif de l'utilisateur connecte.

### Source de verite du role

- Chemin Firestore : `profiles/{uid}`.
- Le nom du document doit correspondre exactement a l'UID Firebase Authentication.
- Champs attendus :
  - `uid`
  - `email`
  - `displayName`
  - `role` : `admin` ou `pilot`
  - `disabled` : `false` pour un compte actif

Le role applicatif ne vient plus de l'adresse email et ne doit plus venir de `users.js`.
L'application construit maintenant l'utilisateur courant avec `uid`, `email`, `name`, `role` et `disabled` apres lecture du profil Firestore.

### Gestion des cas d'erreur

- Profil absent : l'utilisateur est authentifie, mais l'application affiche qu'aucun profil applicatif n'est configure.
- Profil incomplet : l'application refuse de construire un utilisateur courant.
- Role non reconnu : l'acces applicatif est bloque.
- Compte desactive : l'utilisateur est deconnecte avec `signOut`.
- `permission-denied` ou Firestore indisponible : un message clair est affiche sans exposer de token ni de mot de passe.

### Limites restantes

- La lecture des missions a ete migree vers Firestore lors de la phase 3.2.
- Le materiel a ete migre vers Firestore lors de la phase 3.5.
- Les controles Admin/Pilote restent des controles UI tant que les Firestore Security Rules ne sont pas deployees.
- Firebase Storage n'est pas encore utilise pour les PDF ou fichiers metier.
- Les regles Firestore doivent etre ecrites et testees dans l'etape suivante.

### Prochaine etape

Phase suivante : definir et tester les Firestore Security Rules pour `profiles`, puis poursuivre la migration progressive de `missions` et `equipment`.

## Phase 3.3 - Creation des missions dans Firestore

Cette phase connecte le formulaire Nouvelle mission a Cloud Firestore. Une mission validee par un administrateur est maintenant enregistree dans la collection `missions`.

### Modele de mission cree

Les documents `missions/{missionId}` sont crees avec les champs suivants quand ils sont disponibles :

- `number`
- `name`
- `clientName`
- `missionType`
- `zone`
- `date`
- `expiryDate`
- `status`
- `pilot`
- `assignedPilotId`
- `equipment`
- `equipmentIds`
- `createdBy`
- `createdAt`
- `updatedAt`
- `location.region`
- `location.province`
- `location.commune`
- `location.airportCode`
- `location.zoneLabel`
- `flight.altitude`
- `flight.duration`
- `flight.aircraftType`
- `flight.drone`
- `zonePoints`
- `weather`

Les valeurs `undefined` sont retirees avant l'ecriture Firestore. Le statut est normalise, avec `pending` comme valeur par defaut pour une nouvelle mission.

### Tracabilite

- `createdBy` est force avec l'UID Firebase Authentication de l'utilisateur connecte.
- `createdAt` et `updatedAt` utilisent `serverTimestamp()`.
- `assignedPilotId` reste `null` pour cette phase, car le formulaire selectionne encore un libelle pilote et pas un UID Firebase fiable.

### Controle d'acces temporaire

La creation est reservee a `currentUser.role === "admin"` cote interface. Ce controle frontend ameliore l'ergonomie mais ne remplace pas les Firestore Security Rules.

### Limites restantes

- Les regles Firestore de la collection `missions` ne sont pas encore deployees.
- Les pilotes ne sont pas encore lies a des documents profils selectionnables par UID.
- Le materiel est maintenant lu depuis Firestore, mais la reservation transactionnelle n'est pas encore implementee.
- Les fichiers PDF et pieces sensibles ne sont pas encore dans Firebase Storage.

### Prochaine etape

Definir et tester les Firestore Security Rules pour `missions` afin d'autoriser la lecture selon les besoins metier, limiter la creation aux administrateurs et proteger `createdBy`, `createdAt`, `updatedAt` et les champs sensibles.

## Phase 3.4 - Firestore Security Rules

Cette phase introduit des regles Firestore basees sur les profils applicatifs et le principe du moindre privilege.
Les regles ne sont pas deployees automatiquement depuis le poste local : elles doivent etre relues, testees puis publiees explicitement depuis Firebase Console ou Firebase CLI.

### Objectif RBAC

Le controle d'acces est base sur le role stocke dans `profiles/{uid}` :

- `admin` : lecture et ecriture sur les donnees metier autorisees.
- `pilot` : lecture uniquement sur les donnees metier autorisees.
- compte non authentifie : aucun acces.
- compte sans profil, profil desactive ou role inconnu : aucun acces metier.

Ce modele applique une approche Zero Trust : l'interface React ne suffit pas a autoriser une action. Chaque requete Firestore doit prouver l'identite Firebase via `request.auth`, puis les regles relisent le profil applicatif avec `get()`.

### Regles Firestore completes

Fichier cree : `firestore.rules`.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function profilePath() {
      return /databases/$(database)/documents/profiles/$(request.auth.uid);
    }

    function hasActiveProfile() {
      return signedIn()
        && exists(profilePath())
        && get(profilePath()).data.disabled == false;
    }

    function isAdmin() {
      return hasActiveProfile()
        && get(profilePath()).data.role == "admin";
    }

    function isPilot() {
      return hasActiveProfile()
        && get(profilePath()).data.role == "pilot";
    }

    match /profiles/{uid} {
      allow get: if signedIn() && request.auth.uid == uid;
      allow list: if false;
      allow create, update, delete: if false;
    }

    match /missions/{missionId} {
      allow read: if isAdmin() || isPilot();
      allow create, update, delete: if isAdmin();
    }

    match /equipment/{equipmentId} {
      allow read: if isAdmin() || isPilot();
      allow create, update, delete: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Explication detaillee

- `signedIn()` verifie que la requete vient d'un utilisateur Firebase Authentication connecte.
- `profilePath()` construit le chemin `profiles/{request.auth.uid}`.
- `hasActiveProfile()` exige un profil existant et `disabled == false`.
- `isAdmin()` autorise uniquement les utilisateurs dont le profil Firestore actif contient `role == "admin"`.
- `isPilot()` autorise uniquement les utilisateurs dont le profil Firestore actif contient `role == "pilot"`.
- `profiles/{uid}` : un utilisateur peut lire uniquement son propre profil avec `request.auth.uid == uid`.
- `profiles/{uid}` : les listes et toutes les ecritures sont refusees, donc personne ne peut modifier son role depuis l'application.
- `missions/{missionId}` : admin et pilot peuvent lire, seul admin peut creer, modifier ou supprimer.
- `equipment/{equipmentId}` : structure preparee pour la migration future ; admin a tous les droits, pilot lit seulement.
- `match /{document=**}` refuse tout ce qui n'est pas explicitement autorise.

### Principe du moindre privilege

Les pilotes disposent seulement des droits necessaires a la consultation. Les actions de creation, modification et suppression restent reservees aux administrateurs. Les profils ne sont pas modifiables par les clients, car ils portent le role de securite.

### Plan de test manuel

Avant de publier en production, tester dans Firebase Rules Playground ou avec l'emulateur Firestore :

1. Non connecte : lecture `profiles/{uid}`, `missions/{id}` et `equipment/{id}` refusee.
2. Admin connecte avec `profiles/{adminUid}.role == "admin"` et `disabled == false` : lecture de son profil autorisee.
3. Admin : lecture, creation, modification et suppression autorisees sur `missions`.
4. Pilot connecte avec `profiles/{pilotUid}.role == "pilot"` et `disabled == false` : lecture de son profil autorisee.
5. Pilot : lecture autorisee sur `missions`, creation/modification/suppression refusees.
6. Pilot : lecture autorisee sur `equipment`, creation/modification/suppression refusees.
7. Utilisateur connecte sans document `profiles/{uid}` : acces metier refuse.
8. Utilisateur avec `disabled == true` : acces metier refuse.
9. Utilisateur qui tente de lire `profiles/{autreUid}` : refus.
10. Toute collection non documentee : lecture et ecriture refusees.

### Limites restantes

- Les regles doivent encore etre deployees manuellement.
- Les regles ne valident pas encore finement le schema complet des documents `missions`.
- Les pilotes ne sont pas encore associes a des documents profils selectionnables via `assignedPilotId`.
- Firebase Storage et les regles de stockage restent a traiter pour les PDF et pieces sensibles.

## Phase 3.5 - Migration du materiel vers Firestore

Cette phase remplace le tableau local `equipmentList` par la collection Firestore `equipment`.
Le premier document materiel doit etre cree depuis l'application par un administrateur, pas manuellement dans Firebase Console.

### Suppression des donnees hardcodees

- L'initialisation locale du parc materiel dans `App.js` a ete remplacee par une liste vide.
- L'application charge maintenant `equipment` depuis Firestore apres connexion.
- Les listes de materiel codees en dur dans le formulaire Nouvelle mission ne sont plus utilisees.
- Si la collection `equipment` est vide, l'interface affiche une liste vide sans erreur.

### Modele `equipment`

Chaque document `equipment/{equipmentId}` contient au minimum :

- `name`
- `type`
- `serial`
- `status`
- `model`
- `registration`
- `lastMaintenance`
- `notes`
- `createdBy`
- `createdAt`
- `updatedAt`

Les valeurs `undefined` sont retirees avant ecriture.
`createdBy` est toujours force depuis `currentUser.uid`.
`createdAt` et `updatedAt` utilisent `serverTimestamp()`.
Les statuts sont normalises, notamment `available`, `in_mission`, `maintenance` et `out_of_service`.

### Operations CRUD

Un service dedie `src/services/equipmentService.js` centralise les operations Firestore :

- `getAllEquipment()`
- `createEquipment(equipmentData, currentUser)`
- `updateEquipment(equipmentId, updates, currentUser)`
- `deleteEquipment(equipmentId, currentUser)`

Le role transmis par un formulaire n'est jamais utilise comme preuve d'autorisation. Les controles UI utilisent `currentUser.role`, mais la securite reelle doit rester portee par les Firestore Security Rules.

### Droits Admin / Pilote

- Admin : lecture, creation, modification, suppression du materiel.
- Pilote : lecture seule.
- Les boutons Ajouter et Supprimer ne sont pas exposes au Pilote.
- Le changement de statut est desactive pour le Pilote.

La section `firestore.rules` contient deja :

```js
match /equipment/{equipmentId} {
  allow read: if isAdmin() || isPilot();
  allow create, update, delete: if isAdmin();
}
```

Les regles n'ont pas ete deployees automatiquement pendant cette phase.

### Compatibilite missions

Le formulaire Nouvelle mission utilise maintenant les documents `equipment` comme source de selection materiel.
La mission conserve les champs existants :

- `equipment` : nom du materiel selectionne.
- `equipmentIds` : tableau contenant l'ID Firestore du materiel selectionne quand il existe.

La reservation transactionnelle du materiel n'est pas encore implementee. Un materiel peut donc encore etre selectionne sans verrou atomique de disponibilite.

### Limites restantes

- Les documents `equipment` existants doivent etre crees via l'application.
- Les champs `model`, `registration` et `notes` sont prevus dans le modele, mais le formulaire actuel ne les exploite pas encore completement.
- Aucune transaction Firestore ne reserve le materiel lors de la creation d'une mission.
- Firebase Storage n'est pas encore utilise pour les fichiers, fiches techniques ou PDF.

### Prochaine etape

Lier les pilotes aux profils Firestore et remplacer les libelles pilotes par des UID fiables afin de renseigner `assignedPilotId` dans les missions.

## Phase 3.6 - Liaison des pilotes aux missions

Cette phase supprime la liste statique des pilotes et utilise `profiles` comme source unique des pilotes selectionnables.

### Suppression de la liste statique

- `NewMission.js` n'utilise plus `PILOTS_LIST`.
- `src/data/pilots.js` a ete supprime car aucun import actif ne l'utilisait encore.
- Aucun document `pilots` separe n'a ete cree.
- Firebase Authentication n'a pas ete modifie.

### Source Firestore

Les pilotes actifs sont charges depuis `profiles` avec `getActivePilots()` :

- collection lue : `profiles`
- filtres Firestore : `role == "pilot"` et `disabled == false`
- champs retournes au frontend : `uid`, `email`, `displayName`, `role`, `disabled`
- tri effectue cote JavaScript sur `displayName`, avec fallback `email`

La requete reste composee uniquement de filtres d'egalite. Firestore peut utiliser les index automatiques simples pour ce type de requete ; aucun tri Firestore n'est ajoute.

### Reference mission

Le champ technique d'affectation est maintenant :

- `assignedPilotId` : UID Firebase du pilote selectionne

Le champ historique `pilot` peut rester present comme libelle de compatibilite, mais il n'est plus la source de verite et ne doit jamais etre utilise comme identifiant technique.

### Resolution d'affichage

L'affichage utilise la logique suivante :

1. si `assignedPilotId` existe, chercher le profil dans la liste `pilots` deja chargee ;
2. si le profil est trouve, afficher son `displayName` ou son `email` ;
3. sinon utiliser temporairement l'ancien champ `pilot` ;
4. sinon afficher `Pilote non affecte`.

Cette resolution est centralisee dans `src/utils/pilotDisplay.js` et evite toute lecture Firestore individuelle par mission.

### Compatibilite anciennes missions

Les missions existantes ne sont pas migrees automatiquement. Les formats suivants restent affichables :

- `pilot` sous forme de nom ;
- `assignedPilotId` a `null` ;
- `assignedPilotId` absent.

Une migration de donnees pourra etre preparee plus tard, mais seulement apres validation explicite.

### Regles Firestore

Les regles actuelles de `firestore.rules` autorisent seulement `get` sur son propre profil et refusent `list` sur `profiles`. Dans cet etat, le chargement global des pilotes actifs echouera avec `permission-denied`.

Regle minimale recommandee pour permettre a l'admin de charger les pilotes actifs sans elargir les droits d'ecriture :

```js
match /profiles/{uid} {
  allow get: if signedIn() && request.auth.uid == uid;
  allow list: if isAdmin()
    && resource.data.role == "pilot"
    && resource.data.disabled == false;
  allow create, update, delete: if false;
}
```

Avec cette regle, la requete frontend doit conserver les filtres `where("role", "==", "pilot")` et `where("disabled", "==", false)`.

Pour autoriser aussi les pilotes a lire les informations publiques des autres pilotes, il faut d'abord confirmer que `profiles` ne contient aucun champ sensible supplementaire, car les Firestore Security Rules ne masquent pas les champs d'un document. Si cette condition est vraie, `isPilot()` peut etre ajoute a la condition `allow list`. Sinon, conserver la lecture globale reservee a l'admin.

### Limites restantes

- Les regles recommandees doivent etre relues, testees puis deployees manuellement.
- Les anciens documents peuvent encore contenir `pilot` comme libelle historique.
- Aucun workflow de changement d'affectation pilote n'est encore implemente.
- Aucune migration automatique n'a ete executee.

### Prochaine etape

Tester la Phase 3.6 avec un compte admin, un compte pilote actif, un pilote desactive et au moins une ancienne mission, puis ajuster les regles Firestore dans l'emulateur ou le Rules Playground avant publication.

## Phase 4.2 - Validation et normalisation des donnees

Cette phase ajoute une validation applicative ciblee sur les modules Missions et Equipment. Elle ne modifie pas Firebase Authentication, les profils, les pilotes, les dependances, Supabase, `weather.js`, les pages PDF/Login/GlobalAuthorizations, ni `firestore.rules`.

### Helper commun

Un helper sans dependance externe centralise les controles dans `src/utils/validation.js` :

- `normalizeText(value, maxLength)`
- `normalizeOptionalText(value, maxLength)`
- `normalizeStringArray(values, maxItems, maxItemLength)`
- `isValidDateString(value)`
- `isValidNumber(value, min, max)`
- `isValidCoordinates(latitude, longitude)`
- `removeUndefinedFields(object)`
- `validateMissionForm(formData)`
- `validateMissionPayload(missionData)`
- `validateEquipmentForm(formData)`

Les chaines sont tronquees par refus, pas par coupe silencieuse : une valeur trop longue retourne une erreur en francais. Les champs invalides ne sont pas convertis silencieusement, notamment les nombres vides ou `null`. Les valeurs `undefined` sont retirees recursivement avant ecriture Firestore.

### Validations Missions

Le formulaire Nouvelle mission valide maintenant avant `createMission()` :

- client obligatoire, chaine trimmee, maximum 120 caracteres ;
- type de mission obligatoire, dans la liste reelle de l'interface ;
- region, province et commune obligatoires, maximum 100 caracteres chacune ;
- type d'appareil limite a `Drone` ou `Avion` ;
- materiel obligatoire via un identifiant non vide, maximum 128 caracteres ;
- pilote obligatoire via `assignedPilotId`, maximum 128 caracteres ;
- altitude finie entre 0 et 1000 ;
- duree finie entre 1 et 1440 minutes ;
- zone de vol contenant 3 a 100 points ;
- longitude entre -180 et 180, latitude entre -90 et 90 ;
- date de fin optionnelle mais valide au format `AAAA-MM-JJ`, et non anterieure a la date mission si elle existe ;
- donnees meteo optionnelles avec nombres finis et condition texte limitee.

`NewMission.js` bloque la soumission si la validation echoue, affiche les erreurs pres des champs existants quand c'est possible, revient vers l'etape du wizard concernee, conserve toutes les valeurs saisies et ne reinitialise le formulaire qu'apres succes Firestore.

`missionService.js` refait une validation defensive avec `validateMissionPayload()`, construit explicitement une whitelist de champs Firestore, force `createdBy` avec `currentUser.uid`, conserve `createdAt` et `updatedAt` via `serverTimestamp()`, et ne cree plus le champ historique `pilot` pour les nouvelles missions. La compatibilite de lecture des anciennes missions avec `pilot` reste conservee dans `getAllMissions()`.

### Validations Equipment

Le formulaire Equipment valide maintenant :

- `name` obligatoire, trim, maximum 120 caracteres ;
- `type` obligatoire dans `camera`, `aircraft`, `drone`, `accessory` ;
- `serial` optionnel, trim, maximum 100 caracteres ;
- `status` dans `available`, `in_mission`, `maintenance`, `out_of_service` ;
- `model` optionnel, maximum 100 caracteres ;
- `registration` optionnel, maximum 100 caracteres ;
- `notes` optionnel, maximum 1000 caracteres ;
- `lastMaintenance` optionnel, date valide ou `null`.

`Equipment.js` affiche les erreurs en francais, conserve les donnees saisies apres erreur, bloque les doubles actions avec `actionLoading`, garde le controle UI admin et conserve la confirmation existante avant suppression.

`equipmentService.js` remplace le spread large de mise a jour par une whitelist explicite : `name`, `type`, `serial`, `status`, `model`, `registration`, `lastMaintenance`, `notes`. Les champs `createdAt`, `createdBy`, `id` et `firestoreId` ne sont jamais acceptes comme mises a jour. `updatedAt` vient toujours de `serverTimestamp()`.

### Gestion des erreurs

Les modules Missions et Equipment distinguent maintenant :

- erreur de validation : message de correction de champs ;
- `permission-denied` : message de droits insuffisants ;
- `unavailable` ou `deadline-exceeded` : message reseau/Firestore indisponible ;
- autre erreur : message generique.

Les `console.error` restent limites au code et au message d'erreur. Les formulaires complets, tokens, emails sensibles et objets Firebase Auth ne sont pas journalises.

### Suivi des constats Phase 4.1

- SEC-01 : ouvert. `firestore.rules` contient toujours `allow list: if false` sur `profiles`, car cette sous-phase interdit de modifier les rules.
- SEC-02 : ouvert. La validation de schema dans Firestore Rules reste prevue en Phase 4.4.
- SEC-03 : traite cote service applicatif. `equipmentService.updateEquipment()` utilise maintenant une whitelist explicite.
- SEC-04 : traite cote formulaire et service applicatif pour la creation mission. La protection serveur finale reste a ajouter dans les rules.
- SEC-05 : traite cote `NewMission.js` avec validation, erreurs champ et conservation du formulaire.
- SEC-06 : traite cote `Equipment.js` et `equipmentService.js` avec validation, erreurs champ et whitelist.

### Limites restantes

- Les controles client et services React ne remplacent pas les Firestore Security Rules.
- Les regles Firestore ne valident toujours pas le schema des documents `missions` et `equipment`.
- `assignedPilotId` n'est pas encore verifie cote rules contre un profil pilote actif.
- La reservation transactionnelle du materiel reste hors scope.
- Les champs `model`, `registration` et `notes` sont valides par le service, mais ne sont pas encore exposes dans le formulaire actuel.

### Prochaine etape

Phase 4.3 : renforcer les services et flux metier restants si necessaire, puis Phase 4.4 pour porter les validations critiques dans `firestore.rules`.
