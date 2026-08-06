export const isBirthdayToday = (): boolean => {
    if (typeof window === "undefined") return false;

    const userRaw = localStorage.getItem("user");
    if (!userRaw) return false;

    try {
        const user = JSON.parse(userRaw);
        if (!user.dob) return false;

        const dob = new Date(user.dob);
        const today = new Date();

        return (
            dob.getDate() === today.getDate() &&
            dob.getMonth() === today.getMonth()
        );
    } catch {
        return false;
    }
};

export const getProductPrice = (item: any, language: string) => {
    const customer = item.customerPrice ?? item.retailPrice ?? item.costPrice ?? 0;
    const wholesale = item.wholesalerPrice ?? item.wholesalePrice ?? customer;
    const sale = item.salePrice ?? null;
    const isOnSale = !!item.isOnSale;

    const role = localStorage.getItem("userRole");
    const isWholesalerUser = role === "wholesaler";
    const birthday = isBirthdayToday();

    // ---------- CATEGORY-AWARE WHOLESALER CHECK ----------
    const getWholesalerEligible = (): boolean => {
        if (!isWholesalerUser) return false;
        try {
            const raw = localStorage.getItem("wholesalerCategories");
            if (!raw) return true; // nothing stored → all categories

            const allowedIds: string[] = JSON.parse(raw);
            if (allowedIds.length === 0) return true; // empty → all categories

            // categoryId can be a string or an object { _id, name }
            const productCategoryId =
                typeof item.categoryId === "object" && item.categoryId !== null
                    ? item.categoryId._id
                    : item.categoryId;

            if (!productCategoryId) return false;

            return allowedIds.includes(String(productCategoryId));
        } catch {
            return true; // fallback: allow if parsing fails
        }
    };

    const isWholesaleEligible = getWholesalerEligible();

    let mainPrice = customer;
    let oldPrice: number | null = null;
    let label: string | null = null;

    // 🎂 Birthday FIRST
    if (birthday) {
        if (sale != null) {
            mainPrice = sale;
            oldPrice = customer;
            label = language === "ar" ? "خصم عيد الميلاد 🎉" : "Birthday Offer 🎉";
        } else {
            mainPrice = wholesale;
            oldPrice = customer;
            label = language === "ar" ? "هدية عيد الميلاد 🎁" : "Birthday Gift 🎁";
        }
    }

    // 🧑‍💼 Wholesaler — only if category is allowed
    else if (isWholesalerUser && isWholesaleEligible) {
        mainPrice = wholesale;
        oldPrice = customer;
        label = language === "ar" ? "سعر الجملة" : "Wholesale";
    }

    // 🔥 Sale
    else if (isOnSale && sale != null) {
        mainPrice = sale;
        oldPrice = customer;
        label = language === "ar" ? "سعر العرض" : "Sale price";
    }

    return { mainPrice, oldPrice, label };
};