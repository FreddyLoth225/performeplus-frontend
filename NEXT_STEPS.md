# 🎯 Prochaines Étapes - Déploiement PerformePlus

## ✅ Ce qui a été configuré

- ✅ `.env.example` - Template des variables d'environnement
- ✅ `.env.local` - Variables pour le développement local
- ✅ `vercel.json` - Configuration Vercel avec headers de sécurité
- ✅ `.gitignore` - Mis à jour pour exclure `.env.local`
- ✅ `DEPLOYMENT.md` - Guide complet de déploiement

## 🚀 Étapes à Suivre

### 1. Tester en Local (5 minutes)

```bash
cd performeplus-frontend
npm install
npm run dev
```

Vérifiez que l'application se connecte correctement au backend Railway sur http://localhost:3000

### 2. Déployer sur Vercel (10 minutes)

#### Option A : Interface Web (Recommandée)

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur "Add New..." → "Project"
3. Importez votre repository GitHub
4. Configurez :
   - **Root Directory:** `performeplus-frontend`
   - **Framework:** Next.js (auto-détecté)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. Ajoutez la variable d'environnement :
   ```
   NEXT_PUBLIC_API_URL = https://performeplus-backend-production.up.railway.app/api
   ```
   ⚠️ Cochez : Production, Preview, et Development

6. Cliquez sur "Deploy" et attendez 2-3 minutes

#### Option B : Via CLI

```bash
npm i -g vercel
cd performeplus-frontend
vercel login
vercel

# Quand demandé, configurez :
# - Project name: performeplus-frontend
# - Build Command: npm run build
# - Output Directory: .next

# Ajoutez la variable d'environnement :
vercel env add NEXT_PUBLIC_API_URL
# Entrez : https://performeplus-backend-production.up.railway.app/api
# Sélectionnez : Production, Preview, Development

# Déployez en production :
vercel --prod
```

### 3. Configurer le Backend Railway (5 minutes)

Une fois que vous avez l'URL Vercel (ex: `https://performeplus-frontend.vercel.app`), mettez à jour les variables d'environnement sur Railway :

1. Allez sur [railway.app](https://railway.app)
2. Sélectionnez votre projet `performeplus-backend`
3. Onglet "Variables"
4. Mettez à jour :

```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://VOTRE-URL.vercel.app
CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://VOTRE-URL.vercel.app
```

⚠️ **Remplacez `VOTRE-URL.vercel.app` par votre vraie URL Vercel**

5. Cliquez sur "Deploy" pour redémarrer avec les nouvelles variables

### 4. Vérifications Post-Déploiement (5 minutes)

1. **Ouvrez votre site Vercel** et testez :
   - ✅ La page se charge correctement
   - ✅ Connexion utilisateur fonctionne
   - ✅ Les données se chargent depuis Railway
   - ✅ Pas d'erreurs CORS dans la console (F12)

2. **Testez les fonctionnalités principales :**
   - Authentification (login/logout)
   - Navigation entre les pages
   - Création/modification de données

3. **Console du navigateur (F12) :**
   ```javascript
   // Vérifiez que l'API URL est correcte
   console.log(process.env.NEXT_PUBLIC_API_URL)
   // Devrait afficher : https://performeplus-backend-production.up.railway.app/api
   ```

## 🔧 Dépannage Rapide

### ❌ Erreur CORS
**Symptôme :** Erreurs dans la console : "Access to fetch... has been blocked by CORS policy"

**Solution :**
1. Vérifiez que votre URL Vercel est dans `CORS_ALLOWED_ORIGINS` sur Railway
2. Vérifiez que `CSRF_TRUSTED_ORIGINS` contient aussi votre URL Vercel
3. Redéployez le backend sur Railway

### ❌ Variables d'environnement non chargées
**Symptôme :** `undefined` quand vous testez `process.env.NEXT_PUBLIC_API_URL`

**Solution :**
1. Dans Vercel Dashboard → Settings → Environment Variables
2. Vérifiez que `NEXT_PUBLIC_API_URL` existe
3. Redéployez : Deployments → ⋯ → Redeploy

### ❌ Build échoue sur Vercel
**Symptôme :** Le déploiement échoue avec des erreurs TypeScript ou ESLint

**Solution :**
1. Testez `npm run build` en local
2. Corrigez les erreurs TypeScript/ESLint
3. Commitez et pushez les corrections
4. Vercel redéploiera automatiquement

### ❌ Page 404 après déploiement
**Symptôme :** Les routes ne fonctionnent pas

**Solution :**
- Next.js gère automatiquement le routing
- Vérifiez la structure de vos fichiers dans `app/`
- Pas besoin de configuration supplémentaire avec `vercel.json`

## 📚 Ressources Utiles

- 📖 [Guide de déploiement complet](./DEPLOYMENT.md)
- 🌐 [Documentation Vercel](https://vercel.com/docs)
- 🚂 [Documentation Railway](https://docs.railway.app)
- ⚛️ [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🎉 Après le Déploiement

Une fois tout fonctionnel :

1. **Domaine personnalisé (optionnel)**
   - Dans Vercel → Settings → Domains
   - Ajoutez votre domaine
   - Mettez à jour les CORS sur Railway

2. **Monitoring**
   - Activez Vercel Analytics pour les métriques
   - Configurez les alertes de déploiement

3. **CI/CD automatique**
   - Déjà configuré ! Chaque push sur `main` déploie automatiquement

4. **Preview Deployments**
   - Chaque Pull Request aura son URL de prévisualisation

---

**Besoin d'aide ?** Consultez le fichier [DEPLOYMENT.md](./DEPLOYMENT.md) pour des instructions détaillées.
