import Branch from '../models/Branch.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';

const getBranchLookupQuery = (branchParamId) => {
  if (mongoose.Types.ObjectId.isValid(branchParamId)) {
    return { _id: branchParamId };
  }
  return { id: branchParamId };
};

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 }).lean();
    const users = await User.find({
      role: { $in: ['manager', 'BRANCH_MANAGER'] }
    })
      .select('name email branchId branch branchName role')
      .lean();

    // Debug mapping data to verify branch-manager linkage.
    console.log(users);
    console.log(branches);

    const managersByBranchId = new Map();
    const managersByBranchObjectId = new Map();
    const managersByBranchName = new Map();

    for (const user of users) {
      if (user?.branchId) {
        managersByBranchId.set(String(user.branchId), user);
      }
      if (user?.branch) {
        managersByBranchObjectId.set(String(user.branch), user);
      }
      if (user?.branchName) {
        managersByBranchName.set(String(user.branchName).trim().toLowerCase(), user);
      }
    }

    const updatedBranches = branches.map((branch) => {
      const manager =
        managersByBranchId.get(String(branch.id)) ||
        managersByBranchObjectId.get(String(branch._id)) ||
        managersByBranchName.get(String(branch.name).trim().toLowerCase());

      return {
        ...branch,
        managerName: manager ? manager.name : 'Unassigned',
        managerEmail: manager ? manager.email : '',
        // Keep legacy "manager" key for existing UI compatibility.
        manager: manager ? manager.name : (branch.manager || 'Unassigned')
      };
    });

    res.status(200).json(updatedBranches);
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

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, manager } = req.body;
    const lookup = getBranchLookupQuery(id);

    const updated = await Branch.findOneAndUpdate(
      lookup,
      { name, location, manager },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const lookup = getBranchLookupQuery(id);
    const branch = await Branch.findOne(lookup).lean();
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const activeInventoryCount = await Inventory.countDocuments({ branchId: branch.id });
    if (activeInventoryCount > 0) {
      return res.status(400).json({ message: 'Cannot delete branch with active inventory' });
    }

    await Branch.deleteOne({ _id: branch._id });

    res.status(200).json({ message: 'Branch deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
