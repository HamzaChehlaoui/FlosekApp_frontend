# 🎯 Flosek - Comprehensive Financial Management Application

<div align="center">

[![Angular](https://img.shields.io/badge/Angular-19.2-red?style=flat-square&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-19+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**An advanced web application for managing budgets, expenses, salaries, and savings goals**

[Features](#-features) • [Installation](#-installation--setup) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## 📋 About the Project

**Flosek** is a modern and comprehensive web application built with **Angular 19** that provides an integrated solution for managing your financial affairs. It enables you to track expenses, manage budgets, analyze reports, and set savings goals with ease.

The application supports **three languages** (English, Arabic, and French) and provides an intuitive and reliable user interface.

---

## ✨ Features

- 🔐 **Authentication & Security**
  - Login and registration
  - Password reset
  - Google authentication
  - Session verification guards

- 💰 **Budget Management**
  - Create and update budgets
  - Track spending categories
  - Monitor expenditures

- 📊 **Expense Tracking**
  - Easy expense entry
  - Categorize expenses
  - View comprehensive expense lists

- 📈 **Reports & Analytics**
  - Comprehensive dashboard
  - Export reports
  - Advanced charts and analytics

- 💼 **Salary Management**
  - View salary history
  - Review current salary
  - Analyze monthly salary

- 🎯 **Savings Goals**
  - Set savings goals
  - Track progress
  - Achieve financial targets

- ⚙️ **Settings & Customization**
  - Change language (Arabic, English, French)
  - Update user information
  - Manage user profile

- 📱 **Responsive Design**
  - Works on all devices
  - Support for smartphones and tablets

- 📑 **PDF Export**
  - Convert reports to PDF
  - Support for Arabic text

---

## 🛠️ Requirements & Technologies

| Technology | Version |
|-----------|---------|
| Node.js | v19.0+ |
| npm | v9.0+ |
| Angular | 19.2.19 |
| TypeScript | 5.7.2 |
| RxJS | 7.8.0 |

### Key Libraries
- **@angular/forms** - Form handling
- **@ngx-translate** - Multi-language support
- **jspdf & jspdf-autotable** - PDF export
- **arabic-reshaper** - Arabic text support

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd flosek_frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. View Environment Variables
```bash
# For development
cat src/environments/environment.ts

# For production
cat src/environments/environment.prod.ts
```

---

## ▶️ Getting Started

### Start the Development Server
```bash
npm start
# or
ng serve
```

The application will automatically open at:
```
http://localhost:4200/
```

The app will automatically reload whenever you modify any source files.

### Run with Custom Options
```bash
# Run on a custom port
ng serve --port 3000

# Run with performance optimizations
ng serve --aot
```

---

## 🏗️ Building & Compilation

### Build for Production
```bash
npm run build
# or
ng build
```

Build artifacts will be stored in the `dist/` directory.

### Build with Watch Mode
```bash
npm run watch
# or
ng build --watch --configuration development
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
# or
ng test
```

Uses **Karma** and **Jasmine** for testing.

### Run Tests with Coverage
```bash
ng test --code-coverage
```

---

## 📁 Project Structure

```
flosek_frontend/
├── src/
│   ├── app/
│   │   ├── core/                 # Core services, guards, and models
│   │   │   ├── components/       # Core components (Header)
│   │   │   ├── guards/           # Route guards (Auth Guard)
│   │   │   ├── interceptors/     # Interceptors (Auth, Error)
│   │   │   ├── models/           # Data models
│   │   │   └── services/         # Core services
│   │   │
│   │   ├── features/             # Application features
│   │   │   ├── auth/             # Authentication (Login, Register)
│   │   │   ├── home/             # Home page and profile
│   │   │   ├── budget/           # Budget management
│   │   │   ├── expenses/         # Expense tracking
│   │   │   ├── salary/           # Salary management
│   │   │   ├── savings/          # Savings goals
│   │   │   ├── reports/          # Reports and analytics
│   │   │   └── settings/         # Settings
│   │   │
│   │   ├── shared/               # Shared components
│   │   ├── app.config.ts         # Application configuration
│   │   ├── app.routes.ts         # Main routes
│   │   └── app.component.ts      # Root component
│   │
│   ├── environments/             # Environment variables
│   ├── index.html                # Main HTML file
│   ├── main.ts                   # Application entry point
│   └── styles.scss               # Global styles
│
├── public/
│   └── i18n/                     # Translation files
│       ├── ar.json               # Arabic
│       ├── en.json               # English
│       └── fr.json               # French
│
├── angular.json                  # Angular CLI configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file

```

---

## 🔧 Project Architecture

### Architecture Pattern
- **Standalone Components** - Angular standalone components
- **Routing Module** - Advanced route management
- **Interceptors** - Request and error handling
- **Guards** - Route protection

### Key Services
- `AuthService` - Authentication handling
- `BudgetService` - Budget management
- `ExpenseService` - Expense tracking
- `ReportService` - Report generation
- `SalaryService` - Salary management
- `LanguageService` - Multi-language support

---

## 🌍 Supported Languages

The application supports three languages:
- 🇸🇦 **Arabic** (ar)
- 🇬🇧 **English** (en)
- 🇫🇷 **French** (fr)

You can change the language from the user profile settings or application settings.

---

## 📦 Environment Variables

Check the environment files:
- `src/environments/environment.ts` - Development
- `src/environments/environment.prod.ts` - Production

You can update API endpoints and settings there.

---

## 🤝 Contributing

We welcome your contributions! Follow these steps:

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Write code** following coding standards
4. **Add tests** for new features
5. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
6. **Push** to your branch (`git push origin feature/AmazingFeature`)
7. **Open a Pull Request**

### Coding Standards
- Use **camelCase** for variable and function names
- Use **PascalCase** for class and component names
- Add **JSDoc comments** for important functions
- Follow the **Angular style guide**

---

## 🐛 Troubleshooting

If you encounter any issues:

1. Ensure **Node.js v19+** is installed
2. Delete `node_modules` and `package-lock.json`, then reinstall
3. Clear cache: `ng cache clean`
4. Ensure port 4200 is available

### Common Issues

**Issue: Installation errors**
```bash
npm install --legacy-peer-deps
```

**Issue: Server won't start**
```bash
# Clear temporary files
rm -rf .angular/cache node_modules
npm install
npm start
```

---

## 📚 Helpful Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular CLI Guide](https://angular.io/cli)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)
- [NGX-Translate](https://github.com/ngx-translate/core)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Team & Developers

This project was developed by a specialized team in modern web application development.

---

## 📞 Contact & Support

For questions and support, please:
- Open an **Issue** on the repository
- Contact via email
- Check the **Wiki** for more information

---

## 📝 Changelog

### Version 0.0.1
- Alpha release launched
- Core features implemented
- Multi-language support

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open in browser
# http://localhost:4200/

# Build for production
npm run build
```

---

<div align="center">

**Made with ❤️ using Angular and TypeScript**

Copyright © 2024. All rights reserved.

</div>

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
