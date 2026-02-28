import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-learning-os-secret-key-change-in-production';

// Prisma singleton to avoid connection exhaustion in serverless
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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

function sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
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
            const { email, password, name, phone, goal } = req.body;
            if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) return res.status(409).json({ success: false, error: 'Email already registered' });

            const existingPhone = phone ? await prisma.user.findUnique({ where: { phone } }) : null;
            if (existingPhone && phone) return res.status(409).json({ success: false, error: 'Phone already registered' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    phone: phone || null,
                    password: hashedPassword,
                    goal: goal || null,
                }
            });

            const token = generateToken(user);
            return res.status(201).json({ success: true, token, user: sanitizeUser(user) });
        }

        // ─── LOGIN ───
        if (action === 'login' && req.method === 'POST') {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !user.password) return res.status(401).json({ success: false, error: 'Invalid credentials' });

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

            const token = generateToken(user);
            return res.json({ success: true, token, user: sanitizeUser(user) });
        }

        // ─── SEND OTP ───
        if (action === 'send-otp' && req.method === 'POST') {
            const { phone } = req.body;
            if (!phone) return res.status(400).json({ success: false, error: 'Phone number required' });

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

            await prisma.otpVerification.upsert({
                where: { phone },
                update: { otp, expiresAt },
                create: { phone, otp, expiresAt },
            });

            return res.json({ success: true, message: 'OTP sent', demo_otp: otp });
        }

        // ─── VERIFY OTP ───
        if (action === 'verify-otp' && req.method === 'POST') {
            const { phone, otp } = req.body;

            const stored = await prisma.otpVerification.findUnique({ where: { phone } });
            if (!stored || stored.otp !== otp || new Date() > stored.expiresAt) {
                return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
            }

            await prisma.otpVerification.delete({ where: { phone } });

            // Find or create user by phone
            let user = await prisma.user.findUnique({ where: { phone } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: `${phone}@otp.user`,
                        name: `User ${phone.slice(-4)}`,
                        phone,
                        password: '', // No password for OTP users
                        goal: null,
                    }
                });
            }

            const token = generateToken(user);
            return res.json({ success: true, token, user: sanitizeUser(user) });
        }

        // ─── GOOGLE AUTH ───
        if (action === 'google' && req.method === 'POST') {
            const { email, name } = req.body;
            if (!email) return res.status(400).json({ success: false, error: 'Email required for Google auth' });

            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: name || 'Google User',
                        phone: null,
                        password: '', // OAuth users don't have passwords
                        goal: null,
                    }
                });
            }

            const token = generateToken(user);
            return res.json({ success: true, token, user: sanitizeUser(user) });
        }

        // ─── GET PROFILE ───
        if (action === 'me' && req.method === 'GET') {
            const authHeader = req.headers.authorization;
            const token = authHeader?.replace('Bearer ', '');
            const decoded = verifyToken(token);
            if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });

            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            return res.json({ success: true, user: sanitizeUser(user) });
        }

        // ─── UPDATE PROFILE ───
        if (action === 'me' && req.method === 'PUT') {
            const authHeader = req.headers.authorization;
            const token = authHeader?.replace('Bearer ', '');
            const decoded = verifyToken(token);
            if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });

            const { name, goal } = req.body;
            const updatedUser = await prisma.user.update({
                where: { id: decoded.id },
                data: {
                    ...(name && { name }),
                    ...(goal && { goal }),
                }
            });

            return res.json({ success: true, user: sanitizeUser(updatedUser) });
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
