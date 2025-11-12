# 🚀 Guide de Déploiement - PerformePlus Frontend

## 📋 Prérequis

- Compte Vercel (gratuit sur [vercel.com](https://vercel.com))
- Repository Git sur GitHub, GitLab ou Bitbucket
- Backend déployé sur Railway : `https://performeplus-backend-production.up.railway.app/api/`

## 🛠️ Configuration Locale

### 1. Variables d'Environnement

Créez un fichier `.env.local` pour le développement local :

```bash
NEXT_PUBLIC_API_URL=https://performeplus-backend-production.up.railway.app/api
```

**Note :** Le fichier `.env.local` est déjà dans `.gitignore` et ne sera pas commité.

### 2. Test en Local

```bash
cd performeplus-frontend
npm install
npm run dev
```

Vérifiez que l'application fonctionne sur http://localhost:3000

## 📦 Déploiement sur Vercel

### Méthode 1 : Via l'Interface Web Vercel (Recommandée)

1. **Connexion à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec votre compte GitHub/GitLab

2. **Importer le Projet**
   - Cliquez sur "Add New..." → "Project"
   - Sélectionnez votre repository `performeplus`
   - Vercel détectera automatiquement Next.js

3. **Configuration du Projet**
   - **Framework Preset:** Next.js (auto-détecté)
   - **Root Directory:** `performeplus-frontend`
   - **Build Command:** `npm run build` (auto-détecté)
   - **Output Directory:** `.next` (auto-détecté)
   - **Install Command:** `npm install` (auto-détecté)

4. **Variables d'Environnement**
   
   Dans la section "Environment Variables", ajoutez :
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://performeplus-backend-production.up.railway.app/api` |
   
   **Important :** 
   - Cochez "Production", "Preview", et "Development"
   - Les variables `NEXT_PUBLIC_*` sont exposées au navigateur

5. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes pour le build
   - Votre application sera disponible sur `https://votre-projet.vercel.app`

### Méthode 2 : Via CLI Vercel

1. **Installation de Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Connexion**
   ```bash
   vercel login
   ```

3. **Premier Déploiement**
   ```bash
   cd performeplus-frontend
   vercel
   ```
   
   Suivez les instructions :
   - Set up and deploy? → **Yes**
   - Which scope? → Sélectionnez votre compte
   - Link to existing project? → **No**
   - Project name → `performeplus-frontend`
   - In which directory is your code located? → `./`
   - Want to override settings? → **Yes**
   - Build Command → `npm run build`
   - Output Directory → `.next`
   - Development Command → `npm run dev`

4. **Ajouter les Variables d'Environnement**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
   Entrez : `https://performeplus-backend-production.up.railway.app/api`
   Sélectionnez : Production, Preview, Development

5. **Déploiement en Production**
   ```bash
   vercel --prod
   ```

## 🔄 Déploiements Automatiques

Une fois configuré, Vercel déploie automatiquement :

- **Production** : À chaque push sur la branche `main`
- **Preview** : À chaque push sur les branches de fonctionnalités
- **Rollback** : Possibilité de revenir à une version précédente en un clic

## ✅ Configuration Backend (Railway)

Assurez-vous que votre backend Django est configuré pour accepter les requêtes du frontend :

### Dans `performeplus/performeplus_backend/settings.py` :

```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://votre-domaine.vercel.app",  # Remplacez par votre URL Vercel
]

CORS_ALLOW_CREDENTIALS = True

# CSRF Configuration
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://votre-domaine.vercel.app",  # Remplacez par votre URL Vercel
]

# Session Configuration
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
```

**Important :** Après avoir obtenu votre URL Vercel, ajoutez-la dans les configurations ci-dessus et redéployez le backend sur Railway.

## 🌐 Configuration du Domaine Personnalisé (Optionnel)

1. Dans le dashboard Vercel → Settings → Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions Vercel
4. Mettez à jour `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS` dans le backend

## 📊 Monitoring et Logs

- **Logs de Build** : Visibles dans l'onglet "Deployments"
- **Runtime Logs** : Fonction → Logs dans le dashboard Vercel
- **Analytics** : Activer Vercel Analytics pour les métriques de performance

## 🔍 Vérifications Post-Déploiement

1. **Test de l'API**
   - Ouvrez la console du navigateur sur votre site Vercel
   - Vérifiez que les requêtes API pointent vers Railway
   - Testez la connexion et les fonctionnalités principales

2. **Vérification des Variables d'Environnement**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   // Doit afficher : https://performeplus-backend-production.up.railway.app/api
   ```

3. **Tester les Fonctionnalités**
   - Authentification (login/logout)
   - Chargement des données
   - Création/Modification/Suppression

## 🐛 Troubleshooting

### Erreur CORS
- Vérifiez que votre URL Vercel est dans `CORS_ALLOWED_ORIGINS` du backend
- Redéployez le backend après modification

### Variables d'Environnement non chargées
- Les variables `NEXT_PUBLIC_*` nécessitent un rebuild
- Dans Vercel : Deployments → ⋯ → Redeploy

### Build échoue
- Vérifiez les logs de build dans Vercel
- Assurez-vous que `npm run build` fonctionne en local
- Vérifiez les dépendances dans `package.json`

### 404 sur les routes
- Next.js gère le routing automatiquement
- Vérifiez la structure de vos fichiers dans `app/`

## 📝 Commandes Utiles

```bash
# Voir les déploiements
vercel ls

# Voir les logs
vercel logs

# Variables d'environnement
vercel env ls
vercel env pull  # Télécharger les variables localement

# Supprimer un déploiement
vercel remove <deployment-url>

# Ouvrir le projet dans Vercel Dashboard
vercel open
```

## 🔐 Sécurité

- ✅ Variables sensibles uniquement côté serveur (sans `NEXT_PUBLIC_`)
- ✅ Headers de sécurité configurés dans `vercel.json`
- ✅ HTTPS automatique avec certificats SSL
- ✅ `.env.local` dans `.gitignore`

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Note :** Ce guide est basé sur la structure actuelle du projet (Novembre 2025). Pour toute question, consultez la documentation officielle de Vercel ou Next.js.
