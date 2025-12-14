import React, { createContext, useContext, useState } from "react";

const EditorImagesContext = createContext(null);

export const EditorImagesProvider = ({ children }) => {
    const [images, setImages] = useState([]);

    const addImage = (image) => setImages((prev) => [...prev, image]);

    const removeImagesNotIn = (srcList) =>
        setImages((prev) => prev.filter((img) => srcList.includes(img.src)));

    const clearImages = () => setImages([]);

    return (
        <EditorImagesContext.Provider
            value={{ images, addImage, removeImagesNotIn, clearImages }}
        >
            {children}
        </EditorImagesContext.Provider>
    );
};

export const useEditorImages = () => {
    const ctx = useContext(EditorImagesContext);
    if (!ctx) throw new Error("useEditorImages must be used inside provider");
    return ctx;
};
