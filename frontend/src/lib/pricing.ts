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

    // 🧑‍💼 Wholesaler
    else if (isWholesalerUser) {
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
