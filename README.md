# 📄 Afridoc

Application web de génération de documents administratifs au Mali et en Afrique.

## Description

**Afridoc** permet à tout citoyen de générer facilement ses documents administratifs directement depuis son téléphone, tablette ou ordinateur — sans avoir besoin d'aller dans un cybercafé.

## Documents disponibles

- 📋 Curriculum Vitae (CV)
- ✉️ Lettre de motivation
- 💼 Demande d'emploi
- 🎓 Demande de stage
- 📜 Attestation de travail
- 🤝 Déclaration sur l'honneur
- 🏛️ Lettre administrative
- 🪪 Demande d'acte de naissance

## Technologies

- **Backend** : Node.js + Express
- **Templates** : EJS
- **PDF** : PDFKit
- **Frontend** : HTML/CSS/JS (responsive, mobile-first)

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

L'application sera accessible à l'adresse : `http://localhost:3000`

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Choisissez le type de document souhaité
3. Remplissez le formulaire
4. Téléchargez votre document en PDF

## Confidentialité

Aucune donnée personnelle n'est stockée sur le serveur. Les documents sont générés à la volée et téléchargés directement sur votre appareil.

## Déploiement

### Architecture

L'application est structurée pour déploiement distribué :
- **Backend** : Node.js/Express sur Neon
- **Frontend** : Static files sur Vercel

### Configuration d'environnement

Avant de déployer, créez un fichier `.env` basé sur `.env.example` :

```bash
cp .env.example .env
```

Configurez les variables suivantes :
- `DATABASE_URL` : URL de connexion Neon PostgreSQL (si utilisée)
- `BACKEND_URL` : URL du backend en production
- `FRONTEND_URL` : URL du frontend en production

### Déploiement du Backend sur Neon

1. Créez un compte sur [Neon.tech](https://neon.tech)
2. Créez une base de données PostgreSQL
3. Connectez votre repository GitHub à Neon
4. Configurez le fichier `.env` avec votre `DATABASE_URL`
5. Pushez vers la branche principale pour déclencher le déploiement automatique

```bash
git push origin main
```

### Déploiement du Frontend sur Vercel

1. Créez un compte sur [Vercel.com](https://vercel.com)
2. Importez ce repository GitHub
3. Configurez les variables d'environnement dans les paramètres Vercel
4. Vercel déploiera automatiquement à chaque push sur la branche principale

```bash
# Ou déploiement manuel
npm run deploy:frontend
```

### Variables d'environnement pour production

Sur Vercel et Neon, configurez :

```
NODE_ENV=production
PORT=3000
BACKEND_URL=https://votre-backend-neon-url
FRONTEND_URL=https://votre-app-vercel.vercel.app
```

### Vérification du déploiement

```bash
# Tester localement
npm start

# Construire et tester
npm run build
npm test
```
