# Complete Technology Stack - Med Clear Care

## 📋 Overview
This document provides a comprehensive list of ALL technologies, libraries, APIs, frameworks, and tools used in the Med Clear Care project.

---

## 🗣️ Programming Languages

### Primary Languages
- **TypeScript** (v5.8.3) - Primary language for type-safe development
- **JavaScript** (ES6+) - Runtime language, used in browser APIs
- **HTML5** - Markup language
- **CSS3** - Styling (via Tailwind CSS)

---

## ⚛️ Core Framework & Build Tools

### Frontend Framework
- **React** (v18.3.1) - UI library
- **React DOM** (v18.3.1) - React rendering for web

### Build Tools & Bundlers
- **Vite** (v5.4.19) - Build tool and dev server
- **@vitejs/plugin-react-swc** (v3.11.0) - React plugin with SWC compiler for faster builds
- **TypeScript Compiler** (tsc) - Type checking and compilation

### Development Tools
- **ESLint** (v9.32.0) - Code linting
- **TypeScript ESLint** (v8.38.0) - TypeScript-specific linting rules
- **PostCSS** (v8.5.6) - CSS processing
- **Autoprefixer** (v10.4.21) - CSS vendor prefixing

---

## 🎨 UI Libraries & Component Frameworks

### Component Libraries
- **shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Headless UI component primitives:
  - `@radix-ui/react-accordion` (v1.2.11)
  - `@radix-ui/react-alert-dialog` (v1.1.14)
  - `@radix-ui/react-aspect-ratio` (v1.1.7)
  - `@radix-ui/react-avatar` (v1.1.10)
  - `@radix-ui/react-checkbox` (v1.3.2)
  - `@radix-ui/react-collapsible` (v1.1.11)
  - `@radix-ui/react-context-menu` (v2.2.15)
  - `@radix-ui/react-dialog` (v1.1.14)
  - `@radix-ui/react-dropdown-menu` (v2.1.15)
  - `@radix-ui/react-hover-card` (v1.1.14)
  - `@radix-ui/react-label` (v2.1.7)
  - `@radix-ui/react-menubar` (v1.1.15)
  - `@radix-ui/react-navigation-menu` (v1.2.13)
  - `@radix-ui/react-popover` (v1.1.14)
  - `@radix-ui/react-progress` (v1.1.7)
  - `@radix-ui/react-radio-group` (v1.3.7)
  - `@radix-ui/react-scroll-area` (v1.2.9)
  - `@radix-ui/react-select` (v2.2.5)
  - `@radix-ui/react-separator` (v1.1.7)
  - `@radix-ui/react-slider` (v1.3.5)
  - `@radix-ui/react-slot` (v1.2.3)
  - `@radix-ui/react-switch` (v1.2.5)
  - `@radix-ui/react-tabs` (v1.1.12)
  - `@radix-ui/react-toast` (v1.2.14)
  - `@radix-ui/react-toggle` (v1.1.9)
  - `@radix-ui/react-toggle-group` (v1.1.10)
  - `@radix-ui/react-tooltip` (v1.2.7)

### Styling
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **tailwindcss-animate** (v1.0.7) - Animation utilities
- **@tailwindcss/typography** (v0.5.16) - Typography plugin
- **class-variance-authority** (v0.7.1) - Component variant management
- **clsx** (v2.1.1) - Conditional className utility
- **tailwind-merge** (v2.6.0) - Merge Tailwind classes intelligently

### Icons
- **lucide-react** (v0.462.0) - Icon library (400+ icons)

---

## 🎭 Animation & Motion

- **Framer Motion** (v12.25.0) - Animation library for React
  - Used for page transitions, component animations, and UI interactions

---

## 🧭 Routing & Navigation

- **React Router DOM** (v6.30.1) - Client-side routing
  - Used for navigation between pages (Scan, History, Inventory, About, Pitch)

---

## 📦 State Management

- **Zustand** (v5.0.9) - Lightweight state management
  - `zustand/middleware` - Persist middleware for localStorage
  - Used for:
    - Game state (points, streak, fish collection, scan history)
    - Inventory state (medicine items, expiry tracking, notifications)

---

## 🤖 AI & Machine Learning

### AI Services & APIs
- **OpenAI GPT-4o** - Primary AI model for:
  - Medicine identification from images (Vision API)
  - Medicine identification from text
  - Disposal method generation
  - Environmental impact assessment
  - Fish type selection based on impact
  - Points calculation for disposal actions
  - Hospital location finding
  - Expiry date extraction from images
  - Video analysis for multiple medicine detection

- **OpenAI GPT-4o-mini** - Faster, cost-effective model for:
  - Text-based medicine identification
  - Disposal information retrieval
  - Location searches

### OCR (Optical Character Recognition)
- **Tesseract.js** (v7.0.0) - Client-side OCR engine
  - Extracts text from medicine package images
  - Runs entirely in the browser (WebAssembly)
  - Supports English language recognition
  - Provides confidence scores for detected text

### AI Integration Details
- **OpenAI Chat Completions API** - REST API for GPT interactions
- **OpenAI Vision API** - Image analysis using GPT-4o Vision
- **JSON Mode** - Structured output for consistent data format
- **Temperature Control** - Fine-tuned for consistent, accurate responses

---

## 🗺️ Location & Maps Services

### APIs (Attempted/Configured)
- **Google Maps Places API** - Hospital/pharmacy location search
  - Note: Currently not used due to CORS restrictions in browser
  - API key configured but falls back to GPT-based search

### Browser APIs
- **Geolocation API** (`navigator.geolocation`) - User location detection
  - Used to find nearby hospitals based on user coordinates
  - Falls back to city-based search if permission denied

---

## 🖼️ Image Processing & Media

### Image Processing
- **HTML Canvas API** - Image manipulation and format conversion
  - Converts PNG/other formats to JPEG for API compatibility
  - Image resizing and format validation
  - Base64 encoding for API transmission

### Image Libraries
- **html-to-image** (v1.11.13) - Convert HTML elements to images
  - Used for generating downloadable disposal reports as PNG
  - `toPng()` function for report export

### Image Sources
- **Unsplash API** - Stock images for:
  - Popular medications (Telfast, Panadol, Adol, etc.)
  - Fish images for aquarium display
  - Medicine package representations

### Video Processing
- **HTML5 Video API** - Video playback and frame extraction
  - Key frame extraction for video analysis
  - Thumbnail generation from video files
  - Video-to-image conversion for AI analysis

---

## 💾 Data Persistence

### Browser Storage
- **localStorage** - Client-side data persistence
  - Game state (points, fish, scan history)
  - Inventory items
  - User preferences
  - Notification settings

### State Persistence
- **Zustand Persist Middleware** - Automatic localStorage sync
  - Persists game state across sessions
  - Persists inventory data
  - Automatic rehydration on app load

---

## 🔔 Browser APIs

### Notifications
- **Web Notifications API** (`Notification`) - Browser notifications
  - Medicine expiry alerts
  - Expiring soon warnings
  - Permission management

### File Handling
- **FileReader API** - File reading and base64 conversion
- **Blob API** - Binary data handling
- **URL.createObjectURL()** - Object URL generation for media

### Media Capture
- **HTML5 Input Capture** - Camera access via file input
  - `capture="environment"` for camera access
  - Image and video capture support

---

## 📡 HTTP & Networking

- **Fetch API** - HTTP requests
  - OpenAI API calls
  - Image fetching from Unsplash
  - External resource loading

---

## 📝 Form Handling & Validation

- **React Hook Form** (v7.61.1) - Form state management
- **@hookform/resolvers** (v3.10.0) - Validation resolvers
- **Zod** (v3.25.76) - Schema validation library

---

## 📅 Date & Time

- **date-fns** (v3.6.0) - Date utility library
  - Date formatting
  - Date calculations
  - Expiry date comparisons

---

## 🎨 Additional UI Components

- **cmdk** (v1.1.1) - Command menu component
- **embla-carousel-react** (v8.6.0) - Carousel component
- **input-otp** (v1.4.2) - OTP input component
- **react-day-picker** (v8.10.1) - Date picker
- **react-resizable-panels** (v2.1.9) - Resizable panel layouts
- **recharts** (v2.15.4) - Chart library (if used for analytics)
- **sonner** (v1.7.4) - Toast notification library
- **vaul** (v0.9.9) - Drawer component
- **next-themes** (v0.3.0) - Theme management (dark/light mode support)

---

## 🔧 Development & Build Tools

### Type Definitions
- **@types/node** (v22.16.5) - Node.js type definitions
- **@types/react** (v18.3.23) - React type definitions
- **@types/react-dom** (v18.3.7) - React DOM type definitions

### Code Quality
- **ESLint Plugins**:
  - `eslint-plugin-react-hooks` (v5.2.0)
  - `eslint-plugin-react-refresh` (v0.4.20)

### Build Configuration
- **TypeScript Config** - Multiple config files:
  - `tsconfig.json` - Base configuration
  - `tsconfig.app.json` - App-specific config
  - `tsconfig.node.json` - Node-specific config

---

## 🌐 External Services & APIs

### AI Services
- **OpenAI Platform** - AI model provider
  - API Endpoint: `https://api.openai.com/v1/chat/completions`
  - Models Used: `gpt-4o`, `gpt-4o-mini`
  - Features: Chat completions, Vision API, JSON mode

### Image Services
- **Unsplash** - Stock photography service
  - Endpoint: `https://images.unsplash.com/`
  - Endpoint: `https://source.unsplash.com/`
  - Used for medicine and fish images

### Font Services
- **Google Fonts** - Web font hosting
  - Font: Plus Jakarta Sans
  - Endpoint: `https://fonts.googleapis.com/css2`

### Maps Services (Configured but not actively used)
- **Google Maps Places API** - Location search
  - Endpoint: `https://maps.googleapis.com/maps/api/place`
  - Note: CORS restrictions prevent direct browser usage

---

## 🔐 Environment & Configuration

### Environment Variables
- **Vite Environment Variables**:
  - `VITE_OPENAI_API_KEY` - OpenAI API authentication
  - `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (configured)

### Configuration Files
- `.env` - Environment variables (API keys)
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui component configuration
- `package.json` - NPM dependencies and scripts

---

## 📚 Data Structures & Types

### Custom Type Definitions
- **TypeScript Interfaces**:
  - `MedicineInfo` - Medicine data structure
  - `DisposalMethod` - Disposal instruction format
  - `Fish` - Fish collection item
  - `ScanRecord` - Scan history entry
  - `InventoryItem` - Inventory medicine entry

---

## 🎮 Game Mechanics & Gamification

### Game Features
- **Points System** - Dynamic point calculation based on:
  - Environmental impact level
  - Disposal method chosen
  - Medicine type (antibiotic, controlled, etc.)
  - AI-calculated rewards

- **Streak System** - Consecutive disposal tracking

- **Fish Collection** - Environmental impact representation
  - 13 different fish types (mackerel to whale)
  - Impact-based fish selection via AI
  - Visual aquarium display

- **Achievements** - Milestone tracking

---

## 📱 Responsive Design

- **Mobile-First Design** - Tailwind CSS responsive utilities
- **Breakpoint System** - sm, md, lg, xl, 2xl
- **Touch-Friendly UI** - Optimized for mobile interactions

---

## 🔍 Search & Data Processing

### Text Processing
- **String Matching** - Medicine name matching
- **Pattern Recognition** - OCR text analysis
- **Date Parsing** - Expiry date extraction

### Video Analysis
- **Key Frame Extraction** - Intelligent frame sampling
- **Multi-Frame Analysis** - Batch processing for video scans
- **Thumbnail Generation** - Video preview images

---

## 🛠️ Utility Libraries

- **class-variance-authority** - Component variant management
- **clsx** - Conditional class names
- **tailwind-merge** - Tailwind class merging
- **date-fns** - Date manipulation utilities

---

## 📦 Package Management

- **npm** - Node package manager
- **package-lock.json** - Dependency lock file

---

## 🚀 Deployment & Hosting

### Development
- **Vite Dev Server** - Local development server
  - Port: 8080
  - HMR (Hot Module Replacement)
  - Fast refresh

### Build Output
- **Static Site Generation** - Vite build produces static assets
- **Production Build** - Optimized bundle for deployment

---

## 🔒 Security Features

- **Environment Variable Protection** - API keys in `.env`
- **CORS Handling** - Proper error handling for cross-origin requests
- **Input Validation** - Zod schema validation
- **Error Boundaries** - Graceful error handling

---

## 📊 Data Flow & Architecture

### State Management Pattern
- **Zustand Stores**:
  - `gameStore` - Game state, points, fish, scan history
  - `inventoryStore` - Medicine inventory, expiry tracking

### Service Layer
- `openai.ts` - All AI/OpenAI interactions
- `ocr.ts` - OCR text extraction
- `googleMaps.ts` - Location services (configured)

### Component Architecture
- **Functional Components** - React hooks-based
- **Custom Hooks** - Reusable logic (`use-toast`, `use-mobile`)
- **UI Components** - shadcn/ui component library
- **Page Components** - Route-based pages

---

## 🌍 Internationalization (Future)

- **English Language** - Currently English-only
- **Date Formatting** - Locale-aware date handling via date-fns

---

## 📝 Note on Kaggle & Teachable Machine

**Kaggle Datasets**: Not currently used in this project. The application relies on:
- Real-time AI analysis via OpenAI GPT models
- OCR text extraction from user-uploaded images
- Dynamic data generation rather than pre-trained datasets

**Teachable Machine**: Not used in this project. The application uses:
- OpenAI's pre-trained GPT models for medicine identification
- Tesseract.js for OCR (pre-trained English model)
- No custom machine learning model training required

---

## 📈 Performance Optimizations

- **Code Splitting** - Vite automatic code splitting
- **Lazy Loading** - Dynamic imports for heavy components
- **Image Optimization** - Canvas-based format conversion
- **Worker Threads** - Tesseract.js runs in Web Worker
- **Memoization** - React memo and useMemo for expensive operations
- **Debouncing** - Input debouncing for search/validation

---

## 🧪 Testing & Quality Assurance

- **TypeScript** - Static type checking
- **ESLint** - Code quality and style enforcement
- **Error Handling** - Comprehensive try-catch blocks
- **Fallback Mechanisms** - Graceful degradation on API failures

---

## 📄 Documentation

- **README.md** - Project documentation
- **AI_MIGRATION_SUMMARY.md** - AI integration details
- **SECURITY_WARNING.md** - Security best practices
- **TECHNOLOGY_STACK.md** - This document

---

## 🔄 Version Control

- **Git** - Version control system
- **GitHub** - Repository hosting (implied from README)

---

## 📱 Browser Compatibility

### Supported Features
- **Modern Browsers** - Chrome, Firefox, Safari, Edge (latest versions)
- **WebAssembly** - Required for Tesseract.js OCR
- **ES6+ Features** - Modern JavaScript features
- **CSS Grid & Flexbox** - Modern layout features
- **Fetch API** - Modern HTTP client
- **localStorage** - Client-side storage

---

## 🎯 Summary

This project is a **modern, AI-powered web application** built with:
- **React + TypeScript** for type-safe UI development
- **OpenAI GPT-4o** for intelligent medicine identification and guidance
- **Tesseract.js** for client-side OCR
- **Zustand** for lightweight state management
- **Tailwind CSS + shadcn/ui** for beautiful, responsive UI
- **Framer Motion** for smooth animations
- **Browser APIs** for notifications, geolocation, and media handling

The application does **NOT** use:
- ❌ Kaggle datasets
- ❌ Teachable Machine
- ❌ Custom ML model training
- ❌ Backend server (fully client-side)

Instead, it leverages:
- ✅ Pre-trained AI models (OpenAI GPT)
- ✅ Pre-trained OCR models (Tesseract.js)
- ✅ Real-time AI analysis
- ✅ Dynamic data generation

---

*Last Updated: Based on current codebase analysis*
*Total Dependencies: 60+ npm packages*
*Total Technologies: 100+ tools, libraries, APIs, and services*

