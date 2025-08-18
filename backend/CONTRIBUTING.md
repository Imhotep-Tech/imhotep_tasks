# Contributing to Imhotep Tasks

First off, thank you for considering contributing to Imhotep Tasks! It's people like you that make Imhotep Tasks such a great tool. We welcome contributions from everyone, whether it's reporting a bug, discussing improvements, submitting fixes, implementing features, or even improving documentation.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.8+
- pip
- Git
- A suitable IDE or code editor

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/imhotep_tasks.git
   cd imhotep_tasks
   ```
3. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Apply migrations:
   ```bash
   python manage.py migrate
   ```
6. Run the development server:
   ```bash
   python manage.py runserver
   ```
7. Visit http://localhost:8000 to view the application

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/issue-you-are-fixing
   ```
2. Make your changes
3. Run tests to ensure your changes don't break existing functionality
4. Commit your changes with a clear, descriptive message
5. Push your branch to GitHub
6. Submit a pull request

## Pull Request Guidelines

When submitting a pull request:
- Include a clear, descriptive title
- Reference any related issues using GitHub's issue linking (e.g., "Fixes #123")
- Provide a detailed description of the changes
- Include screenshots for UI changes if applicable
- Make sure all tests pass
- Follow the existing code style and formatting

## Code Style Guidelines

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Include docstrings for functions and classes
- Comment complex logic or algorithms
- Keep functions small and focused on a single task
- Use Tailwind CSS classes consistently for frontend code

## Testing

Before submitting your changes:
- Run existing tests to make sure they pass
- Add new tests for new functionality
- Check that your code works in different browsers if it includes frontend changes

## Bug Reports and Feature Requests

We use GitHub issues to track bugs and feature requests. When submitting:

- Check if a similar issue already exists
- For bugs, include:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots if applicable
  - Environment details (browser, OS, etc.)
- For feature requests, include:
  - A clear description of the feature
  - The problem it solves
  - Any relevant examples or mockups

## Documentation

If your changes require updates to documentation:
- Update any relevant README files
- Add or update comments and docstrings in the code
- Update user documentation if applicable

## License Considerations

By contributing to Imhotep Tasks, you agree that your contributions will be licensed under the project's AGPL-3.0 License. If you're contributing code for commercial use, please contact us at imhoteptech@outlook.com.

## Code of Conduct

Please note that this project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## Questions?

If you have any questions or need help with the contribution process, feel free to:
- Open an issue with your question
- Email us at imhoteptech@outlook.com

Thank you for your contributions!

The Imhotep Tech Team
