import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-learning-os-secret-key-change-in-production';

// In-memory user store for serverless (demo purposes)
const users = new Map();
const otpStore = new Map();

function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const action = pathname.replace('/api/auth/', '').replace('/api/auth', '');

    try {
        // ─── SIGNUP ───
        if (action === 'signup' && req.method === 'POST') {
            const { email, password, name, phone } = req.body;
            if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
            if (users.has(email)) return res.status(409).json({ success: false, error: 'Email already registered' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = { id: generateId(), email, name: name || email.split('@')[0], phone: phone || '', password: hashedPassword, goal: '', createdAt: new Date().toISOString() };
            users.set(email, user);

            const token = generateToken(user);
            return res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, goal: user.goal } });
        }

        // ─── LOGIN ───
        if (action === 'login' && req.method === 'POST') {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

            const user = users.get(email);
            if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

            const token = generateToken(user);
            return res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, goal: user.goal } });
        }

        // ─── SEND OTP ───
        if (action === 'send-otp' && req.method === 'POST') {
            const { phone } = req.body;
            if (!phone) return res.status(400).json({ success: false, error: 'Phone number required' });

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

            return res.json({ success: true, message: 'OTP sent', demo_otp: otp });
        }

        // ─── VERIFY OTP ───
        if (action === 'verify-otp' && req.method === 'POST') {
            const { phone, otp } = req.body;
            const stored = otpStore.get(phone);
            if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
                return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
            }
            otpStore.delete(phone);

            // Find or create user by phone
            let user = [...users.values()].find(u => u.phone === phone);
            if (!user) {
                user = { id: generateId(), email: `${phone}@otp.user`, name: `User ${phone.slice(-4)}`, phone, password: '', goal: '', createdAt: new Date().toISOString() };
                users.set(user.email, user);
            }

            const token = generateToken(user);
            return res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, goal: user.goal } });
        }

        // ─── GOOGLE AUTH ───
        if (action === 'google' && req.method === 'POST') {
            const { email, name } = req.body;
            let user = users.get(email);
            if (!user) {
                user = { id: generateId(), email, name: name || 'Google User', phone: '', password: '', goal: '', createdAt: new Date().toISOString() };
                users.set(email, user);
            }
            const token = generateToken(user);
            return res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, goal: user.goal } });
        }

        // ─── GET PROFILE ───
        if (action === 'me' && req.method === 'GET') {
            const authHeader = req.headers.authorization;
            const token = authHeader?.replace('Bearer ', '');
            const decoded = verifyToken(token);
            if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });

            const user = [...users.values()].find(u => u.id === decoded.id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            return res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, goal: user.goal } });
        }

        // ─── UPDATE PROFILE ───
        if (action === 'me' && req.method === 'PUT') {
            const authHeader = req.headers.authorization;
            const token = authHeader?.replace('Bearer ', '');
            const decoded = verifyToken(token);
            if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });

            const user = [...users.values()].find(u => u.id === decoded.id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            const { name, goal } = req.body;
            if (name) user.name = name;
            if (goal) user.goal = goal;

            return res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, goal: user.goal } });
        }

        // ─── LOGOUT ───
        if (action === 'logout' && req.method === 'POST') {
            return res.json({ success: true });
        }

        return res.status(404).json({ success: false, error: 'Not found' });
    } catch (err) {
        console.error('Auth API error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
