const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Get all messages for a booking
// @route   GET /api/messages/:bookingId
// @access  Protected (Customer/Owner)
exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user
    if (booking.customer.toString() !== req.user.id && booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access messages for this booking' });
    }

    const messages = await Message.find({ booking: bookingId })
      .populate('sender', 'name role avatar')
      .sort('createdAt');

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message (text or action) in a booking
// @route   POST /api/messages/:bookingId
// @access  Protected (Customer/Owner)
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content, type, meta } = req.body;

    const booking = await Booking.findById(bookingId).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user
    if (booking.customer.toString() !== req.user.id && booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this booking' });
    }

    const message = await Message.create({
      booking: bookingId,
      sender: req.user.id,
      content,
      type: type || 'text',
      meta
    });

    const populatedMessage = await message.populate('sender', 'name role avatar');

    // Broadcast via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(bookingId).emit('message:received', populatedMessage);
    }

    // Create notification for recipient
    const recipientId = booking.customer.toString() === req.user.id ? booking.owner : booking.customer;
    try {
      await Notification.create({
        user: recipientId,
        title: `Message from ${req.user.name}`,
        message: content.length > 50 ? `${content.substring(0, 50)}...` : content,
        type: 'chat',
        link: '/dashboard'
      });
    } catch (err) {
      console.error('Failed to create chat notification:', err);
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update handover checklist details
// @route   PUT /api/messages/:bookingId/handover
// @access  Protected (Customer/Owner)
exports.updateHandover = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { handoverDetails } = req.body;

    const booking = await Booking.findById(bookingId).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user
    if (booking.customer.toString() !== req.user.id && booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update handover checklist' });
    }

    // Apply updates to handoverDetails object
    if (handoverDetails) {
      booking.handoverDetails = {
        ...booking.handoverDetails,
        ...handoverDetails
      };
    }

    // Business Logic: If handover is fully complete, transition booking status to 'active' automatically
    if (booking.handoverDetails.handoverCompleted && booking.status === 'confirmed') {
      booking.status = 'active';
    }

    await booking.save();

    // Broadcast updated booking state via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(bookingId).emit('handover:updated', booking);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update vehicle damage inspection pins
// @route   PUT /api/messages/:bookingId/damage-pins
// @access  Protected (Customer/Owner)
exports.updateDamagePins = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { damagePins } = req.body;

    const booking = await Booking.findById(bookingId).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user
    if (booking.customer.toString() !== req.user.id && booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update damage checklist' });
    }

    if (damagePins) {
      booking.damagePins = damagePins;
    }

    await booking.save();

    // Broadcast updated booking state via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(bookingId).emit('handover:updated', booking);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

