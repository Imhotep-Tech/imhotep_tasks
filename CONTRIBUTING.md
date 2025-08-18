# Contributing to Imhotep Tasks

Thank you for contributing to Imhotep Tasks. Your help improves the app for everyone — whether you're fixing bugs, improving docs, or adding features.

## Getting Started

### Prerequisites
- Git
- Docker & Docker Compose (recommended for full-stack dev)
- Python 3.11+ (for backend work)
- Node 18+ and npm or pnpm (for frontend work)
- A code editor (VS Code recommended)

### Local development (recommended using Docker)
The repository includes services for the Django backend, React (Vite) frontend and Postgres database. To run everything locally:

```bash
# from repository root
docker compose up --build
```

This will start the backend at http://localhost:8000 and the frontend at http://localhost:3000.

If you prefer to run services separately, see the Backend and Frontend sections below.

### Backend (Django) - manual
```bash
cd backend/imhotep_tasks
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# create .env file with required env vars (see README)
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

### Frontend (React + Vite) - manual
```bash
cd frontend/imhotep_tasks
npm install
# set VITE_API_URL in .env to http://localhost:8000
npm run dev
```

## Workflow

1. Fork the repository and clone your fork.
2. Create a feature branch: `git checkout -b feature/short-desc` or `fix/short-desc`.
3. Make small, focused commits with clear messages.
4. Run tests and linters locally.
5. Push your branch and open a Pull Request against `main`.

## Pull Request Guidelines
- Include a clear title and description.
- Reference related issues (e.g. `Fixes #123`).
- Describe what changed and why.
- Ensure all tests pass and CI checks are green.
- Add screenshots for UI changes when relevant.

## Code Style
- Backend: follow PEP 8. Use `black` where applicable.
- Frontend: follow consistent eslint rules (project config). Prefer functional components and hooks.
- Keep functions small and single-responsibility. Add docstrings for complex logic.

## Tests
- Add or update tests for any behavior you change.
- Backend tests: Django test runner (e.g. `python manage.py test`).
- Frontend tests: follow project test setup (Jest/React Testing Library if present).

## Commit Messages
Use clear, present-tense messages. Examples:
- `Add recurring task scheduler`
- `Fix race condition in routine manager`
- `Update README to include Docker usage`

## Areas for Contribution
- Bug fixes and test coverage
- UI/UX improvements and accessibility
- Performance optimizations
- Security hardening and dependency updates
- Documentation and examples

## Reporting Issues
When opening issues, include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Docker vs local)
- Logs or stack traces if available

## License for Contributions
By contributing, you agree your contributions are licensed under the project's AGPL-3.0 License (see `LICENSE`). If you need to contribute under a different agreement, contact imhoteptech@outlook.com.

Thank you for improving Imhotep Tasks!
