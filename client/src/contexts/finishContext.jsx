import { createContext, useContext, useRef } from "react";

const FinishContext = createContext(null);

export const FinishProvider = ({ children }) => {
    const hasFinishedRef = useRef(false);

    return (
        <FinishContext.Provider value={{ hasFinishedRef }}>
            {children}
        </FinishContext.Provider>
    );
};

export const useFinish = () => useContext(FinishContext);
