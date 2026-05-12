export const trackMetaEvent = (
    eventName: string,
    data: Record<string, any> = {}
) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", eventName, data);
    }
};