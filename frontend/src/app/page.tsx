"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAssignmentStore, QuestionType } from '../store/assignmentStore';
import { 
  UploadCloud, 
  Calendar, 
  Plus, 
  Minus, 
  Trash2, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  ArrowRight, 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  Settings, 
  Printer, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';

export default function Home() {
  const {
    title,
    subject,
    dueDate,
    questionTypes,
    additionalInstructions,
    activeStep,
    progress,
    progressText,
    generatedAssignment,
    isVoiceActive,
    validationErrors,
    setTitle,
    setSubject,
    setDueDate,
    setAdditionalInstructions,
    setVoiceActive,
    addQuestionType,
    removeQuestionType,
    updateQuestionCount,
    updateQuestionMarks,
    setStep,
    resetForm,
    submitAssignment
  } = useAssignmentStore();

  // Local state for file upload simulation
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAddTypeDropdown, setShowAddTypeDropdown] = useState(false);
  const [typedInstruction, setTypedInstruction] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceTimeoutRef = useRef<any>(null);

  // Available question types that can be added
  const availableQuestionTypes = [
    'Multiple Choice Questions',
    'Short Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems',
    'Long-Answer Essay Questions',
    'True/False Statements'
  ].filter(type => !questionTypes.some(q => q.name === type));

  // Calculate totals
  const totalQuestions = questionTypes.reduce((acc, curr) => acc + curr.count, 0);
  const totalMarks = questionTypes.reduce((acc, curr) => acc + (curr.count * curr.marks), 0);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Mock Voice Dictation Handler
  const toggleVoiceRecording = () => {
    if (isVoiceActive) {
      setVoiceActive(false);
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    } else {
      setVoiceActive(true);
      setAdditionalInstructions('');
      
      const mockText = "Generate a challenging question paper for a 3-hour exam duration. Incorporate comprehensive application-based case studies, ensure intermediate-level calculus derivations are included, and focus on practical rotational mechanics applications.";
      let charIndex = 0;
      
      const typeText = () => {
        if (charIndex < mockText.length) {
          setAdditionalInstructions(mockText.substring(0, charIndex + 1));
          charIndex++;
          voiceTimeoutRef.current = setTimeout(typeText, 35);
        } else {
          setVoiceActive(false);
        }
      };
      
      voiceTimeoutRef.current = setTimeout(typeText, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    };
  }, []);

  // Form submission handler
  const handleContinue = () => {
    if (activeStep === 1) {
      submitAssignment();
    }
  };

  // Circular progress stroke calculation
  const strokeDashoffset = 440 - (440 * progress) / 100;

  return (
    <div className="app-container">
      <div className="bg-blur-ellipse"></div>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <div className="logo-badge">V</div>
            <span className="logo-text">VedaAI</span>
          </div>

          <button className="create-assignment-btn" onClick={resetForm}>
            <Plus size={16} />
            Create Assignment
          </button>

          <nav className="nav-menu">
            <div className="nav-item active">
              <LayoutDashboard className="nav-icon" />
              <span>Dashboard</span>
            </div>
            <div className="nav-item">
              <Users className="nav-icon" />
              <span>My Groups</span>
            </div>
            <div className="nav-item">
              <FileText className="nav-icon" />
              <span>Assignments</span>
            </div>
            <div className="nav-item">
              <BookOpen className="nav-icon" />
              <span>AI Toolkit</span>
            </div>
            <div className="nav-item">
              <Settings className="nav-icon" />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">T</div>
            <div className="user-info">
              <div className="username">Prof. Taylor</div>
              <div className="credits">Credits: 84 / 100</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-workspace">
        {/* Top Header */}
        <header className="top-header">
          <div className="breadcrumb">
            <div className="breadcrumb-indicator"></div>
            <div>
              <h1 className="breadcrumb-title">Create Assignment</h1>
              <p className="breadcrumb-subtitle">Set up a new assignment for your students</p>
            </div>
          </div>

          <div className="steps-progress">
            <div className={`progress-segment ${activeStep >= 1 ? 'active' : ''}`}>
              <div className="progress-segment-fill"></div>
            </div>
            <div className={`progress-segment ${activeStep >= 2 ? 'active' : ''}`}>
              <div className="progress-segment-fill"></div>
            </div>
            <div className={`progress-segment ${activeStep >= 3 ? 'active' : ''}`}>
              <div className="progress-segment-fill"></div>
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {validationErrors.global && (
          <div className="error-banner">
            <HelpCircle size={18} />
            <span>{validationErrors.global}</span>
          </div>
        )}

        {/* STEP 1: Details & Setup Form */}
        {activeStep === 1 && (
          <div className="step-card">
            <div className="step-header">
              <h2 className="step-title">Assignment Details</h2>
              <p className="step-subtitle">Provide basic configuration parameters for your question paper</p>
            </div>

            <div className="form-grid-layout">
              {/* Subject Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject / Course</label>
                <select 
                  id="subject" 
                  className="form-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Math">Mathematics</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              {/* Title Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="title">Assignment Title</label>
                <input 
                  type="text" 
                  id="title" 
                  className="form-input" 
                  placeholder="e.g. Newton's Laws & Classical Dynamics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {validationErrors.title && (
                  <span className="validation-error-msg">{validationErrors.title}</span>
                )}
              </div>

              {/* Drag and Drop File Uploader */}
              <div className="form-group form-group-full">
                <label className="form-label">Reference Material (Syllabus/Notes)</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
                />
                <div 
                  className={`uploader-box ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedFile ? (
                    <div className="file-status-badge">
                      <FileCheck size={18} className="text-green" />
                      <span><strong>{uploadedFile.name}</strong> ({uploadedFile.size})</span>
                      <button className="delete-row-btn" onClick={clearFile}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="uploader-icon">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="uploader-text-primary">Choose a file or drag & drop it here</p>
                        <p className="uploader-text-secondary">PDF, JPEG, PNG, or Word documents up to 10MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Due Date Box */}
              <div className="form-group">
                <label className="form-label" htmlFor="due-date">Due Date</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="date" 
                    id="due-date" 
                    className="form-input" 
                    style={{ width: '100%', paddingRight: '40px' }}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                {validationErrors.dueDate && (
                  <span className="validation-error-msg">{validationErrors.dueDate}</span>
                )}
              </div>

              {/* Dynamic Question Type Configurator */}
              <div className="form-group form-group-full question-configurator">
                <label className="form-label">Question Types Configuration</label>
                
                {questionTypes.map((qt) => (
                  <div key={qt.name} className="configurator-row">
                    <span className="question-type-select">{qt.name}</span>
                    
                    {/* No. of Questions Counter */}
                    <div className="form-group">
                      <span className="uploader-text-secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>NO. OF QUESTIONS</span>
                      <div className="counter-control">
                        <span className="counter-btn" onClick={() => updateQuestionCount(qt.name, -1)}><Minus size={12} /></span>
                        <span className="counter-value">{qt.count}</span>
                        <span className="counter-btn" onClick={() => updateQuestionCount(qt.name, 1)}><Plus size={12} /></span>
                      </div>
                      {validationErrors[`count_${qt.name}`] && (
                        <span className="validation-error-msg">{validationErrors[`count_${qt.name}`]}</span>
                      )}
                    </div>

                    {/* Marks Counter */}
                    <div className="form-group">
                      <span className="uploader-text-secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>MARKS PER QUESTION</span>
                      <div className="counter-control">
                        <span className="counter-btn" onClick={() => updateQuestionMarks(qt.name, -1)}><Minus size={12} /></span>
                        <span className="counter-value">{qt.marks}</span>
                        <span className="counter-btn" onClick={() => updateQuestionMarks(qt.name, 1)}><Plus size={12} /></span>
                      </div>
                      {validationErrors[`marks_${qt.name}`] && (
                        <span className="validation-error-msg">{validationErrors[`marks_${qt.name}`]}</span>
                      )}
                    </div>

                    {/* Delete row */}
                    <button 
                      className="delete-row-btn"
                      onClick={() => removeQuestionType(qt.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Add Row Button and Totals Panel */}
                <div className="configurator-footer">
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="add-type-btn"
                      onClick={() => setShowAddTypeDropdown(!showAddTypeDropdown)}
                    >
                      <Plus size={14} />
                      Add Question Type
                    </button>

                    {showAddTypeDropdown && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          background: 'white',
                          border: '1px solid #DADADA',
                          boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          zIndex: 10,
                          width: '240px',
                          marginTop: '8px',
                          overflow: 'hidden'
                        }}
                      >
                        {availableQuestionTypes.length > 0 ? (
                          availableQuestionTypes.map(type => (
                            <div 
                              key={type}
                              style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                borderBottom: '1px solid #F0F0F0'
                              }}
                              onClick={() => {
                                addQuestionType(type);
                                setShowAddTypeDropdown(false);
                              }}
                              className="nav-item"
                            >
                              {type}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '12px', fontSize: '12px', color: 'gray', textAlign: 'center' }}>
                            All question types added
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="totals-panel">
                    <div className="total-stat">Total Questions : <span>{totalQuestions}</span></div>
                    <div className="total-stat">Total Marks : <span>{totalMarks}</span></div>
                  </div>
                </div>
                {validationErrors.questionTypes && (
                  <span className="validation-error-msg">{validationErrors.questionTypes}</span>
                )}
              </div>

              {/* Additional Information (Dictation option) */}
              <div className="form-group form-group-full voice-input-container">
                <label className="form-label" htmlFor="additional-info">Additional Guidelines (Optional)</label>
                <div className="voice-input-textarea-wrapper">
                  <textarea 
                    id="additional-info" 
                    className="form-textarea"
                    rows={4}
                    placeholder="e.g. Generate a question paper for 3 hour exam duration. Focus on kinematics equations, and exclude theory questions from section C..."
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    disabled={isVoiceActive}
                  />
                  
                  {isVoiceActive && (
                    <div className="sound-wave-overlay">
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#D45E3E', marginLeft: '6px' }}>Listening...</span>
                    </div>
                  )}

                  <button 
                    type="button" 
                    className={`mic-button ${isVoiceActive ? 'recording' : ''}`}
                    onClick={toggleVoiceRecording}
                  >
                    {isVoiceActive ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="step-navigation-footer">
              <button className="btn-nav-previous" disabled>
                <ArrowLeft size={16} />
                Previous
              </button>
              <button className="btn-nav-continue" onClick={handleContinue}>
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Live AI Generation Queue State */}
        {activeStep === 2 && (
          <div className="step-card loading-view">
            <div className="progress-gauge-container">
              <svg className="progress-gauge-circle">
                <circle className="progress-circle-bg" cx="80" cy="80" r="70" />
                <circle 
                  className="progress-circle-fill" 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  style={{ strokeDashoffset }}
                />
              </svg>
              <span className="progress-percentage">{progress}%</span>
            </div>

            <div className="loading-details">
              <h3 className="loading-status-text">
                <Sparkles size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                AI Generation in Progress
              </h3>
              <p className="loading-subtext">{progressText}</p>
            </div>
          </div>
        )}

        {/* STEP 3: Generated Output Sheet */}
        {activeStep === 3 && generatedAssignment && (
          <div className="exam-output-panel">
            <div className="print-actions-header">
              <button className="btn-nav-previous" onClick={resetForm}>
                <RotateCcw size={15} />
                Create New
              </button>
              
              <button className="btn-print" onClick={() => window.print()}>
                <Printer size={15} />
                Print Exam Sheet
              </button>
            </div>

            {/* High Fidelity Printable Exam Sheet Layout */}
            <div className="exam-sheet-paper">
              <div className="exam-header">
                <span className="exam-school-name">VedaAI Academic Examination</span>
                <h2 className="exam-title-name">{generatedAssignment.title}</h2>
                
                <div className="exam-meta-grid">
                  <div className="exam-meta-left">
                    <p><strong>Subject:</strong> {generatedAssignment.subject}</p>
                    <p><strong>Due Date:</strong> {generatedAssignment.dueDate}</p>
                  </div>
                  <div className="exam-meta-right">
                    <p><strong>Total Questions:</strong> {generatedAssignment.totalQuestions}</p>
                    <p><strong>Total Marks:</strong> {generatedAssignment.totalMarks}</p>
                  </div>
                </div>
              </div>

              {/* Student Details Fields */}
              <div className="exam-student-info-block">
                <div className="info-field-group">
                  <span>Student Name:</span>
                  <input type="text" className="info-field-input" placeholder="......................................................" />
                </div>
                <div className="info-field-group">
                  <span>Roll No:</span>
                  <input type="text" className="info-field-input" placeholder=".........................." />
                </div>
                <div className="info-field-group">
                  <span>Section:</span>
                  <input type="text" className="info-field-input" placeholder=".........................." />
                </div>
              </div>

              {/* Exam Sections */}
              <div className="exam-body">
                {generatedAssignment.sections.map((section: any, sIdx: number) => (
                  <section key={section.title} className="exam-section">
                    <h3 className="exam-section-title">
                      <span>{section.title}</span>
                    </h3>
                    <p className="exam-section-instruction">{section.instruction}</p>

                    <div className="exam-questions-list">
                      {section.questions.map((question: any, qIdx: number) => (
                        <div key={qIdx} className="exam-question-item">
                          <div className="question-text-wrapper">
                            <span className="question-text-content">
                              <strong>Q{qIdx + 1}.</strong> {question.text}
                            </span>
                            
                            {/* Option selections for MCQ */}
                            {question.options && question.options.length > 0 && (
                              <div className="question-options-grid">
                                {question.options.map((opt: string, oIdx: number) => {
                                  const prefixes = ['A', 'B', 'C', 'D'];
                                  return (
                                    <div key={oIdx} className="option-choice-item">
                                      <strong>{prefixes[oIdx]}.</strong> {opt}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="question-meta-indicators">
                            <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                              {question.difficulty}
                            </span>
                            <span className="question-marks-badge">
                              [{question.marks} Mark{question.marks > 1 ? 's' : ''}]
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
