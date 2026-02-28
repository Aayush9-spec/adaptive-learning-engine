import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';

const router = Router();

// ─── SIGNUP ─────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, goal } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, error: 'Valid email is required' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
        if (existingEmail) {
            return res.status(409).json({ success: false, error: 'An account with this email already exists' });
        }

        if (phone) {
            const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
            if (existingPhone) {
                return res.status(409).json({ success: false, error: 'An account with this phone number already exists' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userId = uuidv4();
        db.prepare(`
      INSERT INTO users (id, name, email, phone, password, goal)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name.trim(), email.toLowerCase().trim(), phone || null, hashedPassword, goal || null);

        // Generate token
        const user = { id: userId, email: email.toLowerCase().trim(), name: name.trim() };
        const token = generateToken(user);

        console.log(`✅ New user registered: ${email}`);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: userId,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone || null,
                goal: goal || null,
            },
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
});

// ─── LOGIN (Email + Password) ───────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user);

        console.log(`✅ User logged in: ${email}`);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                goal: user.goal,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

// ─── SEND OTP ───────────────────────────────────────────
router.post('/send-otp', (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.length < 10) {
            return res.status(400).json({ success: false, error: 'Valid phone number is required' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Invalidate old OTPs for this phone
        db.prepare('UPDATE otp_codes SET used = 1 WHERE phone = ? AND used = 0').run(phone);

        // Store new OTP
        db.prepare('INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)').run(phone, otp, expiresAt);

        console.log(`📱 OTP sent to ${phone}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            // In production, remove this — OTP would be sent via SMS (Twilio, etc.)
            // For demo: returning OTP so it can be auto-filled
            demo_otp: otp,
        });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
});

// ─── VERIFY OTP ─────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
        }

        // Find valid OTP
        const otpRecord = db.prepare(`
      SELECT * FROM otp_codes
      WHERE phone = ? AND code = ? AND used = 0 AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1
    `).get(phone, otp, Date.now());

        if (!otpRecord) {
            return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(otpRecord.id);

        // Find or create user by phone
        let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

        if (!user) {
            // Auto-create user for phone login
            const userId = uuidv4();
            const tempPassword = await bcrypt.hash(uuidv4(), 10);
            db.prepare(`
        INSERT INTO users (id, name, email, phone, password)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, 'Learner', `phone_${phone}@ailearningos.app`, phone, tempPassword);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
            console.log(`✅ New phone user created: ${phone}`);
        }

        // Generate token
        const token = generateToken(user);

        console.log(`✅ OTP verified for: ${phone}`);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                goal: user.goal,
            },
        });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ success: false, error: 'Failed to verify OTP' });
    }
});

// ─── GOOGLE AUTH (Simulated) ────────────────────────────
router.post('/google', async (req, res) => {
    try {
        const { email, name } = req.body;

        const googleEmail = email || 'user@gmail.com';
        const googleName = name || 'Google User';

        // Find existing user
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(googleEmail.toLowerCase().trim());

        if (!user) {
            // Create new user
            const userId = uuidv4();
            const tempPassword = await bcrypt.hash(uuidv4(), 10);
            db.prepare(`
        INSERT INTO users (id, name, email, password, goal)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, googleName, googleEmail.toLowerCase().trim(), tempPassword, 'Coding & Development');
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
            console.log(`✅ New Google user created: ${googleEmail}`);
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                goal: user.goal,
            },
        });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ success: false, error: 'Google auth failed' });
    }
});

// ─── GET CURRENT USER ───────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email, phone, goal, avatar, created_at FROM users WHERE id = ?').get(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

// ─── UPDATE PROFILE ─────────────────────────────────────
router.put('/me', authMiddleware, (req, res) => {
    try {
        const { name, goal, avatar } = req.body;
        const updates = [];
        const values = [];

        if (name) { updates.push('name = ?'); values.push(name.trim()); }
        if (goal) { updates.push('goal = ?'); values.push(goal); }
        if (avatar) { updates.push('avatar = ?'); values.push(avatar); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        updates.push("updated_at = datetime('now')");
        values.push(req.user.id);

        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        const user = db.prepare('SELECT id, name, email, phone, goal, avatar FROM users WHERE id = ?').get(req.user.id);

        res.json({ success: true, user });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

// ─── LOGOUT ─────────────────────────────────────────────
router.post('/logout', authMiddleware, (req, res) => {
    // In a production system, you'd blacklist the token or delete the session
    console.log(`👋 User logged out: ${req.user.email}`);
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
