import Transaction from '../models/Transaction.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import stripe from '../config/stripe.js';

export const createEscrow = async (req, res) => {
  try {
    const { jobId, paymentMethod = 'mock' } = req.body;

    const job = await Job.findOne({ _id: jobId, organizerId: req.userId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    if (job.isEscrowCreated) {
      return res.status(400).json({ message: 'Escrow already created for this job' });
    }

    const amount = job.payPerPerson * job.hiredPros.length;

    let transaction;

    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: { jobId: jobId.toString() }
      });

      transaction = await Transaction.create({
        jobId,
        organizerId: req.userId,
        proIds: job.hiredPros,
        amount,
        paymentIntentId: paymentIntent.id,
        status: 'pending',
        paymentMethod: 'stripe'
      });

      res.json({
        message: 'Payment intent created',
        clientSecret: paymentIntent.client_secret,
        transaction
      });
    } else {
      // Mock escrow
      transaction = await Transaction.create({
        jobId,
        organizerId: req.userId,
        proIds: job.hiredPros,
        amount,
        status: 'escrowed',
        paymentMethod: 'mock'
      });

      job.isEscrowCreated = true;
      await job.save();

      res.json({
        message: 'Escrow created successfully (Mock)',
        transaction
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating escrow', error: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { transactionId, paymentIntentId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      transaction.status = 'escrowed';
      await transaction.save();

      // Update job
      await Job.findByIdAndUpdate(transaction.jobId, { isEscrowCreated: true });

      res.json({ message: 'Payment confirmed', transaction });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};

export const releasePayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('jobId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify organizer or admin
    if (req.user.role !== 'admin' && 
        transaction.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (transaction.status !== 'escrowed') {
      return res.status(400).json({ message: 'Transaction not in escrow status' });
    }

    // Check if job is completed
    const job = transaction.jobId;
    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Job must be completed first' });
    }

    const amountPerPro = transaction.amount / transaction.proIds.length;

    // Release payment to each pro
    const releasePromises = transaction.proIds.map(async (proId) => {
      if (transaction.paymentMethod === 'stripe') {
        // Create Stripe transfer (requires Connect accounts)
        // const transfer = await stripe.transfers.create({...});
        // For now, simulate
      }

      // Update user wallet/earnings
      await User.findByIdAndUpdate(proId, {
        $inc: { totalJobs: 1 }
      });

      return {
        proId,
        amount: amountPerPro,
        releasedAt: new Date(),
        transferId: `mock_${Date.now()}`
      };
    });

    transaction.releaseDetails = await Promise.all(releasePromises);
    transaction.status = 'paid';
    await transaction.save();

    res.json({ message: 'Payment released successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error releasing payment', error: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const filter = {};
    
    if (req.user.role === 'organizer') {
      filter.organizerId = req.userId;
    } else if (req.user.role === 'worker') {
      filter.proIds = req.userId;
    }

    const transactions = await Transaction.find(filter)
      .populate('jobId', 'title dateStart')
      .populate('organizerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};