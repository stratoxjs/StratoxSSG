const fs require('fs');
const path require('path');
const { chromium } require('playwright-chromium');

// Get the Vite server URL from command-line arguments
const viteServerURL = process.argv[2];
if (!viteServerURL) {
    console.error('Error: Vite server URL not provided.');
    process.exit(1);
}

// Directory for static files
const outputDir = './dist/';
const routes = [
    '/',
    '/about',
    '/contact'
];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to render a route with Playwright and save the rendered HTML
async function renderAndSaveRoute(browser, route) {
    const page = await browser.newPage();
    const url = `${viteServerURL}${route}`;

    // Block unnecessary resources
    await page.route('**/*', route => {
        const resourceType = route.request().resourceType();
        if (['image', 'media', 'stylesheet', 'font'].includes(resourceType)) {
            route.abort();
        } else {
            route.continue();
        }
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle' }); // Wait for all network requests to settle
        const html = await page.content(); // Get fully rendered HTML
        const filePath = path.join(
            outputDir,
            route === '/' ? 'index.html' : `${route.replace(/^\//, '').replace(/\//g, '-')}.html`
        );
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`Successfully saved: ${filePath}`);
    } catch (error) {
        console.error(`Failed to render ${url}: ${error.message}`);
    } finally {
        await page.close();
    }
}

// Crawl all routes using Playwright
(async function crawlSite() {
    const browser = await chromium.launch({ headless: true }); // Launch Playwright browser

    for (const route of routes) {
        await renderAndSaveRoute(browser, route);
    }

    await browser.close();
})();
