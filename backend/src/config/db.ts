import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const JSON_DB_PATH = path.join(DATA_DIR, 'assignments.json');

export let isFallbackMode = false;

// Ensure database folders exist for JSON fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(JSON_DB_PATH)) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify({ assignments: [] }, null, 2));
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('⚠️  No MONGODB_URI found in env. Running in LOCAL FILE DATABASE mode.');
    isFallbackMode = true;
    return;
  }

  try {
    // Set a short timeout (3 seconds) so it fails fast and falls back if MongoDB is not running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to MongoDB.');
  } catch (error: any) {
    console.log(`⚠️  MongoDB connection failed: ${error.message}.`);
    console.log('🚀 Falling back to LOCAL FILE DATABASE (JSON) mode.');
    isFallbackMode = true;
  }
};

// Unified DB helper methods to abstract whether we use Mongoose or File Database
export const dbService = {
  async saveAssignment(assignmentData: any): Promise<any> {
    if (!isFallbackMode) {
      const { Assignment } = require('../models/assignment.model');
      const assignment = new Assignment(assignmentData);
      return await assignment.save();
    } else {
      const db = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
      const id = assignmentData._id || new mongoose.Types.ObjectId().toString();
      const newAssignment = {
        _id: id,
        ...assignmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.assignments.push(newAssignment);
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2));
      return newAssignment;
    }
  },

  async getAssignment(id: string): Promise<any> {
    if (!isFallbackMode) {
      const { Assignment } = require('../models/assignment.model');
      return await Assignment.findById(id);
    } else {
      const db = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
      return db.assignments.find((a: any) => a._id === id || a.id === id) || null;
    }
  },

  async updateAssignment(id: string, updateData: any): Promise<any> {
    if (!isFallbackMode) {
      const { Assignment } = require('../models/assignment.model');
      return await Assignment.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    } else {
      const db = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
      const idx = db.assignments.findIndex((a: any) => a._id === id || a.id === id);
      if (idx !== -1) {
        db.assignments[idx] = {
          ...db.assignments[idx],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2));
        return db.assignments[idx];
      }
      return null;
    }
  },

  async listAssignments(): Promise<any[]> {
    if (!isFallbackMode) {
      const { Assignment } = require('../models/assignment.model');
      return await Assignment.find().sort({ createdAt: -1 });
    } else {
      const db = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
      return [...db.assignments].reverse();
    }
  }
};
