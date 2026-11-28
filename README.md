# Olympic Games App

Application web Angular permettant de visualiser les résultats des pays participants aux Jeux olympiques : nombre de médailles, de participations et d'athlètes, par pays et par édition.

Projet réalisé dans le cadre du parcours OpenClassrooms *Développeur Full-Stack Java / Angular* — « Définissez et développez le front-end en utilisant du code Angular maintenable ».

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancer l'application](#lancer-lapplication)
- [Scripts disponibles](#scripts-disponibles)
- [Routes de l'application](#routes-de-lapplication)
- [Structure du projet](#structure-du-projet)
- [Données](#données)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Évolution vers une API](#évolution-vers-une-api)

---

## Fonctionnalités

### Dashboard (`/`)
- Nombre total de pays et nombre d'éditions des JO.
- Graphique camembert du **nombre total de médailles par pays**, trié par ordre décroissant.
- Un clic sur une part du graphique ouvre la page de détail du pays.

### Détail d'un pays (`/country/:index`)
- Nombre de participations, total de médailles et total d'athlètes du pays.
- Graphique en courbe du **nombre de médailles obtenues à chaque édition** des JO.
- Lien de retour vers le dashboard.

### Gestion des erreurs
- Page **404** pour une URL inexistante ou un pays inexistant.
- Page **d'erreur** en cas d'échec de récupération des données ou de données absentes.
- Messages d'erreur compréhensibles par l'utilisateur, sans détail technique.

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| [Angular](https://angular.dev) | 18 | Framework front-end |
| [TypeScript](https://www.typescriptlang.org) | 5.4 | Langage |
| [RxJS](https://rxjs.dev) | 7.8 | Gestion des flux asynchrones |
| [Chart.js](https://www.chartjs.org) | 4 | Graphiques (camembert et courbe) |
| Jasmine / Karma | — | Tests unitaires |

---

## Prérequis

- [Node.js](https://nodejs.org) **18.19+, 20.11+ ou 22** (versions supportées par Angular 18)
- npm (installé avec Node.js)
- Optionnel : [Angular CLI](https://angular.dev/tools/cli) en global (`npm install -g @angular/cli`). Sinon, utilisez `npx ng` ou les scripts `npm`.

---

## Installation

```bash
git clone https://github.com/ThibaudGauton/openclassrooms_project_2.git
cd openclassrooms_project_2
npm install
```

---

## Lancer l'application

```bash
npm start
```

Ouvrez ensuite [http://localhost:4200](http://localhost:4200). L'application se recharge automatiquement à chaque modification des fichiers sources.

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm start` | Lance le serveur de développement (`ng serve`) |
| `npm run build` | Build de production dans le dossier `dist/` |
| `npm run watch` | Build de développement en mode watch |
| `npm test` | Lance les tests unitaires avec Karma (nécessite Chrome) |

---

## Routes de l'application

| Route | Page | Description |
|---|---|---|
| `/` | `DashboardComponent` | Vue d'ensemble des médailles par pays |
| `/country/:index` | `CountryDetailComponent` | Détail d'un pays (`index` = position du pays dans la liste triée) |
| `/error` | `ErrorComponent` | Erreur de récupération des données |
| `/not-found` | `NotFoundComponent` | Page ou pays introuvable |
| `/**` | `NotFoundComponent` | Toute autre URL |

---

## Structure du projet

```
src/app
├── components/            # Composants réutilisables (affichage uniquement, données via @Input)
│   ├── charts/
│   │   ├── line-chart/    # Graphique en courbe (médailles par édition)
│   │   └── medal-chart/   # Graphique camembert (médailles par pays)
│   ├── error-message/     # Message d'erreur intégré à une page
│   └── header/            # En-tête : titre + cartes de statistiques
├── core/                  # Logique métier, indépendante de l'affichage
│   ├── models/            # Interfaces TypeScript (Olympic, Participation, StatCard)
│   └── services/
│       └── data.service.ts  # Unique point d'accès aux données
├── pages/                 # Composants liés à une route
│   ├── dashboard/
│   ├── country-detail/
│   ├── error/
│   └── not-found/
├── app-routing.module.ts  # Définition des routes
└── app.module.ts          # Module racine
```

**Principes :**
- Les **pages** récupèrent les données via `DataService`, les préparent et les transmettent aux composants.
- Les **composants** de `components/` ne font qu'afficher ce qu'ils reçoivent : ils sont réutilisables et ne connaissent pas la source des données.
- Les abonnements RxJS sont automatiquement libérés à la destruction des composants (`takeUntilDestroyed`), et les graphiques Chart.js sont détruits dans `ngOnDestroy`.

Le détail des choix d'architecture est décrit dans [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Données

Les données sont simulées dans le fichier [`src/assets/mock/olympic.json`](./src/assets/mock/olympic.json) et chargées par `DataService` via `HttpClient`.

Format d'un pays :

```json
{
  "id": 1,
  "country": "Italy",
  "participations": [
    { "id": 1, "year": 2012, "city": "Londres", "medalsCount": 28, "athleteCount": 372 }
  ]
}
```

`DataService` :
- **normalise** les données (liste vide si le fichier est invalide, entrées sans nom de pays écartées, `participations` toujours définies, valeurs numériques manquantes comptées à 0) ;
- **trie** les pays par nombre total de médailles décroissant. Cet ordre est partagé par toutes les pages, ce qui garantit la cohérence de la route `/country/:index`.

---

## Gestion des erreurs

| Situation | Comportement |
|---|---|
| URL inexistante | Page 404 « No corresponding page found » |
| Pays inexistant (`/country/99`, `/country/abc`) | Redirection vers la page 404 « This country does not exist. » |
| Échec de chargement des données | Redirection vers `/error` |
| Aucune donnée disponible | Redirection vers `/error` avec un message dédié |
| Pays sans participation | Message affiché à la place du graphique |

Pendant le chargement, un message « Loading data... » s'affiche : l'utilisateur ne voit jamais d'écran vide.

### Simuler une erreur de récupération

Pour tester les cas d'erreur, passez l'option `simulateDataError` à `true` dans [`src/environments/environment.ts`](./src/environments/environment.ts) :

```ts
export const environment = {
  production: false,
  simulateDataError: true
};
```

Relancez `npm start` : le service renvoie une erreur HTTP 500 simulée et l'application redirige vers la page `/error`. Cette option reste toujours à `false` dans `environment.prod.ts`.

---

## Évolution vers une API

`DataService` est le seul point d'accès aux données. Pour remplacer le fichier mock par une API REST, il suffit de modifier l'URL dans `data.service.ts` (idéalement via une variable d'environnement). Les pages et composants n'ont pas besoin d'être modifiés tant que l'API respecte les interfaces `Olympic` et `Participation`.
