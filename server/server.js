import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import ngoRoutes from './routes/ngos.js';
import chatRoutes from './routes/chat.js';
import matchingRoutes from './routes/matching.js';
import mcpRoutes from './routes/mcp.js';

// Import MCP manager
import { mcpManager } from './mcp/mcpManager.js';

// Import RAG service
import ragService from './services/ragService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with fallback
const connectDB = async () => {
  try {
    // Try Atlas first
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resqai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (atlasError) {
    console.warn('⚠️ MongoDB Atlas connection failed, trying local...');
    try {
      // Fallback to local MongoDB
      await mongoose.connect('mongodb://localhost:27017/resqai', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Local MongoDB connected successfully');
    } catch (localError) {
      console.error('❌ Both Atlas and local MongoDB failed:');
      console.error('Atlas error:', atlasError.message);
      console.error('Local error:', localError.message);
      process.exit(1);
    }
  }
};

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Initialize RAG service
    console.log('🤖 Initializing RAG service...');
    await ragService.initialize();
    
    // Initialize MCP servers
    console.log('🔧 Initializing MCP servers...');
    await mcpManager.initialize();
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
};

// Start initialization
initializeServices();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ResQ-AI Backend',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/mcp', mcpRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║           🍱 ResQ-AI Backend Server Started 🍱          ║  
║                                                          ║
║  📍 Server:  http://localhost:${PORT}                     ║
║  📖 Health:  http://localhost:${PORT}/health               ║
║  🌐 CORS:    ${process.env.CLIENT_URL || 'http://localhost:3000'}                      ║
║                                                          ║
║  Environment: ${process.env.NODE_ENV || 'development'}                           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;