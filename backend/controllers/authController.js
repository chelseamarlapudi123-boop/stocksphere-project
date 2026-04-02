import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password, role, branchId } = req.body;
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // Password hashing is handled by User model pre-save hook
      role: role || 'manager',
      branchId: role === 'manager' ? branchId : undefined,
      status: 'active'
    });
    
    await newUser.save();
    
    const { password: _, ...userObj } = newUser.toObject();
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: 'Selected role does not match this account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status !== 'active') {
       return res.status(403).json({ message: 'Your account is disabled.' });
    }

    const token = typeof jwt.sign === 'function' && process.env.JWT_SECRET 
       ? jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }) 
       : `stocksphere-token-${user._id}-${Date.now()}`;

    const { password: _, ...userObj } = user.toObject();
    res.status(200).json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};
