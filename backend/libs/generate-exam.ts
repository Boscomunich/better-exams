import { Exam } from '@prisma/client';

export function generateExamPrompt(exam: Exam): string {
  const safeExam = {
    id: exam.id,
    title: exam.title,
    type: exam.type,
    difficulty: exam.difficulty,
    duration: exam.duration,
    numberOfQuestions: exam.numberOfQuestions,
    courseId: exam.courseId,
    passScore: exam.passScore,
    instruction: exam.instruction,
    topics: exam.topics,
  };
  const examData = JSON.stringify(safeExam, null, 2);
  return `
    You are an expert assessment designer and subject-matter examiner.

    Your task is to generate a comprehensive, high-quality exam based strictly on:
    1. The provided exam configuration
    2. The provided question schemas
    3. The full textual context extracted from multiple documents

    You MUST follow all rules below exactly.

    EXAMS SETTINGS: ${examData}

    You will be given:

    1. EXAM SETTINGS
    - title
    - instruction (if provided)
    - allowed question types (ExamType[])
    - difficulty level
    - number of questions (if provided)
    - duration (in minutes)
    - topics (if provided)

    2. DOCUMENT CONTEXT
    - A dictionary of documents keyed by documentId
    - Each document contains an ordered array of text chunks
    - Chunks are already sorted by their logical order
    - Together, all chunks represent the complete learning material

    3. QUESTION SCHEMA
    - You must generate questions that strictly conform to the provided TypeScript/Zod schema
    - Any output that does not validate against the schema is invalid

    MANDATORY RULES
    1. Use ONLY the provided document chunks as factual source material.
    - Do not invent facts.
    - Do not introduce external knowledge.
    - If information is missing, infer conservatively or avoid the topic.

    2. Cover ALL documents.
    - Ensure questions are distributed across different documents.
    - Avoid concentrating all questions on a single document unless unavoidable.

    3. Respect the allowed question types.
    - Generate ONLY question types listed in ExamType[].
    - If ExamType includes MIXED, use a balanced mix of types.

    4. Match difficulty.
    - EASY: recall, definitions, direct facts
    - MEDIUM: application, interpretation, comparison
    - HARD: synthesis, evaluation, reasoning across multiple chunks

    5. Question quality requirements:
    - Each question must be clear, unambiguous, and academically sound.
    - Multiple-choice and multi-select questions must include plausible distractors.
    - Essay questions must include a rubric when appropriate.
    - Short answers must include valid expected answers or keywords.
    - The of number Questions must match number of questions from the Exams Settings and if not provided Estimate the number of question need based on EXAMTYPE, EXAMDURATION, DIFFICULTY

    6. Scoring:
    - Assign points proportionally so totalPoints is reasonable for the exam length.
    - Essay and multi-select questions should generally have higher point values.

    7. IDs:
    - Every question must have a unique string id.
    - Every option must have a unique string id.

    8. Time:
    - If the Exam duration is not provided Estimate total exam duration realistically based on  question types and difficulty level.
    - Populate metadata.estimatedDuration.

    9. Output format:
    - Output ONLY valid JSON.
    - Do NOT include explanations, markdown, or commentary.
    - The JSON must match the ExamStructure schema exactly.



    EXPECTED OUTPUT
    STRICT OUTPUT RULES - MUST FOLLOW EXACTLY:
    1. QUESTION TYPE REQUIREMENTS:
    - Use ONLY these exact strings (case-sensitive):
        * "MULTIPLE_CHOICE"
        * "TRUE_FALSE" 
        * "SHORT_ANSWER"
        * "ESSAY"
        * "MULTI_SELECT"

    2. BASE QUESTION STRUCTURE (ALL question types MUST include):
    - "id": "q1", "q2", etc. (string, sequential)
    - "type": one of the above strings
    - "text": question text (string, ends with ? or .)
    - "points": number (1-10 typically)
    - "difficulty": "EASY", "MEDIUM", or "HARD" (exact strings)
    - "topic": string (optional)
    - "timeLimit": number in seconds (optional, 60-600)
    - "learningObjective": string (optional)

    IMPORTANT: The example provided in the 'EXPECTED OUTPUT' section is for formatting purposes only. Do NOT generate questions about Cell Biology unless it is explicitly contained within the provided Document Context.

    3. TYPE-SPECIFIC REQUIREMENTS:

    A. MULTIPLE_CHOICE (AnswerFormat: SINGLE or MULTIPLE):
        - "options": array of 4 objects minimum
        - Each option MUST have:
            * "id": "A", "B", "C", "D" (or "A", "B", "C", "D", "E" if 5)
            * "text": option text (string)
            * "isCorrect": boolean
            * "feedback": string (optional but recommended)
        - VALIDATION RULES:
            * For SINGLE format: EXACTLY ONE option with isCorrect: true
            * For MULTIPLE format: AT LEAST ONE option with isCorrect: true
            * No duplicate option texts
            * Options must be plausible distractors
        - "answerFormat": "SINGLE" or "MULTIPLE"

    B. TRUE_FALSE (AnswerFormat: SINGLE):
        - "correctAnswer": boolean (true or false)
        - "explanation": string (REQUIRED, 1-3 sentences explaining why)
        - Answer must be clearly verifiable as true/false
        - "answerFormat": "SINGLE" (always)

    C. SHORT_ANSWER (AnswerFormat: TEXT):
        - "correctAnswer": string OR array of strings
            * If string: one acceptable answer
            * If array: multiple acceptable answers
        - "keywords": array of strings (REQUIRED, 3-8 keywords for grading)
            * Each keyword should be significant to the answer
            * Example: ["photosynthesis", "chloroplast", "sunlight"]
        - "maxLength": number (optional, 50-250 characters)
        - Question should require brief, factual answers
        - "answerFormat": "TEXT"

    D. ESSAY (AnswerFormat: TEXT):
        - "prompt": detailed instructions (REQUIRED, 2-4 sentences)
            * Must include specific requirements
            * Must mention structure expectations
        - "wordLimit": object with "min" and "max" numbers (REQUIRED)
            * Example: {"min": 200, "max": 500}
            * min should be ≥ 100, max ≤ 2000
        - "rubric": object with "criteria" array (optional but recommended)
            * Each criteria: {"name": string, "description": string, "maxPoints": number}
            * Points should sum to question's total points
        - "sampleAnswer": string (optional but recommended, 2-3 paragraphs)
        - "answerFormat": "TEXT"

    E. MULTI_SELECT (AnswerFormat: MULTIPLE):
        - "options": array of 4-6 objects
            * Each option: {"id": "A"-"F", "text": string, "isCorrect": boolean, "points": number (optional)}
            * Points: if provided, sum of correct options should equal question points
        - "scoring": object with these EXACT properties:
            * "allOrNothing": boolean (if true, requires ALL correct answers)
            * "partialCredit": boolean (if true, awards points per correct selection)
            * "deductIncorrect": boolean (if true, subtracts points for wrong answers)
        - VALIDATION RULES:
            * At least 2 correct options (but not all options)
            * No contradictory scoring rules
            * If partialCredit: false and allOrNothing: true, deductIncorrect: false
        - "answerFormat": "MULTIPLE"

    4. CONTENT VALIDATION:
    - No placeholder text like "[insert topic here]" or "TODO"
    - Questions must be factually accurate and educationally sound
    - Difficulty must match content (EASY: recall, HARD: analysis/synthesis)
    - Points proportional to difficulty and expected time

    5. FORMAT ENFORCEMENT:
    - Output MUST be valid JSON
    - All property names in quotes
    - No trailing commas
    - No comments in JSON
    - Strings properly escaped
    - Arrays properly bracketed
    - Objects properly braced

    6. ERROR PREVENTION - COMMON MISTAKES TO AVOID:
    - DO NOT mix question type properties (e.g., don't put "options" in TRUE_FALSE)
    - DO NOT omit required fields for each type
    - DO NOT use incorrect data types (e.g., string for points number)
    - DO NOT create ambiguous questions
    - DO NOT use "all of the above" or "none of the above" in options
    - DO NOT create trick questions without educational value
    - DO NOT exceed reasonable character limits:
        * Question text: ≤ 500 characters
        * Option text: ≤ 200 characters
        * Feedback: ≤ 150 characters

    7. EXAM STRUCTURE REQUIREMENTS:
    - Include metadata: totalPoints, estimatedDuration, timeLimit (as indicated by the user)
    - Distribute question types appropriately
    - Progress difficulty (easier questions first)
    - Group similar topics together
    - Ensure point total adds up correctly

    EXAMPLE OF CORRECT STRUCTURE:
    {
        "questions": [
            {
                "id": "q1",
                "type": "MULTIPLE_CHOICE",
                "text": "[Insert question text here based on source document]",
                "points": 5,
                "difficulty": "MEDIUM",
                "topic": "[Relevant Topic from Document]",
                "options": [
                    {"id": "A", "text": "[Distractor 1]", "isCorrect": false, "feedback": "[Explanation]"},
                    {"id": "B", "text": "[Correct Answer]", "isCorrect": true, "feedback": "[Explanation]"},
                    {"id": "C", "text": "[Distractor 2]", "isCorrect": false, "feedback": "[Explanation]"},
                    {"id": "D", "text": "[Distractor 3]", "isCorrect": false, "feedback": "[Explanation]"}
                ],
                "answerFormat": "SINGLE"
            }
        ]
        "metadata": {
            "totalPoints": DEPENDENT ON EXAM SETTINGS,
            "estimatedDuration": DEPENDENT ON EXAMS SETTINGS,
            "timeLimit": DEPENDENT ON EXAM SETTINGS

        }
    }

    Generate the exam now.

`;
}
