import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  progressText: string;
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  marks: { type: Number, required: true },
  options: { type: [String], default: undefined },
  correctAnswer: { type: String }
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
  progress: { type: Number, default: 0 },
  progressText: { type: String, default: 'Created' },
  totalQuestions: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  additionalInstructions: { type: String, default: '' },
  sections: [SectionSchema]
}, { timestamps: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
