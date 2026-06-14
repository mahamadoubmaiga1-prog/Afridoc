# Guide de Déploiement - Afridoc

## Vue d'ensemble

Ce guide explique comment déployer l'application Afridoc avec:
- **Backend** sur Neon (PostgreSQL)
- **Frontend** sur Vercel

## Prérequis

- Compte GitHub
- Compte Neon (https://neon.tech)
- Compte Vercel (https://vercel.com)
- Node.js 18+ installé localement

## Étape 1 : Configuration locale

### Clone du repository

```bash
git clone https://github.com/mahamadoubmaiga1-prog/Afridoc.git
cd Afridoc
npm install
```

### Configuration des variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` et configurez :
```
NODE_ENV=development
PORT=3000
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Test local

```bash
npm start
# L'app sera accessible à http://localhost:3000
```

## Étape 2 : Déploiement du Backend sur Neon

### 2.1 Créer un compte Neon

1. Allez sur https://neon.tech
2. Inscrivez-vous avec votre compte GitHub
3. Créez un nouveau projet

### 2.2 Configuration du Repository

1. Dans Neon, allez à "Settings" → "Integrations"
2. Connectez votre repository GitHub
3. Sélectionnez `mahamadoubmaiga1-prog/Afridoc`
4. Configurez la branche de déploiement (main)

### 2.3 Variables d'environnement Neon

1. Dans votre projet Neon, notez votre `DATABASE_URL`
2. Configurez aussi:
   - `NODE_ENV=production`
   - `PORT=3000` (Neon utilisera ce port)

### 2.4 Déploiement automatique

Chaque push vers la branche `main` déclenchera le déploiement:

```bash
git add .
git commit -m "Configure deployment for Neon and Vercel"
git push origin main
```

Vérifiez le statut du déploiement dans le dashboard Neon.

## Étape 3 : Déploiement du Frontend sur Vercel

### 3.1 Créer un compte Vercel

1. Allez sur https://vercel.com
2. Inscrivez-vous avec votre compte GitHub

### 3.2 Importer le Repository

1. Cliquez sur "Import Project"
2. Sélectionnez "Import Git Repository"
3. Saisissez: `https://github.com/mahamadoubmaiga1-prog/Afridoc`
4. Cliquez "Continue"

### 3.3 Configuration du Projet

1. **Framework**: Sélectionnez "Other" (pas de framework)
2. **Build Command**: `npm run build`
3. **Output Directory**: laissez vide (Vercel servira les fichiers statiques)
4. **Install Command**: `npm install`

### 3.4 Variables d'environnement Vercel

Avant de déployer, ne commitez PAS le fichier `.env` (il est déjà dans `.gitignore`).

Configurez plutôt les variables directement dans Vercel:

1. Cliquez sur "Environment Variables"
2. Ajoutez:
   - `NODE_ENV`: `production`
   - `BACKEND_URL`: `https://your-neon-backend-url.com`
   - `FRONTEND_URL`: `https://your-vercel-app.vercel.app`

⚠️ **Sécurité**: Ne commitez jamais le fichier `.env` contenant des clés secrètes. Utilisez toujours les tableaux de bord des plateformes (Vercel, Neon) pour gérer les variables sensibles.

### 3.5 Déploiement

Cliquez "Deploy". Vercel installera les dépendances, exécutera le build, et déploiera l'application.

## Étape 4 : Configuration post-déploiement

### 4.1 Vérifier les déploiements

**Backend (Neon)**:
```bash
curl https://your-neon-backend-url/
```

**Frontend (Vercel)**:
Visitez `https://your-vercel-app.vercel.app` dans votre navigateur

### 4.2 Configurer les URLs en production

Après obtention des URLs finales, configurez les variables dans les tableaux de bord:

**Vercel**:
1. Allez à Settings → Environment Variables
2. Ajoutez `BACKEND_URL` (format: https://your-project.neon.tech)
3. Ajoutez `FRONTEND_URL` (votre URL Vercel)

**Neon**:
1. Allez à Settings → Environment Variables
2. Ajoutez les variables de production

⚠️ **N'ajoutez PAS le fichier `.env` au repository** - il contient des secrets et doit rester local.

## Fichiers de configuration

### `.nvmrc`
Spécifie la version de Node.js (18.19.0)

### `vercel.json`
Configuration pour Vercel:
- Build command
- Dev command
- Environment variables
- Functions

### `.env.example`
Template pour les variables d'environnement

### `package.json`
Scripts de déploiement et build

## Monitoring et logs

### Logs Neon
https://console.neon.tech → Votre projet → Logs

### Logs Vercel
https://vercel.com → Votre projet → Deployments → Cliquez sur un déploiement pour voir les logs

## Troubleshooting

### Le backend ne démarre pas sur Neon

- Vérifiez la `DATABASE_URL`
- Vérifiez les logs dans le dashboard Neon
- Assurez-vous que le `PORT` est configuré

### Le frontend Vercel ne charge pas le backend

- Vérifiez que `BACKEND_URL` est correct et accessible
- Vérifiez la console du navigateur (DevTools) pour les erreurs CORS
- Assurez-vous que le backend accepte les requêtes cross-origin

### Build échoue

- Vérifiez que `npm install` fonctionne localement
- Vérifiez que `npm run build` fonctionne localement
- Consultez les logs du déploiement pour plus de détails

## Mise à jour du code

Pour mettre à jour l'application:

```bash
# Faites vos modifications
git add .
git commit -m "Your message"
git push origin main
```

Neon et Vercel redéploieront automatiquement.

## Support

Pour plus d'informations:
- Documentation Neon: https://neon.tech/docs
- Documentation Vercel: https://vercel.com/docs
- Issues du projet: https://github.com/mahamadoubmaiga1-prog/Afridoc/issues
