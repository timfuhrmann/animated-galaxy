import React, { useEffect } from "react";
import { Galaxy } from "../app/lib/galaxy";

const Home: React.FC = () => {
    useEffect(() => {
        const galaxy = new Galaxy();

        return () => galaxy.destroy();
    }, []);

    return null;
};

export default Home;
