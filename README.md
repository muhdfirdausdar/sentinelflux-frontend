# SentinelFlux Frontend - Updated

A modern React application with Netlify Functions for domain analysis and visualization.

## 🔧 Recent Fixes (Dec 8, 2025)

### Search Domain - Multiple Re-render Issue Fixed
**Problem**: Table was rendering 2-3 times when applying filters or changing columns, causing:
- Stale data showing briefly before correct data appears
- Poor user experience with flickering
- Unnecessary API calls

**Root Causes Identified**:
1. `useEffect([fetchData])` was triggering on every state change
2. `fetchData` dependencies caused it to be recreated on each state update
3. `TableControls` applying fields and filters separately caused double fetch
4. React StrictMode causes double renders in development (expected behavior)

**Solutions Implemented**:
1. ✅ Replaced auto-triggering `useEffect` with explicit initial load (runs once on mount)
2. ✅ Added batch handler `handleBatchChange` to apply fields + filters in single fetch
3. ✅ Added change detection in handlers to skip unnecessary fetches
4. ✅ Optimized TableControls to use batch handler when both fields and filters change

**Result**: 
- Page load/refresh: **1 render** (as expected)
- Filter changes: **1 render** (fixed from 2-3)
- Column changes: **1 render** (fixed from 2-3)
- Both changes together: **1 render** (fixed from 3-4)

## 🛠️ Prerequisites & Installation

Before contributing to this project, ensure you have the following installed on your PC:

### Required Software - INSTALL IN PC TERMINAL
1. **Node.js (v18+)** - [Download here](https://nodejs.org/)
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **npm (comes with Node.js)** or **pnpm** (recommended)
   ```bash
   sudo npm install -g pnpm  # Install pnpm globally
   ```

3. **Git** - [Download here](https://git-scm.com/)
   ```bash
   git --version
   ```

4. **Netlify CLI** (for local development)
   ```bash
   sudo npm install -g netlify-cli
   ```


5. **Code Editor** OPTIONAL - VS Code recommended with extensions:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript Importer
   - Prettier - Code formatter

6. **IMPORTANT - IN VSCODE PROJECT DIRECTORY - MUST DO ALL STEP**
** Open Terminal (Inside VSCode) **
a. AT ROOT DIRECTORY - ENTER
    npm install

b. GO TO frontend-react folder, AND DO npm install
    cd frontend-react/
    npm install

DONE

## 🚀 Project Overview

This project consists of two main components:

### 1. **Frontend-React** (`/frontend-react`)
- **Purpose**: Main React application for the user interface
- **Tech Stack**: React 19, TypeScript, Vite, TailwindCSS
- **Features**: Domain analysis dashboard, data visualization, responsive design

### 2. **Netlify Functions** (`/netlify/functions`)
- **Purpose**: Serverless backend functions for API endpoints
- **Tech Stack**: Node.js, Netlify Functions
- **Features**: Session management, data fetching, streaming metrics

## 🎨 Tech Stack & Major Libraries

### Frontend Technologies
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework

### Major UI Libraries
- **Radix UI** - Headless UI primitives
  - `@radix-ui/react-accordion`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-navigation-menu`
- **Lucide React** - Icon library
- **Recharts** - Chart/visualization library
- **Framer Motion** - Animation library
- **GSAP** - Advanced animations
- **D3.js** - Data visualization
- **React Router DOM** - Client-side routing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting (implied)
- **Class Variance Authority** - Component styling utility

### Responsive Design
- **Breakpoints** (as per `note.txt`):
  - `md` and above: Tablet and Desktop
  - Below `md`: Mobile phones
  - `lg` and above: Desktop

## 🏃‍♂️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/sentinel-crew/sentinelflux-frontend.git
cd sentinelflux-frontend
```

### 2. Install Dependencies

**For the main project:**
```bash
npm install
```

**For the React frontend:**
```bash
cd frontend-react
pnpm install  # or npm install
```

### 3. Development Setup

**Important: You need to run BOTH services for full functionality**

#### Step 1: Start Netlify Functions (Required)
First, start the Netlify development server to enable API functions:
```bash
# From the root directory
netlify dev
```
This will start Netlify functions on `http://localhost:8888`

**⚠️ Do NOT use the Netlify URL for development**

#### Step 2: Start React Development Server
In a **new terminal**, start the React app:
```bash
cd frontend-react
npm run dev  # or pnpm dev
```

#### Step 3: Access the Application
When the React dev server starts, it will provide a URL (typically `http://localhost:5173`).
**Use this React dev server URL for development**, not the Netlify URL.

**Why this setup?**
- Netlify functions run in the background to handle API calls
- React dev server provides hot reloading and better development experience
- Vite proxy configuration automatically routes API calls to Netlify functions

### 4. Available Scripts

**In `/frontend-react` directory:**
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm lint:check   # Check linting without fixing
pnpm clean        # Remove dist folder
pnpm type-check   # TypeScript type checking
```

### 5. Project Structure
```
├── netlify/                 # Netlify configuration & functions
│   └── functions/          # Serverless functions
├── frontend-react/         # Main React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/        # Basic UI components
│   │   │   ├── Layout/    # Layout components
│   │   │   └── common/    # Common utilities
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript definitions
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration
│   │   └── constants/     # App constants
│   ├── public/            # Static assets
│   └── package.json
├── netlify.toml           # Netlify configuration
└── package.json          # Root dependencies
```

## 🌿 Git Workflow & Branching Strategy

### 1. Branch Naming Convention
```bash
# Feature branches
feature/feature-name
feature/add-user-authentication

# Bug fixes
bugfix/bug-description
bugfix/fix-mobile-responsive-issue

# Hotfixes
hotfix/critical-fix-description

# Documentation
docs/update-readme
```

### 2. Creating a New Branch
```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b feature/your-feature-name

# Or use git switch (modern approach)
git switch -c feature/your-feature-name
```

### 3. Making Changes
```bash
# Make your changes, then stage them
git add .

# Commit with descriptive message
git commit -m "feat: add user authentication component"

# Push to remote
git push -u origin feature/your-feature-name
```

## OR JUST USE THE IDE VSCODE TO DO GIT WORK

### 4. Pull Request Process
1. Push your branch to GitHub
2. Create a Pull Request to `main` branch
3. Ensure all checks pass (linting, build)
4. Request review from team members
5. Address feedback if needed
6. Merge after approval

### 5. Commit Message Convention
```bash
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use TailwindCSS for styling
- Maintain responsive design (mobile-first approach)
- Use absolute imports with `@/` alias

### Component Structure
```typescript
// Example component structure
import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface YourComponentProps extends ComponentProps<'div'> {
  // Your props here
}

export function YourComponent({ className, ...props }: YourComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* Component content */}
    </div>
  )
}
```

### File Organization
- Keep components small and focused
- Use custom hooks for complex logic
- Maintain clear separation between UI and business logic
- Use TypeScript interfaces for prop definitions

## 🔌 SearchDomain API Integration

### URL Constructor Module
The SearchDomain module includes a sophisticated URL constructor system for building API endpoints based on field selection, sorting, and filtering.

#### Key Features
- **Dynamic Field Mapping**: Converts UI field names (like 'status_tags') to API fields (like 'dom_status', 'is_malicious', 'flux_type')
- **Flexible Sorting**: Supports multiple column sorting with ascending/descending order
- **Pagination Support**: Built-in offset and limit parameter handling
- **Filter Integration**: Placeholder system for advanced filtering capabilities
- **Type Safety**: Full TypeScript support with proper interfaces

#### Usage Example
```typescript
import { urlConstructor, buildDomainSearchUrl } from '@/pages/SearchDomain/services/urlConstructor';

// Basic field selection
const url = buildDomainSearchUrl({
  fields: ['domain_name', 'status_tags', 'dom_last_seen'],
  limit: 10,
  sort: [{ id: 'dom_last_seen', desc: true }],
  filters: {
    dom_status: 'active',
    is_malicious: true
  }
});

// Output: https://api-sf01.sentinelflux.software/search?limit=10&fields=domain_name,dom_status,is_malicious,flux_type,dom_last_seen&sort=-dom_last_seen&filters.dom_status=active&filters.is_malicious=true
```

#### Integration Flow
1. **Page Load**: Initial URL construction with default parameters
2. **Field Selection**: User clicks Apply → `onFieldsChange()` → New URL with selected fields
3. **Sorting**: User clicks column → `onSortingChange()` → URL with sort parameters
4. **Pagination**: User navigates → `onPageChange()` → URL with offset/limit
5. **Search**: User types → `onSearchChange()` → URL with search query

#### API Integration Class
```typescript
import { SearchApiIntegration } from '@/pages/SearchDomain/services/searchApiIntegration';

const integration = new SearchApiIntegration(
  {
    selectedFields: ['domain_name', 'status_tags'],
    sorting: [],
    searchQuery: '',
    currentPage: 0,
    pageSize: 10
  },
  {
    onUrlChange: (url) => console.log('New API URL:', url),
    onDebugLog: (msg, data) => console.log(msg, data)
  }
);

// Responds to field changes and generates appropriate API URLs
integration.onFieldsChange(['domain_name', 'status_tags', 'num_ips']);
```

#### Field Mapping
The system automatically maps frontend display fields to API fields:
- `status_tags` → `dom_status` + `is_malicious` + `flux_type`
- Other fields map directly (e.g., `domain_name` → `domain_name`)

This ensures the UI can present logical field groupings while the API receives the specific fields it needs.



---

