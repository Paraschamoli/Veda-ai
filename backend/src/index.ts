import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, dbService } from './config/db';
import { initQueue, getQueue } from './config/queue';
import { initWebSocket } from './config/websocket';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Middleware
app.use(cors());
app.use(express.json());

// Initialize Database & Background Queue & WebSockets
connectDB();
initQueue();
initWebSocket(server);

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', environment: process.env.NODE_ENV || 'development' });
});

// List all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const list = await dbService.listAssignments();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed assignment
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const item = await dbService.getAssignment(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new assignment and dispatch job
app.post('/api/assignments', async (req, res) => {
  try {
    const { title, subject, dueDate, questionTypes, additionalInstructions } = req.body;

    // Basic Validation
    if (!title || !subject || !dueDate || !questionTypes || !Array.isArray(questionTypes)) {
      return res.status(400).json({ error: 'Missing required assignment fields' });
    }

    // Map initial structure to DB format
    // In progress state, sections are mapped with placeholders for counts
    const initialSections = questionTypes.map((qt: any) => {
      // Create empty mock questions based on count to represent the initial state
      const questionsArray = Array.from({ length: parseInt(qt.count) || 1 }).map(() => ({
        text: 'Generating text...',
        difficulty: 'Medium' as const,
        marks: parseInt(qt.marks) || 1
      }));

      return {
        title: qt.name, // e.g. "Multiple Choice Questions"
        instruction: `Answer the questions of type: ${qt.name}`,
        questions: questionsArray
      };
    });

    const initialAssignmentData = {
      title,
      subject,
      dueDate,
      status: 'pending',
      progress: 0,
      progressText: 'Job queued',
      totalQuestions: questionTypes.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0),
      totalMarks: questionTypes.reduce((acc, curr) => acc + ((parseInt(curr.count) || 0) * (parseInt(curr.marks) || 0)), 0),
      additionalInstructions: additionalInstructions || '',
      sections: initialSections
    };

    // Save to Database
    const savedAssignment = await dbService.saveAssignment(initialAssignmentData);
    const assignmentId = savedAssignment._id.toString();

    // Push task into Queue
    const queue = getQueue();
    await queue.add('generate-questions', { assignmentId });

    res.status(201).json(savedAssignment);

  } catch (error: any) {
    console.error('API Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`📡 VedaAI API Server running on port ${PORT}`);
});
