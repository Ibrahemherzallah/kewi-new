import 'dotenv/config';
import express from 'express';
import connectDB from './db/connectDB.js';
import authRoutes from './routes/adminRoutes/auth.routes.js';
import wholesalerRoutes from './routes/adminRoutes/wholesalers.routes.js';
import productRoutes from './routes/adminRoutes/product.routes.js';
import categoryRoutes from './routes/adminRoutes/category.routes.js';
import brandRoutes from './routes/adminRoutes/brand.routes.js';
import orderRoutes from './routes/adminRoutes/order.routes.js';
import homeRoutes from './routes/userRoutes/home.routes.js';
import usersRoutes from './routes/userRoutes/user.routes.js';
import userProductRoutes from './routes/userRoutes/product.routes.js';
import adminDashboardRoutes from './routes/adminRoutes/dashboard.routes.js';
import exportDataRoutes from './routes/export-data.routes.js';
import cors from 'cors';
import session from "express-session";
import helmet from 'helmet';
import path from 'path'
import { fileURLToPath } from 'url';

// ✅ ADD THESE IMPORTS
import { renderWithMeta } from './seo.renderer.js';
import { homeMeta, productMeta, categoryMeta } from './metaTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;
const app = express();

const allowedOrigins = [
    'http://localhost:8000',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://kewi.ps',
    'http://kewi.ps',
    'https://www.kewi.ps',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow tools like Postman (no origin)
        if (!origin) {
            return callback(null, true);
        }

        // Allow explicit origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any localhost:* for dev (optional but convenient)
        if (origin.startsWith('http://localhost')) {
            return callback(null, true);
        }

        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],

                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "https://cdn.jsdelivr.net",
                    "https://www.google.com",
                    "https://www.gstatic.com",
                    "https://connect.facebook.net"
                ],

                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https:"
                ],

                imgSrc: [
                    "'self'",
                    "data:",
                    "https://storage.googleapis.com",
                    "https://firebasestorage.googleapis.com",
                    "https://www.google.com",
                    "https://www.facebook.com"
                ],

                frameSrc: [
                    "'self'",
                    "https://www.google.com"
                ],

                connectSrc: [
                    "'self'",
                    "https://kewi.ps",
                    "https://www.kewi.ps",
                    "https://www.google.com",
                    "https://www.gstatic.com",
                    "https://firebasestorage.googleapis.com",
                    "https://storage.googleapis.com",
                    "https://connect.facebook.net",
                    "https://www.facebook.com",
                    "https://*.facebook.com",
                    "https://*.amazonaws.com",
                    "https://*.on.aws",
                    "https://*.run.app",
                ],

                workerSrc: ["'self'", "blob:"],
                objectSrc: ["'none'"]
            }
        }
    })
);


app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const staticPath = path.join(__dirname, 'static');

// ✅ MOVE STATIC BELOW SEO ROUTES (IMPORTANT!)
// app.use(express.static(staticPath)); ❌ REMOVE FROM HERE

// =====================================================
// ✅ SEO ROUTES MUST COME BEFORE STATIC & CATCH-ALL
// =====================================================

// Home Page SEO
app.get('/', async (req, res) => {
    try {
        const html = await renderWithMeta(staticPath, homeMeta());
        res.status(200).send(html);
    } catch (e) {
        console.error('SEO home error:', e);
        res.sendFile(path.join(staticPath, 'index.html'));
    }
});

// Product Page SEO
app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const apiUrl = `${req.protocol}://${req.get('host')}/admin/api/products/${id}`;
        const r = await fetch(apiUrl);
        const product = await r.json();

        const meta = productMeta(product);
        const html = await renderWithMeta(staticPath, meta);
        res.status(200).send(html);
    } catch (e) {
        console.error('SEO product error:', e);
        res.sendFile(path.join(staticPath, 'index.html'));
    }
});

// Category Page SEO
app.get('/category/:id', async (req, res) => {
    const { id } = req.params;
    const catNameFromQuery = req.query?.catName;

    try {
        const apiUrl = `${req.protocol}://${req.get('host')}/admin/api/products/category/${id}`;
        const r = await fetch(apiUrl);
        const products = await r.json();

        const first = Array.isArray(products) ? products[0] : null;
        const catName =
            catNameFromQuery ||
            first?.category?.name ||
            'التصنيفات';

        const firstImage =
            (first?.images && first.images[0]) ? first.images[0] : null;

        const meta = categoryMeta({ catName, firstImage, id });
        const html = await renderWithMeta(staticPath, meta);
        res.status(200).send(html);
    } catch (e) {
        console.error('SEO category error:', e);
        res.sendFile(path.join(staticPath, 'index.html'));
    }
});

// ✅ NOW SERVE STATIC FILES
app.use(express.static(staticPath));

// ✅ API ROUTES (order does not matter after SEO)
app.use('/admin/api', orderRoutes);
app.use('/admin/api', brandRoutes);
app.use('/admin/api', categoryRoutes);
app.use('/admin/api', productRoutes);
app.use('/admin/api', wholesalerRoutes);
app.use('/admin/api', usersRoutes);
app.use('/admin/api', adminDashboardRoutes);
app.use('/auth/api', authRoutes);
app.use('/user/api', homeRoutes);
app.use('/user/api', userProductRoutes);
app.use('/export/api', exportDataRoutes);

// ✅ CATCH-ALL MUST BE LAST
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath,'index.html'));
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
