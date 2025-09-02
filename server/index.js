import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/connectDb.js';
import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRouter from './route/mylist.route.js';
import addressRouter from './route/address.route.js';
import homeSlidesRouter from './route/homeSlides.route.js';
import bannerV1Router from './route/bannerV1.route.js';
import bannerList2Router from './route/bannerList2.route.js';
import blogRouter from './route/blog.route.js';
import orderRouter from './route/order.route.js';
import logoRouter from './route/logo.route.js';
import delhiveryRouter from './route/delhiveryRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Enhanced CORS configuration
app.use(cors({
    origin: [
        'https://www.roarofsouth.in',
        'https://roarofsouth.in',
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8081'
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.options('*', cors());

// Enhanced middleware with better error handling
app.use(express.json({ 
    limit: '50mb',
    strict: true,
    type: 'application/json'
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '50mb' 
}));

app.use(cookieParser());

// Enable morgan for development
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body keys:', Object.keys(req.body));
    }
    next();
});


app.get("/", (request, response) => {
    console.log('✅ Root endpoint accessed');
    response.json({
        message: "RoarOfSouth API Server is running on port " + PORT,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        status: 'healthy'
    });
});

// Debug endpoint for troubleshooting
app.get('/debug', (req, res) => {
    console.log('🐛 Debug endpoint accessed');
    res.json({
        message: '🐛 Debug endpoint - Server is working perfectly!',
        port: PORT,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        cors_origins: [
            'http://localhost:3000',
            'http://localhost:8080', 
            'http://localhost:8081'
        ],
        api_routes: [
            '/api/user',
            '/api/category',
            '/api/product',
            '/api/cart',
            '/api/myList',
            '/api/address',
            '/api/homeSlides',
            '/api/bannerV1',
            '/api/bannerList2',
            '/api/blog',
            '/api/order',
            '/api/logo',
            '/api/delhivery'
        ],
        request_info: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            query: req.query
        }
    });
});


app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/product',productRouter);
app.use("/api/cart",cartRouter)
app.use("/api/myList",myListRouter)
app.use("/api/address",addressRouter)
app.use("/api/homeSlides",homeSlidesRouter)
app.use("/api/bannerV1",bannerV1Router)
app.use("/api/bannerList2",bannerList2Router)
app.use("/api/blog",blogRouter)
app.use("/api/order",orderRouter)
app.use("/api/logo",logoRouter)
app.use("/api/delhivery",delhiveryRouter)


// Global error handler
app.use((error, req, res, next) => {
    console.error('🔥 Global Error Handler:', error.message);
    console.error('🔥 Error Stack:', error.stack);
    
    res.status(error.status || 500).json({
        error: true,
        success: false,
        message: error.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
    res.status(404).json({
        error: true,
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /',
            'POST /api/order/create',
            'GET /api/delhivery/track/:waybill',
            'GET /api/user/*',
            'GET /api/product/*'
        ]
    });
});

// Enhanced server startup
async function startServer() {
    try {
        console.log('🚀 Starting RoarOfSouth API Server...');
        console.log('📍 Environment:', process.env.NODE_ENV || 'development');
        console.log('📧 Email configured:', !!process.env.EMAIL);
        console.log('🗄️ MongoDB configured:', !!process.env.MONGODB_URI);
        console.log('🚚 Delhivery configured:', !!process.env.DELHIVERY_API_KEY);
        
        // Connect to database first
        await connectDB();
        console.log('✅ Database connected successfully');
        
        // Start server
        const server = app.listen(PORT, () => {
            console.log('\n🎉 === SERVER STARTED SUCCESSFULLY ===');
            console.log(`📍 Server URL: http://localhost:${PORT}`);
            console.log(`🔗 API Base: http://localhost:${PORT}/api`);
            console.log(`🚚 Delhivery API: http://localhost:${PORT}/api/delhivery`);
            console.log(`📦 Order API: http://localhost:${PORT}/api/order`);
            console.log('==========================================\n');
        });
        
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Please check if another server is running.`);
                console.error('   You can kill existing processes with: Stop-Process -Name "node" -Force');
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n🔄 SIGTERM received, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('\n🔄 SIGINT received, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('❌ Error details:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();
