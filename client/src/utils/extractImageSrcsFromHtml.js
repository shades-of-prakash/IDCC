export const extractImageSrcsFromHtml = (html) => {
    if (!html) return [];

    const container = document.createElement("div");
    container.innerHTML = html;

    const imgs = container.querySelectorAll("img");

    return Array.from(new Set(Array.from(imgs).map((i) => i.src)));
};
