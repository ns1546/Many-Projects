import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin';

export const verifyToken = async (token: string) => {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    // Return payload matching our expected format
    return {
      id: decoded.uid,
      name: decoded.name || decoded.email?.split('@')[0] || 'User',
      role: 'admin', // Demo mode: Grant admin access to all logged-in users so you can test it
      email: decoded.email
    };
  } catch (error) {
    console.warn('Token verification failed:', error);
    return null;
  }
};

export const getUserFromRequest = async (req: NextRequest) => {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return await verifyToken(token);
};
