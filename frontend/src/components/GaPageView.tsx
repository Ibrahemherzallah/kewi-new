import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { trackGaPageView } from "@/lib/analytics";

const GaPageView = () => {
    const location = useLocation();

    useEffect(() => {
        trackGaPageView(location.pathname + location.search);
    }, [location]);

    return null;
};

export default GaPageView;