// rebase include
export async function processIncludes(root = document) {
    const includes = root.querySelectorAll("include[src]");

    for (const element of includes) {
        const src = element.getAttribute("src");

        const response = await fetch(src);

        if (!response.ok) {
            throw new Error(`Could not load "${src}"`);
        }

        const html = await response.text();

        element.outerHTML = html;
    }

    if (document.querySelector("include[src]")) {
        await processIncludes();
    }
}
