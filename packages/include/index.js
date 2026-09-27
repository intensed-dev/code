// rebase include
export async function processIncludes(root = document, baseUrl = document.baseURI) {
    const includes = [...root.querySelectorAll("include[src]")];

    for (const element of includes) {
        const src = element.getAttribute("src");

        if (!src) continue;

        const url = new URL(src, baseUrl);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Could not load include "${src}" (${response.status})`
            );
        }

        const html = await response.text();

        element.outerHTML = html;

        await processIncludes(root, url.href);
    }
}
