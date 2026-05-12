import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaEvent } from "@/utils/metaPixel";

const MetaPixelPageView = () => {
    const location = useLocation();

    useEffect(() => {
        trackMetaEvent("PageView");
    }, [location.pathname]);

    return null;
};

export default MetaPixelPageView;