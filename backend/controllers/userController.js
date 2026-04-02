import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const addUser = async (req, res) => {
  const { name, email, password, role, branchId } = req.body;
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // Pre-save hook handles hashing
      role,
      branchId: role === 'manager' ? branchId : undefined,
      status: 'active'
    });
    
    await newUser.save();
    
    const { password: _, ...userObj } = newUser.toObject();
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, branchId, status } = req.body;

  try {
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email.toLowerCase();
    if (role) userToUpdate.role = role;
    if (status) userToUpdate.status = status;
    
    if (userToUpdate.role === 'manager') {
      userToUpdate.branchId = branchId || userToUpdate.branchId;
    } else {
      userToUpdate.branchId = undefined;
    }

    await userToUpdate.save();

    const { password: _, ...userObj } = userToUpdate.toObject();
    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    const { password: _, ...userObj } = user.toObject();
    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling user status', error: error.message });
  }
};

export const syncUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        role,
        password: password || 'sync_password',
        status: 'active'
      });
      await user.save();
    }
    
    const { password: _, ...userObj } = user.toObject();
    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing user', error: error.message });
  }
};
