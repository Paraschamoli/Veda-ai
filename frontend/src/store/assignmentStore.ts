import { create } from 'zustand';

export interface QuestionType {
  name: string;
  count: number;
  marks: number;
}

export interface AssignmentState {
  // Form State
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  
  // App UI State
  activeStep: number; // 1 = Form, 2 = Loading/Progress, 3 = Exam View
  progress: number;
  progressText: string;
  currentAssignmentId: string | null;
  generatedAssignment: any | null;
  isVoiceActive: boolean;
  validationErrors: Record<string, string>;

  // Actions
  setTitle: (title: string) => void;
  setSubject: (subject: string) => void;
  setDueDate: (date: string) => void;
  setAdditionalInstructions: (instr: string) => void;
  setVoiceActive: (active: boolean) => void;
  
  // Question Type Actions
  addQuestionType: (name: string) => void;
  removeQuestionType: (name: string) => void;
  updateQuestionCount: (name: string, delta: number) => void;
  updateQuestionMarks: (name: string, delta: number) => void;
  
  // UI Flow Actions
  setStep: (step: number) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  validateQuestionTypes: () => Record<string, string>;
  
  // Async Generation Pipeline
  submitAssignment: () => Promise<void>;
  connectWebSocket: (assignmentId: string) => void;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  title: '',
  subject: 'Physics',
  dueDate: '',
  questionTypes: [
    { name: 'Multiple Choice Questions', count: 4, marks: 1 },
    { name: 'Short Questions', count: 3, marks: 2 },
    { name: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { name: 'Numerical Problems', count: 5, marks: 5 }
  ],
  additionalInstructions: '',
  activeStep: 1,
  progress: 0,
  progressText: 'Not started',
  currentAssignmentId: null,
  generatedAssignment: null,
  isVoiceActive: false,
  validationErrors: {},

  setTitle: (title) => set({ title, validationErrors: { ...get().validationErrors, title: '' } }),
  setSubject: (subject) => set({ subject }),
  setDueDate: (dueDate) => set({ dueDate, validationErrors: { ...get().validationErrors, dueDate: '' } }),
  setAdditionalInstructions: (additionalInstructions) => set({ additionalInstructions }),
  setVoiceActive: (isVoiceActive) => set({ isVoiceActive }),

  addQuestionType: (name) => {
    const list = get().questionTypes;
    if (list.some(q => q.name === name)) return;
    set({
      questionTypes: [...list, { name, count: 1, marks: 1 }]
    });
  },

  removeQuestionType: (name) => {
    set({
      questionTypes: get().questionTypes.filter(q => q.name !== name)
    });
  },

  updateQuestionCount: (name, delta) => {
    set({
      questionTypes: get().questionTypes.map(q => {
        if (q.name === name) {
          const newCount = Math.max(1, q.count + delta);
          return { ...q, count: newCount };
        }
        return q;
      })
    });
  },

  updateQuestionMarks: (name, delta) => {
    set({
      questionTypes: get().questionTypes.map(q => {
        if (q.name === name) {
          const newMarks = Math.max(1, q.marks + delta);
          return { ...q, marks: newMarks };
        }
        return q;
      })
    });
  },

  validateQuestionTypes: () => {
    const errors: Record<string, string> = {};
    const state = get();

    state.questionTypes.forEach(qt => {
      if (qt.count < 1) {
        errors[`count_${qt.name}`] = 'Number of questions must be at least 1';
      }
      if (qt.marks < 1) {
        errors[`marks_${qt.name}`] = 'Marks per question must be at least 1';
      }
    });

    return errors;
  },

  setStep: (activeStep) => set({ activeStep }),

  resetForm: () => set({
    title: '',
    subject: 'Physics',
    dueDate: '',
    questionTypes: [
      { name: 'Multiple Choice Questions', count: 4, marks: 1 },
      { name: 'Short Questions', count: 3, marks: 2 },
      { name: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
      { name: 'Numerical Problems', count: 5, marks: 5 }
    ],
    additionalInstructions: '',
    activeStep: 1,
    progress: 0,
    progressText: 'Not started',
    currentAssignmentId: null,
    generatedAssignment: null,
    isVoiceActive: false,
    validationErrors: {}
  }),

  validateForm: () => {
    const errors: Record<string, string> = {};
    const state = get();

    if (!state.title.trim()) {
      errors.title = 'Assignment title is required.';
    }
    if (!state.dueDate) {
      errors.dueDate = 'Due date is required.';
    }
    if (state.questionTypes.length === 0) {
      errors.questionTypes = 'Please add at least one question type.';
    }

    // Validate question types for negative/zero values
    const questionTypeErrors = get().validateQuestionTypes();
    Object.assign(errors, questionTypeErrors);

    set({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  },

  submitAssignment: async () => {
    const state = get();
    if (!state.validateForm()) return;

    set({ activeStep: 2, progress: 0, progressText: 'Queuing assignment generation...' });

    try {
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.title,
          subject: state.subject,
          dueDate: state.dueDate,
          questionTypes: state.questionTypes,
          additionalInstructions: state.additionalInstructions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment on server');
      }

      const assignment = await response.json();
      const assignmentId = assignment._id;

      set({ currentAssignmentId: assignmentId });

      // Connect to WebSocket to receive real-time updates
      get().connectWebSocket(assignmentId);

    } catch (err: any) {
      console.error(err);
      set({ 
        activeStep: 1, 
        validationErrors: { global: err.message || 'Server connection refused. Make sure backend is running.' } 
      });
    }
  },

  connectWebSocket: (assignmentId: string) => {
    let ws: WebSocket;
    try {
      ws = new WebSocket('ws://localhost:5000');
    } catch (e) {
      console.error('Failed to create WebSocket client', e);
      return;
    }

    ws.onopen = () => {
      console.log('🔌 WebSocket connected to feedback stream');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Filter messages for our specific assignment
        if (data.assignmentId && data.assignmentId !== assignmentId) {
          return;
        }

        if (data.type === 'PROGRESS') {
          set({
            progress: data.progress,
            progressText: data.progressText
          });
        } else if (data.type === 'COMPLETED') {
          set({
            progress: 100,
            progressText: 'Finished!',
            generatedAssignment: data.assignment,
            activeStep: 3
          });
          ws.close();
        } else if (data.type === 'FAILED') {
          set({
            progress: 100,
            progressText: `Error: ${data.error}`,
            activeStep: 1,
            validationErrors: { global: `AI generation failed: ${data.error}` }
          });
          ws.close();
        }
      } catch (err) {
        console.error('Error handling WS message:', err);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }
}));
