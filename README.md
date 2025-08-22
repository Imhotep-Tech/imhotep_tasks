# Imhotep Tasks ✅

<div align="center">
  <img src="./static/imhotep_tasks.png" alt="Imhotep Tasks Logo" width="120">
  <br>
  <h3>Streamline Your Productivity, Simplify Your Life</h3>
</div>

## 🚀 Overview

Imhotep Tasks is a modern task management system built with a Django backend and a React frontend. The app provides task and routine management, authentication, and desktop builds via Electron. This repository is configured to run the full stack using Docker and Docker Compose for a consistent development and deployment workflow.

## ✨ Features

- Task Management — Create, organize, and track tasks with categories and priorities
- Routine Management — Automated routine-based task creation
- Deadline Management — Set due dates and reminders
- User Authentication — Secure email/password and social logins (configurable)
- Responsive React frontend with PWA support
- Containerized (Docker) development & production-ready setup

## 🖥️ Platform Support

- Web App (React + Django)
- Desktop apps (Electron)
- Progressive Web App (installable on supported browsers)

## 🚀 Quick Start (Docker)

The fastest way to run the full application is with Docker Compose. This will start the Django API, the React frontend, and a PostgreSQL database.

Prerequisites:
- Docker
- Docker Compose

From the repository root run:

```bash
docker compose up --build
```

This will:
- Build and run the Django backend (http://localhost:8000)
- Build and run the React frontend (http://localhost:3000)
- Start a PostgreSQL database (port 5432)

To stop the stack:

```bash
docker compose down
```

View logs:

```bash
docker compose logs -f
```

Rebuild after dependency changes:

```bash
docker compose up --build
```

## 🔧 Environment (example)

Create environment files for the services if your setup requires them. Example values (use secure values in production):

# Backend (.env.backend)
DEBUG=True
SECRET_KEY='replace-with-secure-secret'
DATABASE_NAME='imhotep_tasks_db'
DATABASE_USER='imhotep_tasks_user'
DATABASE_PASSWORD='imhotep_tasks_password'
DATABASE_HOST='db'
DATABASE_PORT=5432

# Frontend (.env.frontend or use Vite .env)
VITE_API_URL=http://localhost:8000

Adjust your docker-compose.yml and service config to load these files as needed.

## 📝 Development (manual)

If you prefer to run services without Docker during development, follow the steps below.

### Backend (Django)

Prerequisites: Python 3.11+, pip, virtualenv

```bash
# from repository root
cd backend/imhotep_tasks
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# create .env file or set env vars as described above
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

The API will be available at http://localhost:8000

### Frontend (React + Vite)

Prerequisites: Node 18+/npm or pnpm

```bash
cd frontend/imhotep_tasks
npm install
# set VITE_API_URL in .env to http://localhost:8000
npm run dev
```

The frontend dev server will be available at http://localhost:3000 (or the port Vite reports).

## 📱 Progressive Web App

The React frontend includes PWA support (service worker + manifest). When visiting the site in a supported browser you'll be able to install the app for offline access.

## 🔮 Production

For production deploys use the Docker Compose stack with environment variables set for production (DEBUG=False, secure SECRET_KEY, proper database, allowed hosts). Optionally add a reverse proxy (Nginx) and TLS termination.

## 🌐 Access Points

| Service | URL |
|--------:|:----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Django Admin | http://localhost:8000/admin/ |
| Database (Postgres) | localhost:5432 |

## 🔧 Troubleshooting

Port conflicts (common):

```bash
# check processes using ports
sudo lsof -i :3000  # frontend
sudo lsof -i :8000  # backend
sudo lsof -i :5432  # database
```

Kill or reconfigure any processes that conflict with these ports.

## 🤝 Contributing

Contributions are welcome. Please read `CODE_OF_CONDUCT.md` and `SECURITY.md` before submitting issues or pull requests.

## 📄 License

This project is available under the AGPL-3.0 License. See the `LICENSE` file for details.

---

<div align="center">
  <p>Designed with ❤️ by Imhotep Tech</p>
  <p>
    <a href="https://github.com/Imhotep-Tech">GitHub</a> •
    <a href="https://x.com/Imhoteptech1">Twitter</a> •
    <a href="https://www.instagram.com/imhotep_tech">Instagram</a>
  </p>
</div>

