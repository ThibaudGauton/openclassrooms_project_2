# Architecture Front-end — OlympicGamesStarter

Ce document décrit l'architecture mise en place pour structurer le code Angular de manière maintenable, en séparant clairement l'affichage, la logique métier et l'accès aux données.

## 1. Arborescence des dossiers

src/app 
	├── components/ # Composants réutilisables (UI pure, sans logique métier) 
	│ ├── charts/ │ │ ├── line-chart/ # Graphique en courbe (détail d'un pays) 
	│ │ └── medal-chart/ # Graphique camembert (dashboard) 
	│ └── header/ # En-tête réutilisable (titre + cartes de statistiques) 
	├── core/ # Logique métier et accès aux données 
	│ ├── models/ # Interfaces TypeScript (typage des données) 
	│ │ ├── olympic.model.ts 
	│ │ ├── participation.model.ts 
	│ │ └── stat-card.model.ts 
	│ └── services/ 
	│ └── data.service.ts # Service d'accès aux données olympiques 
	├── pages/ # Composants liés au routing (une page = une route) 
	│ ├── dashboard/ # Page d'accueil (vue d'ensemble par pays) 
	│ ├── country-detail/ # Page de détail d'un pays 
	│ └── not-found/ # Page 404 
	├── app.component.* # Composant racine (contient le <router-outlet>) 
	├── app.module.ts # Module racine (déclarations, imports, providers) 
	└── app-routing.module.ts # Configuration des routes de l'application


Cette organisation repose sur trois grands principes :
- **`components/`** : composants **réutilisables**, sans logique métier propre, qui reçoivent leurs données via `@Input()` et communiquent via `@Output()`.
- **`pages/`** : composants **orchestrateurs**, liés à une route, qui récupèrent les données via le service et les transmettent aux composants réutilisables.
- **`core/`** : la **logique métier** (accès aux données, typage), totalement indépendante de l'affichage.

## 2. Composants et leurs rôles

### `DashboardComponent` (`pages/dashboard`)
Page d'accueil de l'application. Elle récupère les données olympiques via `DataService`, calcule les statistiques globales (nombre de pays, nombre de JO, total de médailles par pays), puis transmet ces informations à `HeaderComponent` (pour les cartes de statistiques) et à `MedalChartComponent` (pour le graphique camembert).

### `CountryDetailComponent` (`pages/country-detail`)
Page de détail d'un pays spécifique. Elle récupère le nom du pays depuis l'URL (via `ActivatedRoute`), filtre les données correspondantes, calcule les statistiques propres à ce pays (nombre d'entrées, total de médailles, total d'athlètes), puis transmet ces informations à `HeaderComponent` et à `LineChartComponent`.

### `NotFoundComponent` (`pages/not-found`)
Page affichée lorsque l'utilisateur accède à une route inexistante de l'application.

### `HeaderComponent` (`components/header`)
Composant réutilisable affichant un titre de page ainsi qu'une liste de cartes statistiques (`StatCard[]`), passées via `@Input()`. Il est utilisé à la fois par `DashboardComponent` et `CountryDetailComponent`, ce qui évite la duplication du HTML des cartes entre les deux pages.

### `MedalChartComponent` (`components/charts/medal-chart`)
Composant réutilisable encapsulant la création et le rendu d'un graphique camembert (Chart.js) représentant la répartition des médailles par pays. Il reçoit ses données via `@Input()` et notifie le composant parent lors d'un clic sur un segment du graphique.

### `LineChartComponent` (`components/charts/line-chart`)
Composant réutilisable encapsulant la création et le rendu d'un graphique en courbe (Chart.js) représentant l'évolution des médailles d'un pays au fil des éditions des JO.

### Pourquoi cette séparation ?

Avant cette réorganisation, les composants `pages` géraient **tout** eux-mêmes : appel HTTP, calculs métier, ET configuration de Chart.js, ce qui donnait des fichiers volumineux, difficiles à tester et avec du code HTML dupliqué (notamment l'en-tête avec les cartes de statistiques, identique entre `Dashboard` et `CountryDetail`).

En extrayant la logique d'affichage réutilisable (`HeaderComponent`, `MedalChartComponent`, `LineChartComponent`) dans `components/`, chaque composant a désormais une **responsabilité unique** (Single Responsibility Principle), ce qui facilite la lecture, les tests et la réutilisation.

## 3. Le service Angular : `DataService`

**Emplacement** : `core/services/data.service.ts`

**Rôle** : `DataService` est l'unique point d'accès aux données olympiques dans toute l'application. Il est fourni en singleton (`providedIn: 'root'`), ce qui garantit qu'une seule instance existe pour toute l'application.

Il expose une méthode `getOlympicData()` qui retourne un `Observable<Olympic[]>`, typé grâce aux interfaces définies dans `core/models/` (`Olympic`, `Participation`).

### Avant / Après

Avant la création de ce service, chaque composant page (`Dashboard`, `CountryDetail`) effectuait **son propre appel HTTP** vers le fichier `assets/mock/olympic.json`, avec un typage `any[]` et une gestion d'erreur via la syntaxe dépréciée `subscribe(success, error)`. Ce code était dupliqué entre les deux composants.

Désormais, les composants `pages` ne connaissent plus :
- l'URL des données,
- le mécanisme utilisé pour les récupérer (HTTP, fichier local, etc.),
- le format brut de la réponse (grâce au typage `Olympic[]`).

Ils consomment simplement `dataService.getOlympicData()` et chaînent leur logique de traitement via les opérateurs RxJS (`map`, `switchMap`, `catchError`), ce qui évite également les souscriptions imbriquées non gérées.

## 4. Préparation à une future connexion back-end / API

Cette architecture a été pensée pour rendre **transparente** une future migration du fichier mocké `olympic.json` vers une vraie API REST :

- **Un seul point de modification** : seule l'URL (et éventuellement la configuration de la requête HTTP) dans `data.service.ts` devra être modifiée — par exemple en utilisant `environment.apiUrl` (déjà présent dans `src/environments/`) au lieu du chemin statique vers le fichier mock.
- **Aucun impact sur les composants** : `DashboardComponent` et `CountryDetailComponent` continueront d'appeler `dataService.getOlympicData()` exactement de la même façon, sans aucune modification de leur propre code.
- **Typage déjà en place** : les interfaces `Olympic` et `Participation` définissent déjà le contrat de données attendu — si l'API respecte ce même contrat, aucune adaptation de typage ne sera nécessaire côté composants.
- **Point d'extension centralisé** : toute logique additionnelle liée à une vraie API (gestion des tokens d'authentification, intercepteurs HTTP, retries, mise en cache des réponses via un `BehaviorSubject`) pourra être ajoutée uniquement dans `DataService`, sans toucher au reste de l'application.

---

## 5. Points d'amélioration identifiés (voir `notes-architecture.md`)

Au-delà de la structure de dossiers, les constats suivants restent utiles pour la suite des travaux de maintenabilité :

- **Observables mal gérés** : les souscriptions (`subscribe`) ne sont pas désabonnées (`unsubscribe`). À corriger via `takeUntil` + `OnDestroy`, ou en passant par le pipe `async` dans les templates.
- **Typage `any` restant** : certains traitements intermédiaires peuvent encore être affinés pour éliminer tout `any` résiduel.
- **Code mort / debug** : les `console.log` de débogage ont été supprimés des composants `pages`.
- **Duplication HTML résiduelle** : la mutualisation de l'en-tête via `HeaderComponent` a permis de supprimer la duplication identifiée entre les pages `dashboard` et `country-detail`.