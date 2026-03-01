import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-learning-os-secret-key-change-in-production';
const MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
let currentModelIndex = 0;

function getGeminiModel() {
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    apiKey = apiKey.replace(/\\n/g, '').trim();
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: MODEL_CHAIN[currentModelIndex] || MODEL_CHAIN[0] });
}

function getModelName() {
    return MODEL_CHAIN[currentModelIndex] || MODEL_CHAIN[0];
}

function rotateModel() {
    currentModelIndex = (currentModelIndex + 1) % MODEL_CHAIN.length;
}

function verifyToken(token) {
    try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

const TUTOR_SYSTEM_PROMPT = `You are an AI Learning Tutor for "AI Learning OS" — an adaptive learning platform.

Your Role:
- You're a friendly, encouraging, and knowledgeable tutor
- You explain concepts clearly with examples and analogies
- You adapt explanations to the student's level
- You can help with: explaining concepts, debugging code, generating quizzes, summarizing content

Formatting Guidelines:
- Use markdown formatting (headers, bold, code blocks, lists)
- Keep responses concise but thorough
- Use emojis sparingly for friendliness
- For code, always use proper syntax highlighting with language tags
- For quizzes, use clear question/answer format with ✅ for correct answers`;

function getDemoResponse(message) {
    const lower = (message || '').toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return '👋 Hello! I\'m your AI Learning Tutor. I can help you with:\n\n- **Explaining concepts** in simple terms\n- **Debugging code** and finding bugs\n- **Generating quizzes** to test your knowledge\n- **Summarizing** complex topics\n\nWhat would you like to learn today?';
    }
    if (lower.includes('quiz')) {
        return '## 📝 Quick Quiz: Programming Basics\n\n**1.** What does HTML stand for?\n- A) Hyper Text Markup Language ✅\n- B) High Tech Modern Language\n- C) Hyper Transfer Markup Language\n\n**2.** Which is NOT a programming language?\n- A) Python\n- B) HTML ✅\n- C) JavaScript\n\n> 💡 HTML is a *markup language*, not a programming language!';
    }
    if (lower.includes('python') || lower.includes('code') || lower.includes('function')) {
        return '## Python Functions Explained 🐍\n\nA **function** is a reusable block of code that performs a specific task.\n\n### Syntax\n```python\ndef greet(name):\n    return f"Hello, {name}!"\n\nresult = greet("Alex")\nprint(result)  # Output: Hello, Alex!\n```\n\n### Key Points\n- **`def`** keyword defines a function\n- **Parameters** go inside parentheses\n- **`return`** sends back a value\n- Functions make code **DRY** (Don\'t Repeat Yourself)\n\n> 💡 **Tip**: Start with simple functions, then learn about default parameters, *args, and **kwargs!';
    }
    if (lower.includes('debug') || lower.includes('error') || lower.includes('bug')) {
        return '## 🐛 Debugging Tips\n\n1. **Read the error message** carefully — it tells you the line number and type\n2. **Check variable names** — typos are the #1 cause of bugs\n3. **Use print statements** to trace values\n4. **Check edge cases** — empty lists, None values, zero division\n5. **Rubber duck debugging** — explain your code step by step\n\n> 💡 Paste your code here and I\'ll help find the bug!';
    }
    return 'Great question! Let me help you with that.\n\nI\'m your AI Learning Tutor, and I can assist with:\n\n1. **📚 Concept Explanations** — Ask me to explain any topic\n2. **🐛 Code Debugging** — Paste your code and I\'ll find the bugs\n3. **📝 Quiz Generation** — Test your knowledge on any subject\n4. **📋 Summarization** — I\'ll condense long texts into key points\n\n> 💡 **Try asking**: "Explain recursion in simple terms" or "Generate a quiz on JavaScript"';
}

function getDemoExplanation(concept) {
    return `## ${concept}\n\nLet me explain **${concept}** in simple terms:\n\n### What is it?\n${concept} is a fundamental concept that helps you build stronger foundations in your learning journey.\n\n### Key Points\n1. Understanding the basics is crucial\n2. Practice with examples\n3. Build projects to solidify knowledge\n\n> 💡 *Try asking me to explain a specific aspect of ${concept}!*`;
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    // Auth check
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const action = pathname.replace('/api/ai/', '').replace('/api/ai', '');

    try {
        const model = getGeminiModel();

        // ─── CHAT ───
        if (action === 'chat') {
            const { message, history, systemPrompt } = req.body;
            if (!message) return res.status(400).json({ success: false, error: 'Message required' });

            if (!model) {
                return res.json({ success: true, response: getDemoResponse(message), model: 'demo-fallback' });
            }

            const activeSystemPrompt = systemPrompt || TUTOR_SYSTEM_PROMPT;

            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: 'System instructions: ' + activeSystemPrompt }] },
                    { role: 'model', parts: [{ text: 'Understood! I\'m ready to help.' }] },
                    ...(history || []).slice(-6).map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
                ],
            });

            const result = await chat.sendMessage(message);
            return res.json({ success: true, response: result.response.text(), model: getModelName() });
        }

        // ─── EXPLAIN ───
        if (action === 'explain') {
            const { concept, level } = req.body;
            if (!concept) return res.status(400).json({ success: false, error: 'Concept required' });

            if (!model) return res.json({ success: true, response: getDemoExplanation(concept), model: 'demo-fallback' });

            const prompt = `Explain "${concept}" at a ${level || 'beginner'} level. Use markdown formatting, examples, and analogies.`;
            const result = await model.generateContent(prompt);
            return res.json({ success: true, response: result.response.text(), model: getModelName() });
        }

        // ─── SUMMARIZE ───
        if (action === 'summarize') {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, error: 'Text required' });

            if (!model) return res.json({ success: true, response: `## Summary\n\nKey points identified and organized.\n\n> 💡 *AI is in demo mode.*`, model: 'demo-fallback' });

            const result = await model.generateContent(`Summarize the following text concisely with bullet points:\n\n${text}`);
            return res.json({ success: true, response: result.response.text(), model: getModelName() });
        }

        // ─── DEBUG ───
        if (action === 'debug') {
            const { code, language, error } = req.body;
            if (!code) return res.status(400).json({ success: false, error: 'Code required' });

            if (!model) return res.json({ success: true, response: `## 🐛 Debug Analysis\n\n1. Check variable names and scope\n2. Verify loop boundaries\n3. Test edge cases\n\n> 💡 *AI is in demo mode.*`, model: 'demo-fallback' });

            const prompt = `Debug this ${language || ''} code. Find bugs, explain them, and provide fixed code:\n\n\`\`\`${language || ''}\n${code}\n\`\`\`${error ? '\n\nError: ' + error : ''}`;
            const result = await model.generateContent(prompt);
            return res.json({ success: true, response: result.response.text(), model: getModelName() });
        }

        // ─── QUIZ ───
        if (action === 'quiz') {
            const { topic, count } = req.body;
            if (!topic) return res.status(400).json({ success: false, error: 'Topic required' });

            if (!model) return res.json({ success: true, response: `## Quiz: ${topic}\n\n**1.** What is the main purpose of ${topic}?\n- A) Increase complexity\n- B) Solve problems efficiently ✅\n- C) Replace existing methods\n\n> 💡 *AI is in demo mode.*`, model: 'demo-fallback' });

            const prompt = `Generate a ${count || 5}-question multiple choice quiz on "${topic}". Mark correct answers with ✅. Use markdown.`;
            const result = await model.generateContent(prompt);
            return res.json({ success: true, response: result.response.text(), model: getModelName() });
        }

        return res.status(404).json({ success: false, error: 'Not found' });
    } catch (err) {
        console.error('AI API error details:', err);
        if (err?.status === 429) rotateModel();

        // Fallback
        const { message, concept, topic } = req.body;
        const fallback = message ? getDemoResponse(message) : concept ? getDemoExplanation(concept) : `Temporary response for ${topic || 'your query'}. AI will be available shortly.`;
        return res.json({ success: true, response: fallback, model: 'demo-fallback' });
    }
}
