const express = require('express');
const router = express.Router();
const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');
const { protect } = require('../middleware/auth');

// @desc    Submit an adoption request
// @route   POST /api/requests
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { petId, pickupDate, message } = req.body;

    if (!petId || !pickupDate || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // 1. Pet owners cannot request adoption for their own pet
    if (pet.ownerEmail === req.user.email) {
      return res.status(400).json({ success: false, message: 'Owners are not allowed to submit adoption requests for their own pets' });
    }

    // 2. Prevent requests if pet is already adopted
    if (pet.status === 'adopted') {
      return res.status(400).json({ success: false, message: 'This pet has already been adopted' });
    }

    // 3. Prevent duplicate requests from the same user
    const existingRequest = await AdoptionRequest.findOne({
      petId,
      requesterEmail: req.user.email,
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending adoption request for this pet' });
    }

    const request = await AdoptionRequest.create({
      petId,
      petName: pet.name,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      ownerEmail: pet.ownerEmail,
      pickupDate,
      message,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Adoption request submitted successfully', data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get requests made by current logged-in user
// @route   GET /api/requests/my-requests
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ requesterEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get requests received for owner's pets or specific pet listing
// @route   GET /api/requests/pet-requests/:petId
// @access  Private
router.get('/pet-requests/:petId', protect, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Check ownership
    if (pet.ownerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to view requests for this pet' });
    }

    const requests = await AdoptionRequest.find({ petId: req.params.petId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all requests received for all listings owned by the logged-in user
// @route   GET /api/requests/received
// @access  Private
router.get('/received', protect, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Approve or Reject adoption request
// @route   PUT /api/requests/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Adoption request not found' });
    }

    // Verify ownership of the pet
    if (request.ownerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this request' });
    }

    const pet = await Pet.findById(request.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // If approving, make sure pet is still available
    if (status === 'approved') {
      if (pet.status === 'adopted') {
        return res.status(400).json({ success: false, message: 'This pet has already been adopted' });
      }

      // Mark request as approved
      request.status = 'approved';
      await request.save();

      // Mark pet as adopted
      pet.status = 'adopted';
      await pet.save();

      // Automatically reject all other pending requests for this pet
      await AdoptionRequest.updateMany(
        { petId: request.petId, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected' }
      );
    } else {
      // Rejection
      request.status = 'rejected';
      await request.save();
    }

    res.status(200).json({ success: true, message: `Request successfully ${status}`, data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Cancel/Delete adoption request
// @route   DELETE /api/requests/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Adoption request not found' });
    }

    // Verify if requester is the owner of the request
    if (request.requesterEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    // Delete request
    await AdoptionRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Adoption request cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
