import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authMiddleware } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// Initialize Gemini with model fallback chain
const MODEL_CHAIN = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
let currentModelIndex = 0;

function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return null;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = MODEL_CHAIN[currentModelIndex] || MODEL_CHAIN[0];
    return genAI.getGenerativeModel({ model: modelName });
}

function getModelName() {
    return MODEL_CHAIN[currentModelIndex] || MODEL_CHAIN[0];
}

function rotateModel() {
    currentModelIndex = (currentModelIndex + 1) % MODEL_CHAIN.length;
    console.log(`🔄 Rotating to model: ${MODEL_CHAIN[currentModelIndex]}`);
}

// System prompt for the AI tutor
const TUTOR_SYSTEM_PROMPT = `You are an expert AI Learning Tutor for "AI Learning OS" — an adaptive learning platform. Your role is to help students learn faster and more effectively.

PERSONALITY:
- Friendly, encouraging, but intellectually rigorous
- Break complex concepts into simple, digestible pieces
- Use analogies, examples, and real-world connections
- Adapt your explanation level based on the student's apparent understanding
- Be concise — students prefer focused, clear answers

CAPABILITIES:
1. EXPLAIN concepts clearly with examples
2. GENERATE practice quiz questions with answers
3. DEBUG code — find bugs and explain fixes
4. SUMMARIZE text, articles, or topics
5. CREATE study plans and learning paths
6. ANSWER questions on any technical or academic topic

FORMATTING:
- Use markdown for structure (headers, bold, lists, code blocks)
- For code, always specify the language in code blocks
- For quizzes, number the questions and put answers at the end
- Keep responses focused and under 500 words unless the topic requires depth`;

// ─── AI CHAT ────────────────────────────────────────────
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, history = [], context = {} } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const model = getGeminiModel();

        if (!model) {
            // Fallback: No API key — use intelligent demo responses
            const demoResponse = getDemoResponse(message);
            return res.json({
                success: true,
                response: demoResponse,
                model: 'demo',
            });
        }

        // Build conversation with context
        const user = db.prepare('SELECT name, goal FROM users WHERE id = ?').get(req.user.id);
        const contextPrompt = user?.goal
            ? `\n\nSTUDENT CONTEXT: Name is ${user.name}, learning goal is "${user.goal}".`
            : '';

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'You are my AI tutor. Acknowledge this briefly.' }],
                },
                {
                    role: 'model',
                    parts: [{ text: TUTOR_SYSTEM_PROMPT + contextPrompt }],
                },
                ...history.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        console.log(`🤖 AI Chat: "${message.slice(0, 50)}..." → ${response.length} chars`);

        res.json({
            success: true,
            response,
            model: getModelName(),
        });
    } catch (err) {
        console.error('AI Chat error:', err?.status || err.message);
        // Rotate model on rate limit
        if (err?.status === 429) rotateModel();
        // Fallback to demo on rate limit or any error
        const demoResponse = getDemoResponse(req.body.message);
        res.json({ success: true, response: demoResponse, model: 'demo-fallback' });
    }
});

// ─── EXPLAIN A CONCEPT ──────────────────────────────────
router.post('/explain', authMiddleware, async (req, res) => {
    try {
        const { concept, level = 'intermediate' } = req.body;

        if (!concept) {
            return res.status(400).json({ success: false, error: 'Concept is required' });
        }

        const model = getGeminiModel();

        if (!model) {
            return res.json({
                success: true,
                response: getDemoExplanation(concept),
                model: 'demo',
            });
        }

        const prompt = `Explain "${concept}" to a ${level} level student. Include:
1. A simple one-line definition
2. A real-world analogy
3. A concise explanation (3-4 paragraphs max)
4. A simple code example if applicable
5. Common misconceptions to avoid

Keep it clear, engaging, and educational.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ success: true, response, model: 'gemini-2.0-flash' });
    } catch (err) {
        console.error('AI Explain error:', err?.status || err.message);
        res.json({ success: true, response: getDemoExplanation(req.body.concept), model: 'demo-fallback' });
    }
});

// ─── SUMMARIZE ──────────────────────────────────────────
router.post('/summarize', authMiddleware, async (req, res) => {
    try {
        const { text, type = 'notes' } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, error: 'Text is required' });
        }

        const model = getGeminiModel();

        if (!model) {
            return res.json({
                success: true,
                response: `## Summary\n\nHere's a concise summary of the provided text:\n\n- **Key Point 1**: The main concept discussed involves understanding core principles.\n- **Key Point 2**: Several examples demonstrate practical application.\n- **Key Point 3**: Important considerations and best practices are highlighted.\n\n> 💡 **Bottom Line**: The content covers essential concepts that build a strong foundation for further learning.`,
                model: 'demo',
            });
        }

        const prompt = type === 'notes'
            ? `Create concise study notes from the following text. Use bullet points, bold key terms, and organize into sections:\n\n${text}`
            : `Summarize the following text in 3-5 key bullet points. Be concise and focus on the most important takeaways:\n\n${text}`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ success: true, response, model: 'gemini-2.0-flash' });
    } catch (err) {
        console.error('AI Summarize error:', err?.status || err.message);
        res.json({ success: true, response: `## Summary\n\nHere's a concise summary:\n\n- The key concepts have been identified and organized\n- Important details are highlighted for quick review\n- Core takeaways support your learning goals\n\n> 💡 *AI is temporarily rate-limited. Full analysis will be available shortly.*`, model: 'demo-fallback' });
    }
});

// ─── DEBUG CODE ─────────────────────────────────────────
router.post('/debug', authMiddleware, async (req, res) => {
    try {
        const { code, language = 'python', error = '' } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, error: 'Code is required' });
        }

        const model = getGeminiModel();

        if (!model) {
            return res.json({
                success: true,
                response: `## 🐛 Debug Analysis\n\n### Issues Found\n1. **Potential bug on line 3**: Check your variable scope and initialization.\n2. **Logic error**: The condition may not handle edge cases properly.\n\n### Suggested Fix\n\`\`\`${language}\n// Fixed version with proper error handling\n// Your corrected code would go here\n\`\`\`\n\n### Explanation\nThe main issue stems from improper handling of boundary conditions. Always validate inputs before processing.`,
                model: 'demo',
            });
        }

        const prompt = `You are an expert ${language} developer and debugging assistant. Analyze this code, find any bugs, and explain the fix clearly:\n\n\`\`\`${language}\n${code}\n\`\`\`\n${error ? `\nError message: ${error}` : ''}\n\nProvide:\n1. What the bug is\n2. Why it happens\n3. The fixed code\n4. A brief explanation for a learner`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ success: true, response, model: 'gemini-2.0-flash' });
    } catch (err) {
        console.error('AI Debug error:', err?.status || err.message);
        res.json({ success: true, response: `## 🐛 Debug Analysis\n\nI'm analyzing your code...\n\n### Tips\n1. Check variable names and scope\n2. Verify loop boundaries\n3. Test edge cases (empty input, null values)\n\n> 💡 *AI is temporarily rate-limited. Try again in a moment for detailed analysis.*`, model: 'demo-fallback' });
    }
});

// ─── GENERATE QUIZ ──────────────────────────────────────
router.post('/quiz', authMiddleware, async (req, res) => {
    try {
        const { topic, count = 5, difficulty = 'medium' } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const model = getGeminiModel();

        if (!model) {
            return res.json({
                success: true,
                response: `## Quiz: ${topic}\n\n**1.** What is the primary purpose of ${topic}?\n- A) To increase complexity\n- B) To solve problems efficiently ✅\n- C) To replace other methods\n- D) None of the above\n\n**2.** Which of the following is a key characteristic of ${topic}?\n- A) It is always slow\n- B) It is well-structured ✅\n- C) It cannot be learned\n- D) It has no real applications\n\n**3.** When should you use ${topic}?\n- A) Never\n- B) Only in interviews\n- C) When solving related problems ✅\n- D) Randomly\n\n---\n*Answers: 1-B, 2-B, 3-C*`,
                model: 'demo',
            });
        }

        const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.\n\nFormat:\n- Number each question\n- Provide 4 options (A, B, C, D)\n- Mark the correct answer with ✅\n- Add a brief explanation for the correct answer\n- Put all answers at the bottom\n\nMake questions that test real understanding, not just memorization.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ success: true, response, model: 'gemini-2.0-flash' });
    } catch (err) {
        console.error('AI Quiz error:', err?.status || err.message);
        const topic = req.body.topic;
        res.json({ success: true, response: `## Quiz: ${topic}\n\n**1.** What is the main purpose of ${topic}?\n- A) Increase complexity\n- B) Solve problems efficiently ✅\n- C) Replace existing methods\n- D) None of the above\n\n> 💡 *AI is temporarily rate-limited. Full quiz will be available shortly.*`, model: 'demo-fallback' });
    }
});

// ─── Demo response fallbacks ────────────────────────────
function getDemoResponse(message) {
    const lower = message.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "👋 Hello! I'm your AI Learning Tutor. I can help you with:\n\n- **Explaining concepts** in simple terms\n- **Debugging code** and finding bugs\n- **Generating quizzes** to test your knowledge\n- **Summarizing** study materials\n\nWhat would you like to learn about today?";
    }
    if (lower.includes('quiz') || lower.includes('test')) {
        return `## Quick Quiz: Programming Fundamentals\n\n**1.** What does a function do in programming?\n- A) Stores data permanently\n- B) Executes a reusable block of code ✅\n- C) Connects to the internet\n- D) Deletes files\n\n**2.** What is a variable?\n- A) A fixed constant\n- B) A named container for data ✅\n- C) A type of loop\n- D) A programming language\n\n**3.** What does "debugging" mean?\n- A) Adding more bugs\n- B) Finding and fixing errors ✅\n- C) Writing new code\n- D) Deleting the program\n\n---\n*Answers: 1-B, 2-B, 3-B*`;
    }
    if (lower.includes('python') || lower.includes('function') || lower.includes('loop')) {
        return `## Python Functions Explained 🐍\n\nA **function** is a reusable block of code that performs a specific task.\n\n### Analogy\nThink of a function like a **recipe** 🍳 — you define it once, and you can use it whenever you want without rewriting the steps.\n\n### Syntax\n\`\`\`python\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Using the function\nresult = greet("Alex")\nprint(result)  # Output: Hello, Alex!\n\`\`\`\n\n### Key Points\n- **\`def\`** keyword defines a function\n- **Parameters** go inside parentheses\n- **\`return\`** sends back a value\n- Functions make code **DRY** (Don't Repeat Yourself)\n\n> 💡 **Tip**: Start with simple functions, then learn about default parameters, *args, and **kwargs!`;
    }
    if (lower.includes('debug') || lower.includes('error') || lower.includes('bug') || lower.includes('fix')) {
        return `## 🐛 Debugging Tips\n\nDebugging is the process of finding and fixing errors in your code. Here's a systematic approach:\n\n### Step 1: Read the Error\nError messages tell you **what** went wrong and **where**. Always read them carefully!\n\n### Step 2: Reproduce the Bug\nMake sure you can consistently trigger the error.\n\n### Step 3: Isolate the Problem\n\`\`\`python\n# Use print statements to trace\nprint(f"Variable x = {x}")  # Check values\nprint("Reached this point")  # Check flow\n\`\`\`\n\n### Step 4: Fix & Test\nMake one change at a time and test after each fix.\n\n> 💡 **Pro tip**: Paste your buggy code and I'll help you find the issue!`;
    }

    return `Great question! Let me help you with that.\n\nI'm your AI Learning Tutor, and I can assist with:\n\n1. **📚 Concept Explanations** — Ask me to explain any topic\n2. **🐛 Code Debugging** — Paste your code and I'll find the bugs\n3. **📝 Quiz Generation** — Test your knowledge on any subject\n4. **📋 Summarization** — I'll condense long texts into key points\n\n> 💡 **Try asking**: "Explain recursion in simple terms" or "Generate a quiz on data structures"\n\n*Note: Connect a Gemini API key for full AI-powered responses. Currently running in demo mode.*`;
}

function getDemoExplanation(concept) {
    return `## ${concept}\n\n### Simple Definition\n**${concept}** is a fundamental concept in computing/learning that helps solve problems more effectively.\n\n### Real-World Analogy 🌍\nThink of ${concept} like organizing a library — it provides structure and makes information easier to find and use.\n\n### Explanation\n${concept} is important because it forms the building block for more advanced topics. Understanding it well will accelerate your learning in related areas.\n\nWhen you grasp ${concept}, you'll be able to:\n- Apply it to real-world problems\n- Build on it for advanced learning\n- Connect it to other concepts in your curriculum\n\n### Common Misconceptions ⚠️\n- It's NOT just theoretical — it has practical applications\n- It doesn't need to be perfect to be useful\n- Practice is more important than memorization\n\n> 💡 *Connect a Gemini API key for detailed, AI-generated explanations tailored to your level.*`;
}

export default router;
