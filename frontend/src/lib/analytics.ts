export const trackGaEvent = (name: string, params?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", name, params || {});
    }
};

export const trackGaPageView = (path: string) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "page_view", {
            page_path: path,
            page_location: window.location.href,
            page_title: document.title,
        });
    }
};