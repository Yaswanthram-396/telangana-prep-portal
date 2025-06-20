const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { question, language, course } = req.body;

  const prompt = `
You are a Telangana government exam preparation AI assistant. Always follow the user's request with clarity, structure, and precision.

If the user asks for a "plan", generate a detailed, well-structured daily plan for the specified number of days (e.g., if they say "month plan", assume 30 days and respond with a full 30-day plan).

Respond ONLY using a single HTML <div> container. Style it using basic inline CSS — keep styles minimal, readable, and accessible (no external CSS or frameworks). Use:
- font-family: Arial or sans-serif
- font-size: 14px–16px
- margin and padding for spacing
- <strong>, <br>, and <ul>/<ol> if needed for structure

Provide answers relevant to the following course: ${course}. If the question is not course-specific, give a general response applicable to government exam preparation.

User's question:
"${question}"

Respond in this language: ${language}.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'AI failed', details: error.message });
  }
});

router.get('/generate-questions', async (req, res) => {
  try {
    const { course } = req.query; // Extract course from query parameters
  console.log("course", course);


    const prompt = `
Generate 10 practice questions for the following Government exam course: ${course}.
Give some what tough questions and which are previously asked in the past ${course} exams.
Return the result as JSON array. Each object should include:
- id
- type: "input" or "mcq"
- question
- (optional) options: array of 4 options if type is "mcq"

Example format:
[
  {
    "id": "q1",
    "type": "input",
    "question": "Who founded the Satavahana dynasty?"
  },
  {
    "id": "q2",
    "type": "mcq",
    "question": "Which river flows through Telangana?",
    "options": ["Yamuna", "Krishna", "Ganga", "Narmada"]
  }
]
`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0].message.content || '';
    const cleaned = text
      .replace(/```json/g, '') // remove opening markdown
      .replace(/```/g, '')     // remove closing markdown
      .trim();
    const questions = JSON.parse(cleaned || '[]');
    console.log("questions", questions);

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

router.post('/evaluate-answers', async (req, res) => {
  const { questions, userAnswers } = req.body;

  const prompt = `
Evaluate the following answers for the practice questions related to the Telangana government exam course inferred from the questions.
Note: Neglect spelling mistakes, typos and short forms of words (But not option related questions). 
Return this JSON structure ONLY (no markdown):
{
  "score": number (percentage),
  "feedback": string,
  "correctAnswers": { [questionId]: string }
}

Questions: ${JSON.stringify(questions)}
User Answers: ${JSON.stringify(userAnswers)}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0].message.content || '';

    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const evaluation = JSON.parse(cleaned);
    res.status(200).json(evaluation);
  } catch (error) {
    console.error('AI evaluation error:', error.message);
    res.status(500).json({ error: 'Failed to evaluate answers' });
  }
});

module.exports = router;