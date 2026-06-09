import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { getMockUsers, addMockUser } from '../config/mockData';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-deven-blogs';

// Helper to generate referral code
const generateReferralCode = (name: string): string => {
  const prefix = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randNum}`;
};

// SIGNUP
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, referredBy } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }

    const referralCode = generateReferralCode(name);

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      if (mockUsers.some(u => u.email === email.toLowerCase())) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }

      const mockId = `mock-user-id-${Date.now()}`;
      const newMockUser = {
        id: mockId,
        name,
        email: email.toLowerCase(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        role: 'reader' as const,
        streakCount: 0,
        referralCode,
        referredBy,
        referredCount: 0,
        isSubscribed: false,
        readingHistory: [],
        bookmarks: [],
      };

      addMockUser(newMockUser);

      // Handle referral credits if referredBy code is valid
      if (referredBy) {
        const referrer = mockUsers.find(u => u.referralCode === referredBy);
        if (referrer) {
          referrer.referredCount += 1;
        }
      }

      const token = jwt.sign({ id: mockId, email: newMockUser.email, role: newMockUser.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({
        token,
        user: { id: mockId, name, email, role: 'reader', isSubscribed: false, referralCode, completedOnboarding: false, onboardingCompleted: false }
      });
      return;
    }

    // Real DB Mode
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: 'reader',
      referralCode,
      referredBy,
    });

    if (referredBy) {
      await User.findOneAndUpdate({ referralCode: referredBy }, { $inc: { referredCount: 1 } });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
        referralCode: user.referralCode,
        completedOnboarding: user.completedOnboarding ?? false,
        onboardingCompleted: user.onboardingCompleted ?? false,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: (error as Error).message });
  }
});

// LOGIN
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const mockUser = mockUsers.find(u => u.email === email.toLowerCase());

      if (!mockUser) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Simple mock password validation (accept anything in mock mode for simplicity)
      const token = jwt.sign({ id: mockUser.id, email: mockUser.email, role: mockUser.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({
        token,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isSubscribed: mockUser.isSubscribed,
          referralCode: mockUser.referralCode,
          avatar: mockUser.avatar,
          completedOnboarding: mockUser.completedOnboarding ?? false,
          onboardingCompleted: mockUser.onboardingCompleted ?? false
        }
      });
      return;
    }

    // Real DB Mode
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
        referralCode: user.referralCode,
        avatar: user.avatar,
        completedOnboarding: user.completedOnboarding ?? false,
        onboardingCompleted: user.onboardingCompleted ?? false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: (error as Error).message });
  }
});

// GOOGLE AUTHENTICATION SIMULATION
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email || !name) {
      res.status(400).json({ message: 'Google auth credentials missing' });
      return;
    }

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      let mockUser = mockUsers.find(u => u.email === email.toLowerCase());

      if (!mockUser) {
        const mockId = `mock-user-id-${Date.now()}`;
        mockUser = {
          id: mockId,
          name,
          email: email.toLowerCase(),
          avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          role: 'reader',
          streakCount: 0,
          referralCode: generateReferralCode(name),
          referredCount: 0,
          isSubscribed: false,
          readingHistory: [],
          bookmarks: [],
        };
        addMockUser(mockUser);
      }

      const token = jwt.sign({ id: mockUser.id, email: mockUser.email, role: mockUser.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({
        token,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isSubscribed: mockUser.isSubscribed,
          referralCode: mockUser.referralCode,
          avatar: mockUser.avatar,
          completedOnboarding: mockUser.completedOnboarding ?? false,
          onboardingCompleted: mockUser.onboardingCompleted ?? false
        }
      });
      return;
    }

    // Real DB Mode
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        googleId,
        role: 'reader',
        referralCode: generateReferralCode(name),
      });
    } else if (googleId && !user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
        referralCode: user.referralCode,
        avatar: user.avatar,
        completedOnboarding: user.completedOnboarding ?? false,
        onboardingCompleted: user.onboardingCompleted ?? false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed', error: (error as Error).message });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  // Mimic password reset instructions email
  res.json({ message: `Password reset instructions sent to ${email || 'your email'}` });
});

export default router;
