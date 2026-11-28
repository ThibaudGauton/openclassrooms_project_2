# Architecture Front-end — OlympicGamesStarter

Ce document décrit l'architecture mise en place pour structurer le code Angular de manière maintenable, en séparant clairement l'affichage, la logique métier et l'accès aux données.

## 1. Arborescence des dossiers

```
src/app
├── components/              # Composants réutilisables (affichage, sans logique métier)
│   ├── charts/
│   │   ├── line-chart/      # Graphique en courbe (détail d'un pays)
│   │   └── medal-chart/     # Graphique camembert (dashboard)
│   ├── error-message/       # Message d'erreur intégré à une page
│   └── header/              # En-tête réutilisable (titre + cartes de statistiques)
├── core/                    # Logique métier et accès aux données
│   ├── models/              # Interfaces TypeScript (typage des données)
│   │   ├── olympic.model.ts
│   │   ├── participation.model.ts
│   │   └── stat-card.model.ts
│   └── services/
│       └── data.service.ts  # Service d'accès aux données olympiques
├── pages/                   # Composants liés au routing (une page = une route)
│   ├── dashboard/           # Page d'accueil (vue d'ensemble par pays)
│   ├── country-detail/      # Page de détail d'un pays
│   ├── error/               # Page d'erreur de récupération des données
│   └── not-found/           # Page 404
├── app.component.*          # Composant racine (contient le <router-outlet>)
├── app.module.ts            # Module racine (déclarations, imports, providers)
└── app-routing.module.ts    # Configuration des routes de l'application
```

Cette organisation repose sur trois grands principes :
- **`components/`** : composants **réutilisables**, sans logique métier propre, qui reçoivent leurs données via `@Input()`.
- **`pages/`** : composants **orchestrateurs**, liés à une route, qui récupèrent les données via le service et les transmettent aux composants réutilisables.
- **`core/`** : la **logique métier** (accès aux données, typage), totalement indépendante de l'affichage.

## 2. Composants et leurs rôles

### `DashboardComponent` (`pages/dashboard`)
Page d'accueil de l'application. Elle récupère les données olympiques (déjà triées par nombre de médailles décroissant) via `DataService`, calcule les statistiques globales (nombre de pays, nombre de JO, total de médailles par pays), puis transmet ces informations à `HeaderComponent` (pour les cartes de statistiques) et à `MedalChartComponent` (pour le graphique camembert).

### `CountryDetailComponent` (`pages/country-detail`)
Page de détail d'un pays spécifique. Elle récupère l'index du pays depuis l'URL (route `country/:index`, via `ActivatedRoute`), sélectionne le pays à cette position dans la liste fournie par `DataService`, calcule les statistiques propres à ce pays (nombre d'entrées, total de médailles, total d'athlètes), puis transmet ces informations à `HeaderComponent` et à `LineChartComponent`.

### `NotFoundComponent` (`pages/not-found`)
Page 404, affichée lorsque l'utilisateur accède à une route inexistante (route générique `**`) ou à un pays inexistant. Elle affiche un message par défaut, ou un message plus précis transmis via l'état de navigation (par exemple « This country does not exist. »).

### `ErrorComponent` (`pages/error`)
Page affichée sur la route `/error` lorsque les données ne peuvent pas être récupérées ou sont absentes. Comme `NotFoundComponent`, elle peut recevoir un message via l'état de navigation, et propose un lien « Retry » vers le dashboard.

### `HeaderComponent` (`components/header`)
Composant réutilisable affichant un titre de page ainsi qu'une liste de cartes statistiques (`StatCard[]`), passées via `@Input()`. Il est utilisé à la fois par `DashboardComponent` et `CountryDetailComponent`, ce qui évite la duplication du HTML des cartes entre les deux pages.

### `MedalChartComponent` (`components/charts/medal-chart`)
Composant réutilisable encapsulant la création et le rendu d'un graphique camembert (Chart.js) représentant la répartition des médailles par pays. Il reçoit ses données via `@Input()`. Lors d'un clic sur un segment, il navigue vers la page de détail du pays en utilisant l'index du segment (`/country/:index`), qui correspond à la position du pays dans la liste triée par `DataService`.

### `LineChartComponent` (`components/charts/line-chart`)
Composant réutilisable encapsulant la création et le rendu d'un graphique en courbe (Chart.js) représentant l'évolution des médailles d'un pays au fil des éditions des JO.

### `ErrorMessageComponent` (`components/error-message`)
Composant réutilisable affichant un message d'erreur à l'intérieur d'une page (par exemple, un pays sans aucune participation), avec un lien de retour optionnel.

### Cycle de vie et libération des ressources
- Les abonnements RxJS des pages sont libérés automatiquement à la destruction du composant grâce à `takeUntilDestroyed(DestroyRef)`.
- Les composants de graphiques détruisent leur instance Chart.js dans `ngOnDestroy`, ainsi qu'avant chaque reconstruction du graphique, afin d'éviter les fuites mémoire.

### Pourquoi cette séparation ?

Avant cette réorganisation, les composants `pages` géraient **tout** eux-mêmes : appel HTTP, calculs métier, ET configuration de Chart.js, ce qui donnait des fichiers volumineux, difficiles à tester et avec du code HTML dupliqué (notamment l'en-tête avec les cartes de statistiques, identique entre `Dashboard` et `CountryDetail`).

En extrayant la logique d'affichage réutilisable (`HeaderComponent`, `MedalChartComponent`, `LineChartComponent`) dans `components/`, chaque composant a désormais une **responsabilité unique** (Single Responsibility Principle), ce qui facilite la lecture, les tests et la réutilisation.

## 3. Le service Angular : `DataService`

**Emplacement** : `core/services/data.service.ts`

**Rôle** : `DataService` est l'unique point d'accès aux données olympiques dans toute l'application. Il est fourni en singleton (`providedIn: 'root'`), ce qui garantit qu'une seule instance existe pour toute l'application.

Il expose une méthode `getOlympicData()` qui retourne un `Observable<Olympic[]>`, typé grâce aux interfaces définies dans `core/models/` (`Olympic`, `Participation`). Avant de transmettre les données, le service :
- **normalise** les données reçues : liste vide si la réponse n'est pas un tableau, entrées sans nom de pays écartées, `participations` toujours définies, valeurs numériques manquantes comptées à 0 ;
- **trie** les pays par nombre total de médailles décroissant. Cet ordre unique est partagé par toutes les pages, ce qui garantit la cohérence entre l'index utilisé dans la route `/country/:index` et le pays affiché.

Pour tester la gestion des erreurs, l'option `simulateDataError` des fichiers d'environnement permet de simuler une erreur HTTP 500 (toujours désactivée en production).

### Avant / Après

Avant la création de ce service, chaque composant page (`Dashboard`, `CountryDetail`) effectuait **son propre appel HTTP** vers le fichier `assets/mock/olympic.json`, avec un typage `any[]` et une gestion d'erreur via la syntaxe dépréciée `subscribe(success, error)`. Ce code était dupliqué entre les deux composants.

Désormais, les composants `pages` ne connaissent plus :
- l'URL des données,
- le mécanisme utilisé pour les récupérer (HTTP, fichier local, etc.),
- le format brut de la réponse (grâce au typage `Olympic[]`).

Ils consomment simplement `dataService.getOlympicData()` et chaînent leur logique de traitement via les opérateurs RxJS (`map`, `switchMap`, `catchError`, `takeUntilDestroyed`), ce qui évite également les souscriptions imbriquées non gérées.

## 4. Gestion des erreurs

| Situation | Détection | Comportement |
|---|---|---|
| URL inexistante | Route générique `**` | Page 404 (`NotFoundComponent`) |
| Pays inexistant | `CountryDetailComponent` : index non entier, négatif ou hors limites | Redirection vers `/not-found` avec un message dédié |
| Échec de récupération des données | `catchError` dans les pages | Redirection vers `/error` (`ErrorComponent`) |
| Aucune donnée disponible | Liste vide renvoyée par `DataService` | Redirection vers `/error` avec un message dédié |
| Pays sans participation | `CountryDetailComponent` | `ErrorMessageComponent` à la place du graphique |

Principes appliqués :
- **Jamais d'écran vide** : un message « Loading data... » s'affiche tant que les données ne sont pas prêtes.
- **Aucun message technique exposé** : les messages affichés sont rédigés pour l'utilisateur, le détail de l'erreur n'est jamais affiché.
- Les redirections utilisent `replaceUrl: true`, pour que le bouton « Précédent » du navigateur ne ramène pas sur l'URL en erreur.

## 5. Préparation à une future connexion back-end / API

Cette architecture a été pensée pour rendre **transparente** une future migration du fichier mocké `olympic.json` vers une vraie API REST :

- **Un seul point de modification** : seule l'URL (et éventuellement la configuration de la requête HTTP) dans `data.service.ts` devra être modifiée — par exemple en ajoutant une variable `apiUrl` dans les fichiers de `src/environments/` (qui contiennent déjà `production` et `simulateDataError`) et en l'utilisant à la place du chemin statique vers le fichier mock.
- **Aucun impact sur les composants** : `DashboardComponent` et `CountryDetailComponent` continueront d'appeler `dataService.getOlympicData()` exactement de la même façon, sans aucune modification de leur propre code.
- **Typage déjà en place** : les interfaces `Olympic` et `Participation` définissent déjà le contrat de données attendu — si l'API respecte ce même contrat, aucune adaptation de typage ne sera nécessaire côté composants.
- **Point d'extension centralisé** : toute logique additionnelle liée à une vraie API (gestion des tokens d'authentification, intercepteurs HTTP, retries, mise en cache des réponses via un `BehaviorSubject`) pourra être ajoutée uniquement dans `DataService`, sans toucher au reste de l'application.
