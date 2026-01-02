require("dotenv").config();
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/indexRoutes');
const { Server } = require("socket.io");
const socketManager = require("./socketManager/socketManager");
const { createServer } = require('node:http');
const app = express();
const port = process.env.PORT || 8000;
const cookieParser = require('cookie-parser');



const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security Middleware
app.use(helmet());

// Rate Limiting (Global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

const server = createServer(app);
// Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});

socketManager.initializeSocket(io);

connectDb(app);

app.use('/api/', authRoutes);
server.listen(port, () => {
  console.log(`Server + Socket.IO is running on port ${port}`);
});
