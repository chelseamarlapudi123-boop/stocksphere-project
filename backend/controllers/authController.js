import User from '../models/User.js';
import Branch from '../models/Branch.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const normalizeRole = (role) => {
  if (!role) return role;
  if (role === 'BRANCH_MANAGER') return 'manager';
  if (role === 'ADMIN') return 'admin';
  return String(role).toLowerCase();
};

const isBranchManager = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'manager' || role === 'BRANCH_MANAGER';
};

const attachBranchDetails = async (userDoc) => {
  const userObj = userDoc.toObject();
  const { password: _, ...safeUser } = userObj;

  if (!isBranchManager(safeUser.role)) {
    return safeUser;
  }

  let branch = null;
  if (safeUser.branchId) {
    branch = await Branch.findOne({ id: safeUser.branchId }).lean();
  }
  if (!branch && safeUser.branchName) {
    branch = await Branch.findOne({ name: safeUser.branchName }).lean();
  }
  if (!branch && safeUser.branch) {
    branch = await Branch.findById(safeUser.branch).lean();
  }

  safeUser.branch = branch
    ? { name: branch.name, location: branch.location }
    : null;
  return safeUser;
};

export const register = async (req, res) => {
  const { name, email, password, role, branchId } = req.body;
  const normalizedRole = normalizeRole(role || 'manager');
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // Password hashing is handled by User model pre-save hook
      role: normalizedRole,
      branchId: normalizedRole === 'manager' ? branchId : undefined,
      status: 'active'
    });
    
    await newUser.save();
    
    const userObj = await attachBranchDetails(newUser);
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  const normalizedRole = normalizeRole(role);
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (normalizedRole && user.role !== normalizedRole) {
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

    const userObj = await attachBranchDetails(user);
    res.status(200).json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};
