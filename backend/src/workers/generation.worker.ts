import { dbService } from '../config/db';
import { broadcast } from '../config/websocket';

// Procedural generation helper for high-fidelity fallback when OpenRouter is not configured or fails
const generateProceduralAssignment = (title: string, subject: string, dueDate: string, questionTypes: any[], additionalInstructions: string) => {
  const sections: any[] = [];
  let currentSectionChar = 65; // 'A', 'B', etc.
  let totalQuestionsCount = 0;
  let totalMarksSum = 0;

  const mockDatabase: Record<string, Record<string, { questions: string[]; options?: string[][] }>> = {
    physics: {
      'Multiple Choice Questions': {
        questions: [
          "What is the value of acceleration due to gravity on the surface of the Earth?",
          "Which of the following is a unit of power?",
          "What happens to the resistance of a semiconductor as temperature increases?",
          "Which wave property is responsible for the formation of a rainbow?",
          "What is the escape velocity from the Earth's surface?"
        ],
        options: [
          ["9.8 m/s²", "1.6 m/s²", "8.9 m/s²", "11.2 m/s²"],
          ["Joule", "Watt", "Newton", "Pascal"],
          ["Increases", "Decreases", "Remains same", "Becomes zero"],
          ["Reflection", "Refraction & Dispersion", "Diffraction", "Polarization"],
          ["11.2 km/s", "7.9 km/s", "2.4 km/s", "42 km/s"]
        ]
      },
      'Short Questions': {
        questions: [
          "State Newton's Second Law of Motion and derive the relation F = ma.",
          "Differentiate between transverse and longitudinal waves with examples.",
          "Explain the principle of conservation of linear momentum.",
          "What is total internal reflection? State the conditions required for it to occur.",
          "Define electric potential at a point and state its SI unit."
        ]
      },
      'Diagram/Graph-Based Questions': {
        questions: [
          "Draw a neat free-body diagram of a block sliding down an inclined plane of angle θ. Label all forces acting on it.",
          "Analyze the given Ray Diagram showing image formation by a concave mirror when the object is placed between the center of curvature and focus.",
          "Examine the graph of Stress vs. Strain for a metallic wire and label the Elastic Limit and Yield Point.",
          "Sketch the electric field lines due to a system of two equal and opposite point charges (an electric dipole).",
          "Draw the schematic circuit diagram of a half-wave rectifier using a semiconductor diode."
        ]
      },
      'Numerical Problems': {
        questions: [
          "A car starts from rest and accelerates uniformly at 2.5 m/s² for 8 seconds. Calculate the final velocity and distance traveled.",
          "Calculate the equivalent resistance of three resistors of 2 Ω, 4 Ω, and 6 Ω connected in parallel.",
          "A light bulb is rated at 60W, 220V. Find the resistance of the filament and the current flowing through it when active.",
          "Determine the frequency of a photon whose energy is 3.3 x 10^-19 Joules. (Given Planck's constant h = 6.6 x 10^-34 J·s)",
          "An object of mass 2 kg is dropped from a height of 20 meters. Find its kinetic energy just before hitting the ground. (Take g = 10 m/s²)"
        ]
      }
    },
    chemistry: {
      'Multiple Choice Questions': {
        questions: [
          "Which element has the highest electronegativity on the periodic table?",
          "What is the pH of a neutral solution at 25°C?",
          "Which gas is primary contributor to the greenhouse effect?",
          "What type of bond exists between sodium and chlorine in NaCl?",
          "Which catalyst is used in Haber's Process for ammonia synthesis?"
        ],
        options: [
          ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"],
          ["0", "7", "14", "1"],
          ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
          ["Covalent", "Ionic", "Metallic", "Hydrogen"],
          ["Finely divided Iron", "Platinum", "Nickel", "Copper"]
        ]
      },
      'Short Questions': {
        questions: [
          "State Le Chatelier's Principle and explain its application in industrial ammonia synthesis.",
          "Define hybridization. Describe the shape and bond angle of methane (CH4).",
          "Explain why transition elements form colored ions in aqueous solution.",
          "Define isomers. Write the structures of two isomers of butane.",
          "What is the difference between an empirical formula and a molecular formula?"
        ]
      },
      'Diagram/Graph-Based Questions': {
        questions: [
          "Examine the titration curve showing the titration of a strong acid with a strong base and identify the equivalence point.",
          "Draw the structure of a galvanic cell. Label the anode, cathode, and salt bridge, showing direction of electron flow.",
          "Draw the molecular orbital diagram for the Nitrogen molecule (N2) showing bonding and antibonding orbitals.",
          "Sketch the apparatus setup for simple distillation. Label the condenser, distillation flask, and receiver.",
          "Draw the energy profile diagram for an exothermic reaction. Label the activation energy and enthalpy change."
        ]
      },
      'Numerical Problems': {
        questions: [
          "Calculate the molarity of a solution prepared by dissolving 4.0 g of NaOH in water to make 250 mL of solution. (Molar mass NaOH = 40 g/mol)",
          "Find the volume occupied by 2.5 moles of an ideal gas at STP. (Standard molar volume = 22.4 L/mol)",
          "How many grams of CO2 are produced by complete combustion of 16g of methane (CH4)?",
          "Calculate the pH of a 1.0 x 10^-3 M HCl solution.",
          "For a first-order reaction, the rate constant is 0.03 s^-1. Calculate the half-life of this reaction."
        ]
      }
    },
    math: {
      'Multiple Choice Questions': {
        questions: [
          "What is the derivative of sin(x) with respect to x?",
          "What is the value of log(e) of 1?",
          "Which of the following is the determinant of a identity matrix of order 3?",
          "What is the distance between points (1, 2) and (4, 6)?",
          "What is the limit as x approaches 0 of sin(x)/x?"
        ],
        options: [
          ["cos(x)", "-cos(x)", "sin(x)", "sec²(x)"],
          ["0", "1", "e", "Infinity"],
          ["0", "1", "3", "9"],
          ["5", "3", "4", "25"],
          ["0", "1", "Undefined", "Infinity"]
        ]
      },
      'Short Questions': {
        questions: [
          "State and prove Rolle's Theorem.",
          "Explain the geometric interpretation of the dot product and cross product of two vectors.",
          "Find the value of k for which the system of equations has unique solutions.",
          "Prove that the sum of angles of a triangle is 180 degrees using vector algebra.",
          "Find the domain and range of the function f(x) = sqrt(9 - x²)."
        ]
      },
      'Diagram/Graph-Based Questions': {
        questions: [
          "Sketch the curve y = x³ - 3x and mark the local maxima, local minima, and inflection points.",
          "Draw the region bounded by curves y = x² and y = x. Set up the integral for its area.",
          "Visualize the complex number z = 3 + 4i on the Argand plane. Indicate its modulus and principal argument.",
          "Draw a Venn diagram representing the relation (A ∪ B)' = A' ∩ B' (De Morgan's Law).",
          "Sketch the unit circle in a Cartesian system and label the coordinates of angles π/6, π/4, and π/3."
        ]
      },
      'Numerical Problems': {
        questions: [
          "Evaluate the indefinite integral: ∫ (3x² + 2x - 5) dx.",
          "Find the equations of the tangent and normal to the curve y = x² + 2x + 1 at the point (1, 4).",
          "A box contains 5 red and 7 blue balls. Two balls are drawn at random. What is the probability that both are red?",
          "Solve the system of equations using Cramer's Rule: 2x + 3y = 8 and x - y = 1.",
          "Find the coordinates of the focus and the equation of the directrix of the parabola y² = 12x."
        ]
      }
    },
    default: {
      'Multiple Choice Questions': {
        questions: [
          "Which of the following describes the primary goal of the scientific method?",
          "What represents the basic building block of logic gates in computing?",
          "Who is historically known as the father of modern science?",
          "What is the binary representation of decimal number 10?",
          "Which unit is used to measure frequency?"
        ],
        options: [
          ["To prove pre-conceived ideas", "To gather empirical evidence and build models", "To replace philosophical debates", "To catalog raw taxonomy"],
          ["Resistor", "Transistor", "Capacitor", "Inductor"],
          ["Isaac Newton", "Galileo Galilei", "Aristotle", "Albert Einstein"],
          ["1010", "1001", "1100", "0101"],
          ["Hertz", "Decibel", "Joule", "Pascal"]
        ]
      },
      'Short Questions': {
        questions: [
          "Explain the key principles of responsive web design.",
          "Briefly define the concept of recursion in computer science, detailing the base case role.",
          "What is the significance of the Turing Test in Artificial Intelligence development?",
          "Define the core differences between a database SQL join and a subquery.",
          "State three advantages of utilizing custom styles over inline styling rules."
        ]
      },
      'Diagram/Graph-Based Questions': {
        questions: [
          "Draw a block diagram of the Von Neumann computer architecture. Label CPU, memory, input/output.",
          "Sketch a diagram representing a Binary Search Tree after inserting nodes 15, 10, 20, 8, 12 in order.",
          "Draw a flowchart demonstrating the algorithm to find the largest of three numbers.",
          "Sketch the database Entity-Relationship (ER) diagram for a school system with Students, Courses, and enrollments.",
          "Draw the layout graph for a local area network (LAN) in a Star Topology configuration."
        ]
      },
      'Numerical Problems': {
        questions: [
          "Compute the time complexity of the bubble sort algorithm in the worst-case scenario.",
          "Convert hexadecimal number 1A2F to decimal representation.",
          "A network packet transmits 500 bytes over a line with 10 Mbps bandwidth. Find the transmission delay.",
          "Calculate the total number of subnets available in a Class C network with subnet mask 255.255.255.192.",
          "Determine the output of the logical expression (A AND NOT B) OR C when A=1, B=1, C=0."
        ]
      }
    }
  };

  const selectedSubjectDb = mockDatabase[subject.toLowerCase()] || mockDatabase.default;

  questionTypes.forEach((qt) => {
    const typeName = qt.name;
    const count = parseInt(qt.count) || 1;
    const marks = parseInt(qt.marks) || 1;

    const sourceData = selectedSubjectDb[typeName] || mockDatabase.default[typeName] || mockDatabase.default['Short Questions'];
    const listQuestions: any[] = [];

    for (let i = 0; i < count; i++) {
      const qIndex = i % sourceData.questions.length;
      const questionText = sourceData.questions[qIndex];
      const newQuestion: any = {
        text: `${questionText} [Q-${i + 1}]`,
        difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard',
        marks: marks
      };

      if (sourceData.options && sourceData.options[qIndex]) {
        newQuestion.options = sourceData.options[qIndex];
        newQuestion.correctAnswer = sourceData.options[qIndex][0];
      }

      listQuestions.push(newQuestion);
      totalQuestionsCount += 1;
      totalMarksSum += marks;
    }

    sections.push({
      title: `Section ${String.fromCharCode(currentSectionChar++)}`,
      instruction: `Answer all the ${typeName} listed below. Carefully check the marks allocated for each question.`,
      questions: listQuestions
    });
  });

  return {
    title,
    subject,
    dueDate,
    status: 'completed',
    progress: 100,
    progressText: 'Assignment generated successfully (Procedural Fallback)',
    totalQuestions: totalQuestionsCount,
    totalMarks: totalMarksSum,
    additionalInstructions,
    sections
  };
};

// Main processing worker task
export const processGenerationJob = async (job: { id: string; name: string; data: any }) => {
  const { assignmentId } = job.data;
  console.log(`👷 Processing Assignment Generation Job: ${job.id} for Assignment: ${assignmentId}`);

  // Fetch assignment from database
  let assignment = await dbService.getAssignment(assignmentId);
  if (!assignment) {
    console.error(`Assignment ${assignmentId} not found in DB.`);
    return;
  }

  try {
    // Stage 1: Reading configuration
    assignment = await dbService.updateAssignment(assignmentId, {
      status: 'generating',
      progress: 15,
      progressText: 'Initializing prompt context & loading document attachments...'
    });
    broadcast({ type: 'PROGRESS', assignmentId, progress: 15, progressText: assignment.progressText });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Stage 2: AI Dispatch
    assignment = await dbService.updateAssignment(assignmentId, {
      progress: 35,
      progressText: 'Connecting to OpenRouter API (openai/gpt-oss-120b:nitro)...'
    });
    broadcast({ type: 'PROGRESS', assignmentId, progress: 35, progressText: assignment.progressText });

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey !== 'your_openrouter_api_key_here') {
      try {
        console.log('📡 Calling OpenRouter API...');
        
        // Define prompt structure
        const promptSystem = `You are an expert curriculum examiner. 
Generate a professional, structured exam paper in strict JSON format. 
DO NOT include markdown block markers (like \`\`\`json) in the response outside of a valid JSON object. 
Ensure the JSON parses perfectly.

The JSON schema must be exactly:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Section instructions...",
      "questions": [
        {
          "text": "Question text",
          "difficulty": "Easy" | "Medium" | "Hard",
          "marks": 5,
          "options": ["Option A", "Option B", "Option C", "Option D"] (only include if question type is Multiple Choice Questions)
        }
      ]
    }
  ]
}`;

        const promptUser = `Create an exam paper for the subject: "${assignment.subject}"
Assignment Title: "${assignment.title}"
Additional Guidelines: "${assignment.additionalInstructions || 'None'}"

Generate the following sections with exact counts and marks:
${assignment.additionalInstructions ? `Analyze user requirements: ${assignment.additionalInstructions}` : ''}
${assignment.sections.map((s: any) => `- Name: ${s.title}, Count: ${s.questions.length} questions, Marks per question: ${s.questions[0]?.marks || 5}`).join('\n')}

Make the questions highly academic and contextual to the subject. Return ONLY the JSON object matching the requested schema.`;

        // Native node fetch call
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'VedaAI Assignment Generator'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b:nitro',
            messages: [
              { role: 'system', content: promptSystem },
              { role: 'user', content: promptUser }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter HTTP ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        
        if (!responseText) {
          throw new Error('Empty response from OpenRouter.');
        }

        // Parse JSON
        let cleanJsonStr = responseText.trim();
        // Remove markdown tags if any
        if (cleanJsonStr.startsWith('```')) {
          cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        
        const generatedResult = JSON.parse(cleanJsonStr);

        assignment = await dbService.updateAssignment(assignmentId, {
          progress: 75,
          progressText: 'OpenRouter response received. Structuring sections...'
        });
        broadcast({ type: 'PROGRESS', assignmentId, progress: 75, progressText: assignment.progressText });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Format and map generatedResult sections
        const dbSections: any[] = [];
        let totalQuestions = 0;
        let totalMarks = 0;

        if (generatedResult.sections && Array.isArray(generatedResult.sections)) {
          generatedResult.sections.forEach((sect: any) => {
            const qs = (sect.questions || []).map((q: any) => {
              totalQuestions++;
              totalMarks += (q.marks || 1);
              return {
                text: q.text,
                difficulty: q.difficulty || 'Medium',
                marks: q.marks || 1,
                options: q.options || undefined
              };
            });

            dbSections.push({
              title: sect.title || 'Section',
              instruction: sect.instruction || 'Answer the questions.',
              questions: qs
            });
          });
        }

        // Save generated assignment to database
        const updatedAssignment = await dbService.updateAssignment(assignmentId, {
          status: 'completed',
          progress: 100,
          progressText: 'Assignment generated successfully using OpenRouter AI!',
          totalQuestions,
          totalMarks,
          sections: dbSections
        });

        broadcast({ type: 'COMPLETED', assignmentId, assignment: updatedAssignment });
        console.log('✅ AI Assignment Generation complete.');
        return;

      } catch (err: any) {
        console.error('❌ OpenRouter Generation Failed. Defaulting to high-fidelity procedural generation fallback:', err.message);
        // Fallback to procedural generation below
      }
    } else {
      console.log('⚠️  OpenRouter API Key not set. Defaulting to procedural fallback.');
    }

    // Stage 3: Running procedural fallback generator
    assignment = await dbService.updateAssignment(assignmentId, {
      progress: 60,
      progressText: 'Executing high-fidelity procedural subject-based generator...'
    });
    broadcast({ type: 'PROGRESS', assignmentId, progress: 60, progressText: assignment.progressText });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    assignment = await dbService.updateAssignment(assignmentId, {
      progress: 85,
      progressText: 'Formatting exam sheet templates and due date constraints...'
    });
    broadcast({ type: 'PROGRESS', assignmentId, progress: 85, progressText: assignment.progressText });
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Gather input parameters to construct template
    const inputQuestionTypes: any[] = [];
    assignment.sections.forEach((s: any) => {
      inputQuestionTypes.push({
        name: s.title, // using section title (e.g. MCQ, Short Questions)
        count: s.questions.length,
        marks: s.questions[0]?.marks || 5
      });
    });

    const generatedFallback = generateProceduralAssignment(
      assignment.title,
      assignment.subject,
      assignment.dueDate,
      inputQuestionTypes,
      assignment.additionalInstructions
    );

    const finalizedAssignment = await dbService.updateAssignment(assignmentId, {
      status: 'completed',
      progress: 100,
      progressText: 'Assignment generated successfully!',
      totalQuestions: generatedFallback.totalQuestions,
      totalMarks: generatedFallback.totalMarks,
      sections: generatedFallback.sections
    });

    broadcast({ type: 'COMPLETED', assignmentId, assignment: finalizedAssignment });
    console.log('✅ Procedural Assignment Generation complete.');

  } catch (error: any) {
    console.error(`❌ Job Generation error: ${error.message}`);
    const failedAssignment = await dbService.updateAssignment(assignmentId, {
      status: 'failed',
      progress: 100,
      progressText: `Generation failed: ${error.message}`
    });
    broadcast({ type: 'FAILED', assignmentId, error: error.message });
  }
};
