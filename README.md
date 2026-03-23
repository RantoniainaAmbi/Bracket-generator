# 🏆 Bracket Generator

Application web de création et gestion de tournois sportifs, construite avec Next.js 14.

## Fonctionnalités

- Création de tournoi en élimination directe ou phase de poules
- Drag & drop pour organiser les équipes avant le tirage
- Tirage aléatoire en un clic
- Génération automatique du bracket
- Saisie des scores et avancement automatique du bracket
- Classement des poules en temps réel (points, buts, différence de buts)
- Tirage croisé pour le passage poules → bracket final (1er groupe A vs 2ème groupe B)
- Persistance des données au rafraîchissement (Zustand persist)

## Stack technique

- **Next.js 14** — App Router
- **TypeScript** — typage strict
- **Tailwind CSS** — styling
- **Zustand** — state management avec persistance localStorage
- **dnd-kit** — drag & drop

## Installation
```bash
git clone https://github.com/ton-pseudo/bracket-generator
cd bracket-generator
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## Structure du projet
```
bracket-generator/
├── app/
│   ├── page.tsx          # Page d'accueil — création du tournoi
│   ├── tournament/       # Bracket élimination directe
│   └── groups/           # Phase de poules
├── components/
│   └── DraggableTeamList # Liste d'équipes avec drag & drop
├── lib/
│   ├── bracket.ts        # Algo génération et mise à jour du bracket
│   ├── groups.ts         # Algo poules, classement, qualifiés
│   └── store.ts          # Store Zustand avec persistance
└── types/
    └── index.ts          # Types TypeScript
```

## Utilisation

### Élimination directe
1. Entre le nom du tournoi et les équipes
2. Organise l'ordre avec le drag & drop ou tire au sort
3. Clique sur un match pour saisir le score
4. Le vainqueur avance automatiquement au tour suivant

### Phase de poules
1. Choisis le nombre de poules
2. Les équipes sont réparties automatiquement
3. Saisis les scores de chaque match de poule
4. Une fois tous les matchs joués, lance le bracket final
5. Les 2 premiers de chaque poule s'affrontent en tirage croisé