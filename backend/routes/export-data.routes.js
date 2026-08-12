import { Router } from 'express';
import ExcelJS from 'exceljs';
import Product from '../models/product.model.js';
import Purchase from '../models/purchase.model.js';
import User from '../models/users.model.js';
import Order from '../models/order.model.js';
import Category from '../models/category.model.js';
import Brand from '../models/brand.model.js';
import City from '../models/city.model.js';

const router = Router();

function styleHeader(ws) {
    const row = ws.getRow(1);
    row.font = { bold: true };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    row.commit();
}

const fmt = (date) => date ? new Date(date).toLocaleDateString('en-GB') : '';
const num = (v) => v ?? '';

const STATUS_AR = {
    ordered:   'طلب جديد',
    confirmed: 'مؤكد',
    shipped:   'تم الشحن',
    delivered: 'تم التسليم',
};

router.get('/', async (req, res, next) => {
    try {
        const [products, purchases, users, orders, categories, brands, cities] = await Promise.all([
            Product.find().populate('categoryId', 'name').populate('brandId', 'name').lean(),
            Purchase.find().sort({ createdAt: -1 }).lean(),
            User.find().lean(),
            Order.find().populate('productId', 'name').populate('buyerId', 'userName phone').populate('purchaseId', 'totalPrice orderStatus').lean(),
            Category.find().lean(),
            Brand.find().lean(),
            City.find().lean(),
        ]);

        const wb = new ExcelJS.Workbook();
        wb.creator = 'E-Commerce Manager';
        wb.created = new Date();

        // ── Sheet 1: Summary ───────────────────────────────────────
        const wsSummary = wb.addWorksheet('ملخص');
        wsSummary.views = [{ rightToLeft: true }];
        wsSummary.getColumn(1).width = 30;
        wsSummary.getColumn(2).width = 18;

        const totalRevenue      = purchases.filter(p => p.orderStatus === 'delivered').reduce((s, p) => s + (p.totalPrice || 0), 0);
        const pendingOrders     = purchases.filter(p => p.orderStatus === 'ordered').length;
        const deliveredOrders   = purchases.filter(p => p.orderStatus === 'delivered').length;
        const wholesalers       = users.filter(u => u.isWholesaler).length;

        [
            ['تاريخ التصدير', new Date().toLocaleDateString('ar-SA')],
            [],
            ['إجمالي المنتجات',    products.length],
            ['إجمالي الطلبات',     purchases.length],
            ['طلبات جديدة',        pendingOrders],
            ['طلبات مسلمة',        deliveredOrders],
            [],
            ['إجمالي المستخدمين',  users.length],
            ['تجار الجملة',        wholesalers],
            [],
            ['إجمالي الإيرادات (مسلمة)', totalRevenue],
            ['عدد الأصناف',        categories.length],
            ['عدد البراندات',       brands.length],
        ].forEach(row => wsSummary.addRow(row));

        wsSummary.getRow(1).font = { bold: true, size: 13 };

        // ── Sheet 2: Products ──────────────────────────────────────
        const wsProducts = wb.addWorksheet('المنتجات');
        wsProducts.views = [{ rightToLeft: true }];
        wsProducts.columns = [
            { header: 'الاسم',          key: 'name',            width: 25 },
            { header: 'الصنف',          key: 'category',        width: 18 },
            { header: 'البراند',         key: 'brand',           width: 18 },
            { header: 'سعر الزبون',     key: 'customerPrice',   width: 14 },
            { header: 'سعر الجملة',     key: 'wholesalerPrice', width: 14 },
            { header: 'سعر التخفيض',    key: 'salePrice',       width: 14 },
            { header: 'المخزون',         key: 'stock',           width: 12 },
            { header: 'الجنس',          key: 'gender',          width: 10 },
            { header: 'الحجم',          key: 'size',            width: 10 },
            { header: 'متعدد الألوان',  key: 'multiColor',      width: 14 },
            { header: 'مميز',           key: 'featured',        width: 10 },
            { header: 'تخفيض',          key: 'onSale',          width: 10 },
            { header: 'نفذ',            key: 'soldOut',         width: 10 },
            { header: 'قريباً',          key: 'soon',            width: 10 },
            { header: 'عدد النقرات',    key: 'clicks',          width: 14 },
            { header: 'تاريخ الإضافة',  key: 'createdAt',       width: 16 },
        ];
        styleHeader(wsProducts);
        products.forEach(p => {
            wsProducts.addRow({
                name:            p.name,
                category:        p.categoryId?.name || '—',
                brand:           p.brandId?.name || '—',
                customerPrice:   p.customerPrice,
                wholesalerPrice: p.wholesalerPrice,
                salePrice:       num(p.salePrice),
                stock:           p.stockNumber,
                gender:          p.gender || '',
                size:            p.size || '',
                multiColor:      p.isMultiColor ? 'نعم' : 'لا',
                featured:        p.featured ? 'نعم' : 'لا',
                onSale:          p.isOnSale ? 'نعم' : 'لا',
                soldOut:         p.isSoldOut ? 'نعم' : 'لا',
                soon:            p.isSoon ? 'نعم' : 'لا',
                clicks:          p.numOfClicks || 0,
                createdAt:       fmt(p.createdAt),
            });
        });

        // ── Sheet 3: Purchases ─────────────────────────────────────
        const wsPurchases = wb.addWorksheet('الطلبات');
        wsPurchases.views = [{ rightToLeft: true }];
        wsPurchases.columns = [
            { header: 'الاسم',           key: 'fullName',     width: 22 },
            { header: 'الهاتف',          key: 'phone',        width: 16 },
            { header: 'المدينة',         key: 'city',         width: 16 },
            { header: 'العنوان',         key: 'address',      width: 25 },
            { header: 'نوع التوصيل',     key: 'delivery',     width: 14 },
            { header: 'المنتجات',        key: 'items',        width: 40 },
            { header: 'عدد القطع',       key: 'numOfItems',   width: 12 },
            { header: 'السعر',           key: 'price',        width: 12 },
            { header: 'الإجمالي',        key: 'totalPrice',   width: 14 },
            { header: 'تخفيض',          key: 'discount',     width: 10 },
            { header: 'طريقة الدفع',     key: 'payment',      width: 14 },
            { header: 'الحالة',          key: 'status',       width: 16 },
            { header: 'تاريخ التأكيد',   key: 'confirmedAt',  width: 16 },
            { header: 'تاريخ الشحن',     key: 'shippedAt',    width: 16 },
            { header: 'تاريخ التسليم',   key: 'deliveredAt',  width: 16 },
            { header: 'تاريخ الطلب',     key: 'createdAt',    width: 16 },
            { header: 'ملاحظات',         key: 'notes',        width: 30 },
        ];
        styleHeader(wsPurchases);
        purchases.forEach(p => {
            wsPurchases.addRow({
                fullName:    p.fullName,
                phone:       p.phoneNumber,
                city:        p.city,
                address:     p.streetAddress || '',
                delivery:    p.deliveryType || '',
                items:       (p.products || []).map(i => `${i.name} (${i.quantity})`).join(' + '),
                numOfItems:  num(p.numOfItems),
                price:       p.price,
                totalPrice:  p.totalPrice,
                discount:    p.discount ? 'نعم' : 'لا',
                payment:     p.paymentMethod === 'visa' ? 'فيزا' : 'كاش',
                status:      STATUS_AR[p.orderStatus] || p.orderStatus,
                confirmedAt: fmt(p.confirmedAt),
                shippedAt:   fmt(p.shippedAt),
                deliveredAt: fmt(p.deliveredAt),
                createdAt:   fmt(p.createdAt),
                notes:       p.notes || '',
            });
        });

        // ── Sheet 4: Users ─────────────────────────────────────────
        const wsUsers = wb.addWorksheet('المستخدمون');
        wsUsers.views = [{ rightToLeft: true }];
        wsUsers.columns = [
            { header: 'الاسم',          key: 'name',       width: 22 },
            { header: 'الهاتف',         key: 'phone',      width: 16 },
            { header: 'العنوان',        key: 'address',    width: 25 },
            { header: 'الدور',          key: 'role',       width: 14 },
            { header: 'تاجر جملة',     key: 'wholesaler', width: 12 },
            { header: 'نقاط الولاء',    key: 'loyalty',    width: 14 },
            { header: 'عدد الطلبات',   key: 'orders',     width: 14 },
            { header: 'تاريخ الميلاد', key: 'dob',        width: 16 },
            { header: 'تاريخ التسجيل', key: 'createdAt',  width: 16 },
        ];
        styleHeader(wsUsers);
        const roleAr = { admin: 'مدير', user: 'مستخدم', wholesaler: 'تاجر جملة' };
        users.forEach(u => {
            wsUsers.addRow({
                name:      u.userName,
                phone:     u.phone,
                address:   u.address || '',
                role:      roleAr[u.role] || u.role,
                wholesaler: u.isWholesaler ? 'نعم' : 'لا',
                loyalty:   u.loyaltyPoints || 0,
                orders:    (u.orderHistory || []).length,
                dob:       fmt(u.dob),
                createdAt: fmt(u.createdAt),
            });
        });

        // ── Sheet 5: Categories ────────────────────────────────────
        const wsCategories = wb.addWorksheet('الأصناف');
        wsCategories.views = [{ rightToLeft: true }];
        wsCategories.columns = [
            { header: 'الاسم',        key: 'name',        width: 22 },
            { header: 'الوصف',        key: 'description', width: 35 },
            { header: 'أخرى',         key: 'other',       width: 10 },
            { header: 'تاريخ الإضافة', key: 'createdAt',  width: 16 },
        ];
        styleHeader(wsCategories);
        categories.forEach(c => {
            wsCategories.addRow({
                name:        c.name,
                description: c.description || '',
                other:       c.other ? 'نعم' : 'لا',
                createdAt:   fmt(c.createdAt),
            });
        });

        // ── Sheet 6: Brands ────────────────────────────────────────
        const wsBrands = wb.addWorksheet('البراندات');
        wsBrands.views = [{ rightToLeft: true }];
        wsBrands.columns = [
            { header: 'الاسم',        key: 'name',      width: 22 },
            { header: 'تقليد',        key: 'isFake',    width: 10 },
            { header: 'عدد النقرات',  key: 'clicks',    width: 14 },
            { header: 'تاريخ الإضافة', key: 'createdAt', width: 16 },
        ];
        styleHeader(wsBrands);
        brands.forEach(b => {
            wsBrands.addRow({
                name:      b.name,
                isFake:    b.isFake ? 'نعم' : 'لا',
                clicks:    b.numOfClicks || 0,
                createdAt: fmt(b.createdAt),
            });
        });

        // ── Sheet 7: Cities ────────────────────────────────────────
        const wsCities = wb.addWorksheet('المدن');
        wsCities.views = [{ rightToLeft: true }];
        wsCities.columns = [
            { header: 'المدينة',      key: 'name',      width: 20 },
            { header: 'المنطقة',      key: 'region',    width: 20 },
            { header: 'تاريخ الإضافة', key: 'createdAt', width: 16 },
        ];
        styleHeader(wsCities);
        cities.forEach(c => {
            wsCities.addRow({
                name:      c.name,
                region:    c.region,
                createdAt: fmt(c.createdAt),
            });
        });

        // ── Stream ─────────────────────────────────────────────────
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="store-export-${new Date().toISOString().slice(0, 10)}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    } catch (e) {
        next(e);
    }
});

export default router;