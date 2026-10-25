# SentinelFlux Frontend

A React application with Netlify Functions for domain analysis and visualization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Install dependencies**
   ```bash
   cd frontend-react
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   
3. **Start Netlify functions locally** (in another terminal)
   ```bash
   # From the root directory
   netlify dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
frontend-react/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # Basic UI components (Button, Loading, etc.)
│   │   ├── common/         # Common components (ErrorBoundary, etc.)
│   │   └── ...
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   ├── utils/              # Utility functions
│   ├── constants/          # App constants
│   ├── config/             # Configuration files
│   └── assets/             # Static assets
├── public/                 # Public assets
└── ...
```

## 🛠️ Development Guidelines

### Code Organization
- **Components**: Break down into small, reusable pieces
- **Hooks**: Extract logic into custom hooks when reusable
- **Services**: Keep API calls in service layer
- **Constants**: Define app-wide constants in one place
- **Utils**: Pure functions for common operations

### Best Practices
- Use TypeScript for better type safety (recommended)
- Follow React hooks best practices
- Use CSS modules for component styling
- Implement proper error handling
- Add loading states for async operations

### API Integration
- All API calls go through the `apiService`
- Use the `useApi` hook for standard API calls
- Environment variables for different configurations

## 🎨 Styling
- CSS Modules for component-specific styles
- Global styles in `src/assets/styles/`
- Consistent naming conventions

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix code
- `npm run lint:check` - Check linting without fixes

## 🌐 Deployment

The app is configured for Netlify deployment:

1. **Build settings** are in `netlify.toml`
2. **Functions** are in the `netlify/functions/` directory
3. **Environment variables** should be set in Netlify dashboard

## 📝 Environment Variables

Create `.env.local` for local development:

```env
VITE_API_BASE_URL=http://localhost:8888/.netlify/functions
VITE_APP_NAME=SentinelFlux
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Follow the existing code structure
2. Use meaningful component and variable names
3. Add error handling for user-facing features
4. Test your changes before submitting
5. Update this README if you add new features

## 🔧 Troubleshooting

### Common Issues

1. **API calls failing**: Make sure Netlify dev is running
2. **Styling issues**: Check CSS module imports
3. **Build errors**: Run `npm run lint` to check for issues

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Use the Network tab to debug API calls
- Enable React Strict Mode for catching issues early+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
