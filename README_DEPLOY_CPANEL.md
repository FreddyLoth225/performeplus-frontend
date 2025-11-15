# 🚀 Branche de Déploiement cPanel - PerformePLUS

Cette branche contient les configurations et adaptations spécifiques pour déployer PerformePLUS sur un hébergement **cPanel LWS**, tout en maintenant la compatibilité avec Railway (backend) et Vercel (frontend).

## 📋 Vue d'ensemble

### Architecture cPanel
- **Backend Django API**: `https://performeplus.api.statsmaker73.com`
- **Frontend Next.js**: `https://performeplus.statsmaker73.com`
- **Hébergeur**: LWS (offre cPanel L ou supérieure recommandée)

### Avantages de cette approche
✅ Un seul hébergeur pour backend + frontend (coûts réduits)  
✅ Pas de dépendance à Redis/Celery (environnement simplifié)  
✅ Scalabilité facile via upgrade du plan cPanel  
✅ Compatibilité préservée avec Railway/Vercel  

## 🔧 Modifications principales

### Backend (`performeplus/`)

#### 1. Configuration conditionnelle Redis/Celery
**Fichier**: `performeplus_backend/settings.py`

Ajout d'une variable `USE_REDIS` pour basculer entre:
- Mode **avec Redis** (Railway, dev local avec Redis)
- Mode **sans Redis** (cPanel - cache en mémoire locale)

```python
USE_REDIS = config('USE_REDIS', default=True, cast=bool)

if USE_REDIS:
    # Configuration Redis + Celery
else:
    # Cache en mémoire locale (LocMemCache)
    # Celery désactivé
```

#### 2. Fichier d'environnement cPanel
**Fichier**: `.env.cpanel.example`

Variables critiques pour cPanel:
```bash
USE_REDIS=False  # CRUCIAL pour cPanel
ALLOWED_HOSTS=performeplus.api.statsmaker73.com,statsmaker73.com
CORS_ALLOWED_ORIGINS=https://performeplus.statsmaker73.com
DATABASE_NAME=c2434582c_performeplus_db
# ... voir le fichier complet
```

#### 3. Remplacement Celery par Cron Jobs
Les tâches planifiées Celery Beat sont remplacées par des **cron jobs cPanel** qui appellent des management commands Django:
- `marquer_seances_terminees` (toutes les 15 min)
- `envoyer_rappels_rpe` (quotidien 18h)
- `envoyer_rappels_indice_forme` (quotidien 8h)

### Frontend (`performeplus-frontend/`)

#### 1. URL API centralisée
**Déjà en place** dans `lib/api/client.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
```

#### 2. Fichier d'environnement cPanel
**Fichier**: `.env.cpanel.example`

Variable unique mais critique:
```bash
NEXT_PUBLIC_API_URL=https://performeplus.api.statsmaker73.com/api
NODE_ENV=production
```

## 📚 Documentation de déploiement

### Guides complets étape par étape

#### Backend Django
📄 **[DEPLOY_CPANEL_BACKEND.md](../performeplus/DEPLOY_CPANEL_BACKEND.md)**

Couvre:
1. Création de la base PostgreSQL/MySQL
2. Configuration du sous-domaine
3. Upload des fichiers
4. Installation Python App dans cPanel
5. Variables d'environnement
6. Installation dépendances + migrations
7. Configuration WSGI
8. Collecte des fichiers statiques
9. Configuration des cron jobs
10. Tests et vérification
11. Dépannage

#### Frontend Next.js
📄 **[DEPLOY_CPANEL_FRONTEND.md](./DEPLOY_CPANEL_FRONTEND.md)**

Couvre:
1. Configuration du sous-domaine
2. Upload des fichiers
3. Installation Node.js App dans cPanel
4. Variables d'environnement
5. Build Next.js (`npm run build`)
6. Démarrage de l'application
7. Configuration SSL/HTTPS
8. Tests et vérification
9. Optimisations performance
10. Maintenance et mises à jour

## 🎯 Ordre de déploiement

**IMPORTANT**: Déployer dans cet ordre!

1. ✅ **Backend d'abord**
   - Créer la base de données
   - Déployer Django API
   - Tester l'accès API

2. ✅ **Frontend ensuite**
   - Configurer `NEXT_PUBLIC_API_URL` vers le backend
   - Build et déployer Next.js
   - Tester la connexion frontend ↔ backend

## 🔄 Compatibilité avec Railway/Vercel

### Backend Django
**Aucune modification breaking** pour Railway:

- Sur Railway: définir `USE_REDIS=True` (ou laisser par défaut)
- Railway continuera à utiliser Redis + Celery normalement
- Les variables `RAILWAY_ENVIRONMENT`, `DATABASE_URL`, `REDIS_URL` continuent de fonctionner

### Frontend Next.js
**Aucune modification breaking** pour Vercel:

- Sur Vercel: définir `NEXT_PUBLIC_API_URL` pointant vers Railway
- Le code reste identique (piloté par les variables d'environnement)
- Pas de changement de structure ou de logique

## ⚙️ Configuration par environnement

### Local (Développement)
```bash
# Backend
DEBUG=True
USE_REDIS=True  # ou False selon si vous avez Redis localement
DATABASE_NAME=performeplus
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Railway (Backend) + Vercel (Frontend)
```bash
# Backend (Railway)
USE_REDIS=True
RAILWAY_ENVIRONMENT=production
DATABASE_URL=postgres://... (fourni par Railway)
REDIS_URL=redis://... (fourni par Railway)

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app/api
```

### cPanel (Backend + Frontend)
```bash
# Backend (cPanel)
USE_REDIS=False  # CRUCIAL
DATABASE_NAME=c2434582c_performeplus_db
ALLOWED_HOSTS=performeplus.api.statsmaker73.com
CORS_ALLOWED_ORIGINS=https://performeplus.statsmaker73.com

# Frontend (cPanel)
NEXT_PUBLIC_API_URL=https://performeplus.api.statsmaker73.com/api
```

## 📦 Fichiers importants de cette branche

```
performeplus/
├── .env.cpanel.example          # Variables d'env backend cPanel
├── DEPLOY_CPANEL_BACKEND.md     # Guide déploiement backend
└── performeplus_backend/
    └── settings.py              # Configuration conditionnelle USE_REDIS

performeplus-frontend/
├── .env.cpanel.example          # Variables d'env frontend cPanel
├── DEPLOY_CPANEL_FRONTEND.md    # Guide déploiement frontend
└── README_DEPLOY_CPANEL.md      # Ce fichier
```

## 🚨 Points d'attention

### ⚠️ Backend
1. **USE_REDIS=False** est OBLIGATOIRE sur cPanel (pas de Redis disponible)
2. Ne pas oublier les **cron jobs** pour remplacer Celery
3. Vérifier que le **préfixe utilisateur** (c2434582c_) est bien dans les noms de base
4. **SSL/HTTPS** doit être activé avant de mettre en production

### ⚠️ Frontend
1. **Build AVANT de démarrer** l'app Node.js (`npm run build`)
2. Les variables `NEXT_PUBLIC_*` doivent être définies **AVANT le build**
3. Tout changement de variable d'env nécessite un **rebuild complet**
4. Surveiller la **consommation mémoire** de l'app Node.js

## 🐛 Dépannage rapide

### Backend
```bash
# Vérifier la configuration
python manage.py check --deploy

# Tester la connexion DB
python manage.py dbshell

# Voir les logs
tail -f ~/logs/performeplus_backend_error.log
```

### Frontend
```bash
# Rebuild complet
npm ci
npm run build

# Voir les logs
tail -f ~/logs/performeplus_frontend_error.log

# Vérifier le processus Node
ps aux | grep node
```

## 📊 Ressources du serveur

Ton offre LWS actuelle:
- **Processus**: 0/80 utilisés (beaucoup de marge!)
- **RAM**: 8 GB disponible
- **Disque**: illimité
- **Bases de données**: illimitées

C'est largement suffisant pour:
- 1 application Python (Django)
- 1 application Node.js (Next.js)
- PostgreSQL
- Trafic modéré à moyen

## 📈 Évolution future

Si le projet grandit:

1. **Court terme** (sur cPanel):
   - Upgrader vers offre XL si nécessaire
   - Optimiser les requêtes DB
   - Mettre en place un CDN (Cloudflare)

2. **Moyen terme** (migration partielle):
   - Backend reste sur cPanel
   - Frontend migre vers Vercel (meilleure perf pour Next.js)

3. **Long terme** (scaling complet):
   - Backend vers VPS ou Railway
   - Frontend sur Vercel
   - Redis externe (Upstash, Railway)
   - Celery workers sur Railway/VPS

## 🤝 Support

Pour toute question sur le déploiement cPanel:
1. Consulter les guides détaillés (DEPLOY_CPANEL_*.md)
2. Vérifier la section Dépannage des guides
3. Logs cPanel: Metrics > Errors

---

**Dernière mise à jour**: 15 novembre 2025  
**Auteur**: Équipe PerformePLUS  
**Hébergeur**: LWS cPanel  
