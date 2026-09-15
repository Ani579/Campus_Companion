import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from './User.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const normalizeEmail = (email) => email?.trim().toLowerCase();

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const sendEmailOtp = async (email, otp) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Campus Companion password reset code',
    text: `Your Campus Companion password reset code is ${otp}. It expires in 10 minutes.`,
  });
};

const sendSmsOtp = async (phone, otp) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    throw new Error('SMS delivery is not configured. Set the Twilio environment variables.');
  }

  const { default: twilio } = await import('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your Campus Companion password reset code is ${otp}. It expires in 10 minutes.`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email: normalizedEmail, phone: phone?.trim(), password: hashedPassword });

    if (user) {
      res.status(201).json({
        _id: user.id, name: user.name, email: user.email, token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = (identifier || email)?.trim();
    const user = await User.findOne({
      $or: [
        { email: normalizeEmail(loginIdentifier) },
        { phone: loginIdentifier },
      ],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id, name: user.name, email: user.email, token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier, channel = 'email' } = req.body;
    const normalizedIdentifier = identifier?.trim();
    const query = channel === 'sms'
      ? { phone: normalizedIdentifier }
      : { email: normalizeEmail(normalizedIdentifier) };
    const user = await User.findOne(query);

    if (user) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      user.resetOtpHash = hashOtp(otp);
      user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.resetOtpAttempts = 0;
      await user.save();

      if (channel === 'sms') await sendSmsOtp(user.phone, otp);
      else await sendEmailOtp(user.email, otp);
    }

    res.json({ message: 'If an account matches that information, a verification code has been sent.' });
  } catch (err) {
    res.status(503).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, channel = 'email', otp, newPassword } = req.body;
    if (!otp || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Enter a valid code and a password with at least 6 characters.' });
    }

    const query = channel === 'sms'
      ? { phone: identifier?.trim() }
      : { email: normalizeEmail(identifier) };
    const user = await User.findOne(query);
    const isValidOtp = user
      && user.resetOtpHash
      && user.resetOtpExpires > new Date()
      && user.resetOtpAttempts < 5
      && hashOtp(otp.trim()) === user.resetOtpHash;

    if (!isValidOtp) {
      if (user) {
        user.resetOtpAttempts += 1;
        await user.save();
      }
      return res.status(400).json({ message: 'The code is invalid or expired.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    await user.save();
    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
