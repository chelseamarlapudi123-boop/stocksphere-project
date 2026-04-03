import Branch from '../models/Branch.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBranch = async (req, res) => {
  try {
    const { name, location, manager } = req.body;
    // Generate a simple short id for branch (used as branchId in inventory)
    const id = `b${Date.now()}`;
    const branch = new Branch({ id, name, location, manager: manager || 'Unassigned' });
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
