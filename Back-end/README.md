# Back-end (E-Store)

Quick start (Windows PowerShell):

1. Install dependencies
```powershell
cd "z:\BCA\S5\Arjun\React_Project\Back-end"
npm install
```

2. Create `.env` from `.env.example` and fill values

3. Create database and import schema
```powershell
mysql -u root -p
# then inside mysql: CREATE DATABASE IF NOT EXISTS estore;
exit
mysql -u root -p estore < "z:\BCA\S5\Arjun\React_Project\Back-end\schema.sql"
```

4. Start server
```powershell
# dev (auto-reload)
npm run dev
# or production
npm start
```

API health check: `http://localhost:5000/api/health`

Notes:
- Ensure the `uploads` folder exists (created). It stores uploaded product images.
- Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000` (see `Front-end/vite.config.js`).
