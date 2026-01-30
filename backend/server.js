import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import authRoutes from './routes/adminRoutes/auth.routes.js';
import wholesalerRoutes from './routes/adminRoutes/wholesalers.routes.js';
import productRoutes from './routes/adminRoutes/product.routes.js';
import categoryRoutes from './routes/adminRoutes/category.routes.js';
import brandRoutes from './routes/adminRoutes/brand.routes.js';
import orderRoutes from './routes/adminRoutes/order.routes.js';
import homeRoutes from './routes/userRoutes/home.routes.js';
import usersRoutes from './routes/userRoutes/user.routes.js';

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
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://kewi.ps',
    'http://kewi.ps',
    'https://www.kewi.ps'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("❌ Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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
                "script-src": [
                    "'self'",
                    "https://cdn.jsdelivr.net"
                ],
                "img-src": ["'self'", "data:", "https://storage.googleapis.com"],
                "connect-src": [
                    "'self'",
                    "https://kewi.ps",
                    "https://www.kewi.ps"
                ]
            },
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
        const apiUrl = `${req.protocol}://${req.get('host')}/admin/products/${id}`;
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
        const apiUrl = `${req.protocol}://${req.get('host')}/admin/products/category/${id}`;
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
app.use('/admin', orderRoutes);
app.use('/admin', brandRoutes);
app.use('/admin', categoryRoutes);
app.use('/admin', productRoutes);
app.use('/admin', wholesalerRoutes);
app.use('/admin', usersRoutes);
app.use('/auth', authRoutes);
app.use('/user', homeRoutes);

// ✅ CATCH-ALL MUST BE LAST
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath,'index.html'));
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
