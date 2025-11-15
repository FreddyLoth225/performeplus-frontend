═══════════════════════════════════════════════════════════════════════════════
          GUIDE DE DÉPLOIEMENT CPANEL LWS - PERFORMEPLUS FRONTEND
                     Frontend Next.js 16 en Node.js App
═══════════════════════════════════════════════════════════════════════════════

Date: 15 novembre 2025
Hébergeur: LWS (cPanel)
Domaine Frontend: performeplus.statsmaker73.com
Domaine API Backend: performeplus.api.statsmaker73.com
Environnement: Production avec Node.js App

═══════════════════════════════════════════════════════════════════════════════
TABLE DES MATIÈRES
═══════════════════════════════════════════════════════════════════════════════

1. PRÉREQUIS
2. CONFIGURATION DU SOUS-DOMAINE
3. UPLOAD DES FICHIERS
4. INSTALLATION DE L'APPLICATION NODE.JS
5. CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
6. INSTALLATION DES DÉPENDANCES & BUILD
7. DÉMARRAGE DE L'APPLICATION
8. CONFIGURATION SSL/HTTPS
9. TESTS & VÉRIFICATION
10. OPTIMISATIONS PERFORMANCE
11. DÉPANNAGE
12. MAINTENANCE & MISES À JOUR

═══════════════════════════════════════════════════════════════════════════════
1. PRÉREQUIS
═══════════════════════════════════════════════════════════════════════════════

✓ Backend Django déjà déployé et fonctionnel sur:
  https://performeplus.api.statsmaker73.com

✓ Compte cPanel LWS actif (offre M, L ou XL)
✓ Node.js disponible sur le serveur (version 18+ recommandée)
✓ Accès SSH activé (recommandé pour build)
✓ Code source frontend dans: performeplus-frontend/

IMPORTANT: Le backend DOIT être déployé et fonctionnel AVANT le frontend,
car le frontend a besoin de communiquer avec l'API backend.

═══════════════════════════════════════════════════════════════════════════════
2. CONFIGURATION DU SOUS-DOMAINE
═══════════════════════════════════════════════════════════════════════════════

Dans cPanel > Sous-domaines:

1. Créer le sous-domaine principal:
   - Sous-domaine: performeplus
   - Domaine: statsmaker73.com
   - Racine du document: /home/c2434582c/performeplus_frontend/public
   - Cliquer "Créer"

2. Vérifier la création:
   - Le sous-domaine performeplus.statsmaker73.com doit apparaître
   - Noter le chemin complet du projet sera: /home/c2434582c/performeplus_frontend

3. SSL (Certificat HTTPS):
   - Aller dans "SSL/TLS" > "Certificats SSL"
   - Si AutoSSL/Let's Encrypt est activé, attendre quelques minutes
   - Vérifier que le certificat est émis pour performeplus.statsmaker73.com
   - HTTPS est OBLIGATOIRE pour la production

═══════════════════════════════════════════════════════════════════════════════
3. UPLOAD DES FICHIERS
═══════════════════════════════════════════════════════════════════════════════

3.1. VIA SSH (RECOMMANDÉ - Plus rapide pour node_modules)
────────────────────────────────────────────────────────────

Connexion SSH:
ssh c2434582c@ssh.statsmaker73.com

cd /home/c2434582c

# Option 1: Via Git (recommandé)
git clone https://github.com/FreddyLoth225/performeplus-frontend.git performeplus_frontend
cd performeplus_frontend
git checkout deploy/cpanel  # Utiliser la branche cPanel

# Option 2: Si Git non disponible, utiliser SCP depuis votre machine
# Depuis PowerShell Windows:
cd "C:\Users\StatSport Africa\Documents\performePLUS\performeplus-frontend"
scp -r . c2434582c@ssh.statsmaker73.com:/home/c2434582c/performeplus_frontend/

3.2. VIA FTP/SFTP (Alternative)
─────────────────────────────────

Avec FileZilla ou WinSCP:
- Hôte: sftp.statsmaker73.com
- Utilisateur: c2434582c
- Mot de passe: [votre mot de passe cPanel]
- Port: 22 (SFTP)

Uploader TOUS les fichiers vers: /home/c2434582c/performeplus_frontend/

Fichiers importants à inclure:
✓ app/ (tout le code Next.js)
✓ components/
✓ lib/
✓ public/
✓ package.json
✓ package-lock.json (IMPORTANT pour versions exactes)
✓ next.config.ts
✓ tsconfig.json
✓ tailwind.config.ts
✓ .env.cpanel.example (pour référence)

NE PAS uploader:
✗ node_modules/ (sera installé sur le serveur)
✗ .next/ (sera généré lors du build)
✗ .git/ (sauf si vous utilisez Git sur le serveur)

═══════════════════════════════════════════════════════════════════════════════
4. INSTALLATION DE L'APPLICATION NODE.JS
═══════════════════════════════════════════════════════════════════════════════

Dans cPanel > "Setup Node.js App" ou "Application Node.js":

1. Créer une nouvelle application Node.js:
   ┌─────────────────────────────────────────────────────────────┐
   │ Node.js version: 18.x ou 20.x (la plus récente stable)      │
   │ Application mode: Production                                │
   │ Application root: performeplus_frontend                     │
   │ Application URL: https://performeplus.statsmaker73.com      │
   │ Application startup file: server.js (on configurera après)  │
   └─────────────────────────────────────────────────────────────┘

2. Cliquer "Create" / "Créer"

3. cPanel va créer l'environnement Node.js
   - Note du chemin qui sera affiché
   - Généralement: /home/c2434582c/nodevenv/performeplus_frontend

4. NE PAS encore démarrer l'application (on doit d'abord installer et builder)

═══════════════════════════════════════════════════════════════════════════════
5. CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
═══════════════════════════════════════════════════════════════════════════════

5.1. CRÉER LE FICHIER .env.production
───────────────────────────────────────

Via SSH ou Gestionnaire de fichiers cPanel:

cd /home/c2434582c/performeplus_frontend

Créer le fichier .env.production:

─────────────────────────────────────────────────────────────────────
# ENVIRONNEMENT
NODE_ENV=production

# URL DE L'API BACKEND (CRUCIAL)
NEXT_PUBLIC_API_URL=https://performeplus.api.statsmaker73.com/api

# AUTRES VARIABLES SI NÉCESSAIRE
# NEXT_PUBLIC_SITE_URL=https://performeplus.statsmaker73.com
─────────────────────────────────────────────────────────────────────

5.2. CONFIGURER LES VARIABLES D'ENVIRONNEMENT DANS CPANEL
───────────────────────────────────────────────────────────

Dans cPanel > Setup Node.js App > Votre application > Environment Variables:

Ajouter:
┌────────────────────────────────┬──────────────────────────────────────────────┐
│ Nom                            │ Valeur                                       │
├────────────────────────────────┼──────────────────────────────────────────────┤
│ NODE_ENV                       │ production                                   │
│ NEXT_PUBLIC_API_URL            │ https://performeplus.api.statsmaker73.com/api│
└────────────────────────────────┴──────────────────────────────────────────────┘

IMPORTANT: Les variables NEXT_PUBLIC_* doivent être définies AVANT le build,
car Next.js les intègre dans le code généré.

═══════════════════════════════════════════════════════════════════════════════
6. INSTALLATION DES DÉPENDANCES & BUILD
═══════════════════════════════════════════════════════════════════════════════

Via SSH (FORTEMENT RECOMMANDÉ):

cd /home/c2434582c/performeplus_frontend

# Activer l'environnement Node.js (commande fournie par cPanel)
source /home/c2434582c/nodevenv/performeplus_frontend/bin/activate

# Vérifier la version Node
node --version  # Doit être 18+
npm --version

6.1. INSTALLATION DES DÉPENDANCES
───────────────────────────────────

# Installer toutes les dépendances
npm ci  # Utilise package-lock.json pour versions exactes

# Alternative si npm ci échoue:
npm install

# Vérifier que node_modules/ est créé et plein

6.2. BUILD DE L'APPLICATION NEXT.JS
─────────────────────────────────────

# Lancer le build Next.js
npm run build

Ce processus va:
✓ Compiler TypeScript
✓ Optimiser les composants React
✓ Générer les pages statiques et serveur
✓ Créer le dossier .next/ avec l'application buildée
✓ Optimiser les images et assets

DURÉE ESTIMÉE: 2-5 minutes selon la taille du projet

Si le build réussit, vous verrez:
✓ Page Size First Load JS
✓ Route (pages)...
✓ ○ (Static) automatically rendered as static HTML

6.3. VÉRIFIER LE BUILD
───────────────────────

ls -la .next/
# Doit contenir: server/, static/, standalone/ (si configuré), etc.

═══════════════════════════════════════════════════════════════════════════════
7. DÉMARRAGE DE L'APPLICATION
═══════════════════════════════════════════════════════════════════════════════

7.1. CONFIGURER LE SCRIPT DE DÉMARRAGE
────────────────────────────────────────

Dans cPanel > Setup Node.js App > Votre application:

┌─────────────────────────────────────────────────────────────┐
│ Application startup file: (laisser vide ou mettre server.js)│
│ Application Entry Point: npm                                │
│ Arguments: start                                            │
└─────────────────────────────────────────────────────────────┘

Ou simplement mettre dans "Commande de démarrage":
npm start

Cela exécutera: next start (défini dans package.json)

7.2. CONFIGURATION DU PORT (Si nécessaire)
────────────────────────────────────────────

cPanel assignera automatiquement un port pour votre app Node.js.
Il configurera aussi le reverse proxy Apache pour servir votre app
sur https://performeplus.statsmaker73.com

Vous n'avez généralement RIEN à configurer manuellement.

7.3. DÉMARRER L'APPLICATION
─────────────────────────────

Dans cPanel > Setup Node.js App > Votre application:
- Cliquer sur "Start App" ou "Démarrer"
- Attendre quelques secondes
- Le statut doit passer à "Running" / "En cours d'exécution"

7.4. VÉRIFIER LE STATUT
─────────────────────────

Dans la même interface, vérifier:
✓ Status: Running
✓ Uptime: quelques secondes/minutes
✓ Memory usage: devrait être raisonnable (<500MB au démarrage)

═══════════════════════════════════════════════════════════════════════════════
8. CONFIGURATION SSL/HTTPS
═══════════════════════════════════════════════════════════════════════════════

8.1. ACTIVER LE CERTIFICAT SSL
────────────────────────────────

Si ce n'est pas déjà fait automatiquement:

cPanel > SSL/TLS > SSL/TLS Status:
- Trouver performeplus.statsmaker73.com
- Cliquer "Run AutoSSL"
- Attendre l'émission du certificat (quelques minutes)

8.2. FORCER HTTPS (Redirection HTTP → HTTPS)
──────────────────────────────────────────────

Créer ou modifier .htaccess dans /home/c2434582c/performeplus_frontend/public:

─────────────────────────────────────────────────────────────────────
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
─────────────────────────────────────────────────────────────────────

8.3. VÉRIFIER HTTPS
─────────────────────

Tester dans le navigateur:
http://performeplus.statsmaker73.com → doit rediriger vers HTTPS
https://performeplus.statsmaker73.com → doit afficher un cadenas vert

═══════════════════════════════════════════════════════════════════════════════
9. TESTS & VÉRIFICATION
═══════════════════════════════════════════════════════════════════════════════

9.1. TESTER L'ACCÈS AU SITE
─────────────────────────────

Navigateur:
https://performeplus.statsmaker73.com

✓ La page d'accueil doit se charger
✓ Pas d'erreurs dans la console (F12)
✓ Les styles Tailwind doivent s'appliquer correctement

9.2. TESTER LA CONNEXION À L'API
──────────────────────────────────

1. Aller sur la page de login: /login
2. Console navigateur (F12) > Network
3. Essayer de se connecter avec un compte test
4. Vérifier que les requêtes vont vers:
   https://performeplus.api.statsmaker73.com/api/auth/login/
5. Pas d'erreurs CORS
6. Token reçu et stocké dans localStorage

9.3. TESTER LA NAVIGATION
───────────────────────────

✓ Page d'accueil: /
✓ Login: /login
✓ Register: /register
✓ Dashboard (après login): /dashboard
✓ Navigation entre pages fluide (client-side routing)

9.4. VÉRIFIER LES LOGS
───────────────────────

Via SSH:
# Logs de l'application Node.js
tail -f /home/c2434582c/logs/performeplus_frontend_error.log

# Ou dans cPanel > Metrics > Errors

═══════════════════════════════════════════════════════════════════════════════
10. OPTIMISATIONS PERFORMANCE
═══════════════════════════════════════════════════════════════════════════════

10.1. COMPRESSION GZIP
───────────────────────

Dans .htaccess (public/):

─────────────────────────────────────────────────────────────────────
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
─────────────────────────────────────────────────────────────────────

10.2. CACHE DES ASSETS
───────────────────────

Next.js gère déjà le cache des assets via _next/static/
Ajouter dans .htaccess:

─────────────────────────────────────────────────────────────────────
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
─────────────────────────────────────────────────────────────────────

10.3. MONITORING MÉMOIRE
─────────────────────────

Dans cPanel > Setup Node.js App > Votre app:
- Surveiller "Memory usage"
- Si > 1GB régulièrement, envisager d'upgrader le plan cPanel

═══════════════════════════════════════════════════════════════════════════════
11. DÉPANNAGE
═══════════════════════════════════════════════════════════════════════════════

PROBLÈME: 502 Bad Gateway
───────────────────────────
Solution:
1. App Node.js plantée → Restart dans cPanel
2. Vérifier logs: tail -f ~/logs/performeplus_frontend_error.log
3. Vérifier build: npm run build réussi?
4. Mémoire insuffisante? → Upgrader plan

PROBLÈME: 404 sur toutes les pages sauf la home
─────────────────────────────────────────────────
Solution:
1. Next.js en mode serveur nécessite que Node.js gère le routing
2. Vérifier que l'app Node.js tourne bien
3. Pas besoin de .htaccess pour le routing (Next.js s'en occupe)

PROBLÈME: CORS errors dans la console
───────────────────────────────────────
Solution:
1. Vérifier que le backend a:
   CORS_ALLOWED_ORIGINS=https://performeplus.statsmaker73.com
2. Vérifier NEXT_PUBLIC_API_URL dans .env.production
3. Rebuild le frontend: npm run build + restart

PROBLÈME: Variables d'environnement non prises en compte
──────────────────────────────────────────────────────────
Solution:
1. Les NEXT_PUBLIC_* doivent être définies AVANT npm run build
2. Modifier les variables dans cPanel Environment Variables
3. Rebuild obligatoire: npm run build
4. Restart l'application

PROBLÈME: Build échoue avec erreur TypeScript
───────────────────────────────────────────────
Solution:
1. Vérifier les erreurs dans le log du build
2. Sur machine locale: npm run build (corriger les erreurs)
3. Push le code corrigé
4. Re-pull/upload sur le serveur
5. Rebuild

PROBLÈME: Application très lente
──────────────────────────────────
Solution:
1. Vérifier la mémoire utilisée (cPanel)
2. Optimiser les images (Next.js Image component)
3. Envisager le mode standalone build (next.config.ts: output: 'standalone')
4. Upgrader le plan cPanel si nécessaire

PROBLÈME: App s'arrête régulièrement
──────────────────────────────────────
Solution:
1. Limite de processus atteinte? (vérifier dans cPanel stats)
2. Memory leak? → Restart et monitorer
3. Créer un cron job pour restart automatique si down:
   */5 * * * * curl https://performeplus.statsmaker73.com || /path/to/restart/script

═══════════════════════════════════════════════════════════════════════════════
12. MAINTENANCE & MISES À JOUR
═══════════════════════════════════════════════════════════════════════════════

12.1. METTRE À JOUR LE CODE
─────────────────────────────

Via SSH:

cd /home/c2434582c/performeplus_frontend

# Si Git:
git pull origin deploy/cpanel

# Ou upload les fichiers via FTP

# Activer l'environnement Node
source /home/c2434582c/nodevenv/performeplus_frontend/bin/activate

# Installer les nouvelles dépendances si package.json a changé
npm ci

# Rebuild
npm run build

# Restart dans cPanel > Setup Node.js App > Restart

12.2. METTRE À JOUR LES DÉPENDANCES
─────────────────────────────────────

# Sur votre machine locale d'abord
npm update
npm audit fix

# Tester localement
npm run build
npm run dev

# Si tout fonctionne, commit package.json et package-lock.json
# Puis sur le serveur: npm ci && npm run build

12.3. ZÉRO DOWNTIME DEPLOYMENT (Avancé)
─────────────────────────────────────────

Pour minimiser le downtime lors des mises à jour:

1. Créer un dossier de déploiement temporaire
2. Y faire le build
3. Swap atomique avec ln -s
4. Restart

Script exemple:

─────────────────────────────────────────────────────────────────────
#!/bin/bash
cd /home/c2434582c
git clone ... performeplus_frontend_new
cd performeplus_frontend_new
npm ci
npm run build
mv /home/c2434582c/performeplus_frontend /home/c2434582c/performeplus_frontend_old
mv /home/c2434582c/performeplus_frontend_new /home/c2434582c/performeplus_frontend
# Restart via cPanel API ou interface
rm -rf /home/c2434582c/performeplus_frontend_old
─────────────────────────────────────────────────────────────────────

12.4. SURVEILLANCE & MONITORING
─────────────────────────────────

1. Créer un script de health check:
   curl -f https://performeplus.statsmaker73.com || alert

2. Monitorer dans cPanel:
   - CPU usage
   - Memory usage
   - Processes count

3. Logs réguliers:
   tail -f ~/logs/performeplus_frontend_error.log

═══════════════════════════════════════════════════════════════════════════════
CHECKLIST FINALE DE DÉPLOIEMENT
═══════════════════════════════════════════════════════════════════════════════

Backend Django déployé et fonctionnel ✓
Sous-domaine performeplus.statsmaker73.com créé ✓
SSL/HTTPS actif et forcé ✓
Code uploadé dans /home/c2434582c/performeplus_frontend ✓
.env.production créé avec NEXT_PUBLIC_API_URL ✓
Variables d'environnement configurées dans cPanel ✓
npm ci exécuté avec succès ✓
npm run build réussi ✓
Application Node.js démarrée et status "Running" ✓
https://performeplus.statsmaker73.com accessible ✓
Login/Register fonctionnels ✓
Connexion API sans erreurs CORS ✓
Logs vérifiés (pas d'erreurs critiques) ✓

═══════════════════════════════════════════════════════════════════════════════
RESSOURCES & LIENS UTILES
═══════════════════════════════════════════════════════════════════════════════

Documentation Next.js: https://nextjs.org/docs
Documentation cPanel: https://docs.cpanel.net/
Support LWS: https://aide.lws.fr/

Guide backend: ../performeplus/DEPLOY_CPANEL_BACKEND.md

═══════════════════════════════════════════════════════════════════════════════
FIN DU GUIDE - FRONTEND NEXT.JS CPANEL
═══════════════════════════════════════════════════════════════════════════════

Support technique: admin@performeplus.com
Dernière mise à jour: 15 novembre 2025
