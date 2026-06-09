import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { getMockUsers } from '../config/mockData';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'reader' | 'author' | 'admin' | 'superadmin';
    isSubscribed: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-deven-blogs';

// Middleware to verify JWT token
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Mock token shortcut for development fallback authentication
  if (token.startsWith('mock-token-')) {
    const rawSuffix = token.replace('mock-token-', '');
    const mockUsers = getMockUsers();
    const validRoles = ['reader', 'author', 'admin', 'superadmin'];

    const matchedUser = mockUsers.find(
      (u: any) => u.id === rawSuffix || u.id === `mock-user-id-${rawSuffix}` || u.role === rawSuffix
    );

    if (matchedUser) {
      req.user = {
        id: matchedUser.id,
        email: matchedUser.email,
        role: matchedUser.role,
        isSubscribed: matchedUser.isSubscribed,
      };
      next();
      return;
    }

    const assignedRole = (validRoles.includes(rawSuffix) ? rawSuffix : 'reader') as 'reader' | 'author' | 'admin' | 'superadmin';
    req.user = {
      id: `mock-user-id-${assignedRole}`,
      email: `mock-${assignedRole}@deven.io`,
      role: assignedRole,
      isSubscribed: assignedRole !== 'reader',
    };
    next();
    return;
  }

  // Handle JWT token verification in MOCK_MODE (checking in-memory users)
  if (process.env.MOCK_MODE === 'true') {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: any };
      const mockUsers = getMockUsers();
      const user = mockUsers.find((u: any) => u.id === decoded.id);
      if (!user) {
        res.status(401).json({ message: 'User no longer exists in mock database' });
        return;
      }
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
      };
      next();
      return;
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: any };
    
    // Fetch user details to verify subscription status and latest role
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'User no longer exists' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isSubscribed: user.isSubscribed,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to enforce specific roles
export const requireRoles = (allowedRoles: ('reader' | 'author' | 'admin' | 'superadmin')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();
  };
};
