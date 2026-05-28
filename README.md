# VedaAI - Assignment Generator

AI-powered assignment creation platform that generates professional exam papers using AI or procedural generation methods.

## Architecture Overview

### Backend (Node.js/Express/TypeScript)

**Technology Stack:**
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB (with JSON file fallback)
- **Queue:** BullMQ with Redis (with in-memory fallback)
- **Real-time:** WebSocket (ws)
- **AI Integration:** OpenRouter API (with procedural fallback)

**Architecture Components:**

1. **API Server** (`src/index.ts`)
   - RESTful endpoints for assignment CRUD operations
   - CORS-enabled for frontend communication
   - HTTP server with WebSocket upgrade handling

2. **Database Layer** (`src/config/db.ts`)
   - MongoDB connection with Mongoose ODM
   - Graceful fallback to local JSON file storage
   - Unified service interface abstracting storage implementation
   - Automatic data directory creation for fallback mode

3. **Queue System** (`src/config/queue.ts`)
   - BullMQ for job queue management
   - Redis connection with automatic fallback
   - In-memory queue implementation for development
   - Job dispatching for asynchronous assignment generation

4. **WebSocket Server** (`src/config/websocket.ts`)
   - Real-time progress updates to clients
   - Broadcast mechanism for multi-client support
   - Connection lifecycle management
   - Status message streaming

5. **Generation Worker** (`src/workers/generation.worker.ts`)
   - Background job processing for assignment generation
   - OpenRouter AI API integration (GPT model)
   - High-fidelity procedural fallback with subject-specific question banks
   - Multi-stage progress reporting (initialization → AI dispatch → formatting → completion)
   - Error handling with automatic fallback mechanisms

6. **Data Models** (`src/models/assignment.model.ts`)
   - Mongoose schema for assignments
   - Nested structure: Assignment → Sections → Questions
   - Question types: MCQ, Short Questions, Diagram-based, Numerical Problems
   - Difficulty levels: Easy, Medium, Hard
   - Status tracking: pending → generating → completed/failed

### Frontend (Next.js 14/React/TypeScript)

**Technology Stack:**
- **Framework:** Next.js 14 with App Router
- **UI Library:** React with TypeScript
- **State Management:** Zustand
- **Icons:** Lucide React
- **Styling:** CSS with custom design system

**Architecture Components:**

1. **Main Application** (`src/app/page.tsx`)
   - Multi-step wizard workflow (Form → Loading → Output)
   - Assignment creation form with validation
   - Real-time progress tracking via WebSocket
   - Generated exam sheet display with print functionality

2. **State Management** (`src/store/assignmentStore.ts`)
   - Zustand store for global state
   - Form state: title, subject, due date, question types, instructions
   - UI state: active step, progress, validation errors
   - WebSocket connection management
   - Validation logic for form fields and question types

3. **Styling System** (`src/app/globals.css`)
   - Custom design tokens (colors, fonts, shadows)
   - Glassmorphism UI with backdrop filters
   - Responsive grid layouts
   - Print-specific styles for exam sheets
   - Animation keyframes for micro-interactions

## Approach

### Backend Approach

**Resilient Architecture:**
- Implements graceful degradation for external dependencies
- MongoDB connection fails → JSON file storage
- Redis unavailable → In-memory queue
- OpenRouter API fails → Procedural generation
- Ensures system works in development without full infrastructure

**Job Queue Pattern:**
- Asynchronous assignment generation prevents API blocking
- Progress updates via WebSocket keep users informed
- Worker processes jobs independently of API server
- Scalable architecture for concurrent generation requests

**Dual Generation Strategy:**
1. **AI Generation:** Uses OpenRouter API with GPT model for intelligent question generation
2. **Procedural Fallback:** Subject-specific question banks with predefined templates
   - Physics, Chemistry, Math, Computer Science question databases
   - Automatic question cycling for larger assignments
   - Difficulty distribution algorithm
   - MCQ options and numerical problem templates

### Frontend Approach

**Multi-Step Wizard:**
- Step 1: Assignment details configuration
- Step 2: AI generation progress visualization
- Step 3: Generated exam sheet review and print

**Form Validation:**
- Real-time validation with error messaging
- Prevents negative/zero values for question counts and marks
- Required field validation
- User-friendly error display

**Real-Time Updates:**
- WebSocket connection for live progress tracking
- Circular progress indicator with percentage
- Dynamic status text updates
- Automatic transition to completion state

**User Experience:**
- Drag-and-drop file upload for reference materials
- Voice dictation simulation for additional instructions
- Question type configurator with add/remove functionality
- Print-optimized exam sheet layout
- Responsive design for various screen sizes

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB (optional - falls back to JSON storage)
- Redis (optional - falls back to in-memory queue)
- OpenRouter API key (optional - falls back to procedural generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignment
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (backend + frontend)
   npm run install:all
   
   # Or install separately
   cd backend && npm install
   cd frontend && npm install
   ```

3. **Configure environment variables**

   Backend (create `backend/.env`):
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/veda-ai
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
   
   Use `backend/.env.example` as a template.

4. **Start MongoDB** (optional)
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install locally
   # MongoDB will fall back to JSON storage if not available
   ```

5. **Start Redis** (optional)
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 --name redis redis:latest
   
   # Or install locally
   # Redis will fall back to in-memory queue if not available
   ```

### Running the Application

**Option 1: Run both servers together**
```bash
npm run dev
```

**Option 2: Run servers separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### Development Workflow

1. Open frontend in browser (http://localhost:3000)
2. Fill in assignment details:
   - Subject/Course selection
   - Assignment title
   - Due date
   - Question types with counts and marks
   - Additional instructions (optional)
3. Upload reference materials (optional)
4. Click "Continue" to submit
5. Watch real-time generation progress
6. Review generated exam sheet
7. Print or create new assignment

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/assignments` - List all assignments
- `GET /api/assignments/:id` - Get specific assignment
- `POST /api/assignments` - Create new assignment

### WebSocket Events

- `PROGRESS` - Generation progress update
- `COMPLETED` - Assignment generation finished
- `FAILED` - Generation failed with error
- `STATUS` - Connection status message

### Troubleshooting

**MongoDB Connection Failed:**
- System automatically falls back to JSON file storage
- Check MongoDB is running if you prefer database storage
- Verify MONGODB_URI in .env file

**Redis Connection Refused:**
- System automatically uses in-memory queue
- Redis is optional for development
- Check Redis is running if you need distributed queue

**OpenRouter API Errors:**
- System falls back to procedural generation
- Verify OPENROUTER_API_KEY is valid
- Check API quota and rate limits

**Frontend Cannot Connect to Backend:**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify firewall settings

### Production Deployment

1. Set up MongoDB and Redis instances
2. Configure production environment variables
3. Build frontend: `cd frontend && npm run build`
4. Build backend: `cd backend && npm run build`
5. Use process manager (PM2) for backend
6. Deploy frontend to Vercel/Netlify or serve with backend
7. Configure reverse proxy (nginx) if needed
8. Enable HTTPS for production

### License

Proprietary - VedaAI Assignment Generator
#   V e d a - a i  
 