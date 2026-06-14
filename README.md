# 📄 Afridoc

Application web de génération de documents administratifs au Mali et en Afrique.

## Description

**Afridoc** permet à tout citoyen de générer facilement ses documents administratifs directement depuis son téléphone, tablette ou ordinateur — sans avoir besoin d'aller dans un cybercafé.

## Documents disponibles (16 types)

| Catégorie | Documents |
|---|---|
| **Emploi** | 📋 Curriculum Vitae (CV), ✉️ Lettre de motivation, 💼 Demande d'emploi, 📜 Attestation de travail, 🌴 Demande de congé, 🧾 Contrat de travail |
| **Stage & Scolarité** | 🎓 Demande de stage, 🏫 Attestation de scolarité |
| **Administratif** | 🤝 Déclaration sur l'honneur, 🏛️ Lettre administrative, 🪪 Demande d'acte de naissance, 🏠 Certificat de résidence |
| **Juridique & Financier** | 🖊️ Procuration, ⚖️ Mise en demeure, 💳 Reçu de paiement |
| **Recommandation** | 🌟 Lettre de recommandation |

## Technologies

- **Backend** : Node.js 18+ + Express 4
- **Templates** : EJS
- **PDF** : PDFKit (3 thèmes : Classique, Moderne, Minimaliste)
- **QR Code** : qrcode
- **Frontend** : HTML/CSS/JS (responsive, mobile-first, PWA)
- **Internationalisation** : Français 🇫🇷, Anglais 🇬🇧, Bambara 🎯
- **Sécurité** : Rate limiting (15 générations / 15 min)

## Installation

```bash
npm install
```

## Démarrage

```bash
# Mode production
npm start

# Mode développement
npm run dev
```

L'application sera accessible à l'adresse : `http://localhost:3000`

## Tests

```bash
npm test
```

24 tests d'intégration couvrent l'ensemble des 16 types de documents.

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Recherchez ou choisissez le type de document souhaité
3. Remplissez le formulaire guidé
4. Prévisualisez votre document avant génération (optionnel)
5. Téléchargez votre document en PDF

## API

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/stats` | GET | Nombre total de documents générés |
| `/api/health` | GET | Statut de santé du serveur |
| `/documents/:type` | GET | Formulaire de saisie |
| `/documents/:type/preview` | POST | Aperçu HTML |
| `/documents/:type/generate` | POST | Génération PDF |

## Confidentialité

Aucune donnée personnelle n'est stockée sur le serveur. Les documents sont générés à la volée et téléchargés directement sur votre appareil.

## Déploiement

### Prérequis

- Node.js 18+ (voir `.nvmrc`)
- Variables d'environnement : copier `.env.example` en `.env`

```bash
cp .env.example .env
```

### Déploiement sur Render / Railway (recommandé)

1. Connectez votre repository GitHub à [Render](https://render.com) ou [Railway](https://railway.app)
2. Configurez la commande de démarrage : `npm start`
3. Ajoutez la variable `NODE_ENV=production`
4. Le service se déploie automatiquement à chaque push sur `main`

### Déploiement sur Vercel

```bash
# Déploiement manuel
npm run deploy:frontend
```

### Variables d'environnement

```env
NODE_ENV=production
PORT=3000
```

### Vérification du déploiement

```bash
# Santé du serveur
curl https://votre-app.com/api/health

# Statistiques
curl https://votre-app.com/api/stats
```
