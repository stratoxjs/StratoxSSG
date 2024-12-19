import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright-chromium';
import { resolveConfig } from 'vite';

// Get the Vite server URL from command-line arguments
const viteServerURL = process.argv[2];
if (!viteServerURL) {
    console.error('Error: Vite server URL not provided.');
    process.exit(1);
}

// Function to dynamically load routes from Vite config
async function getRoutesFromConfig() {
    try {
        const viteConfig = await resolveConfig({}, 'serve'); // Load Vite config
        const startoxSSGConfig = viteConfig.startoxSSG || {};
        const paths = startoxSSGConfig.paths || [];
        const outputDir = viteConfig.build?.outDir || './dist';
        return { paths, outputDir };
    } catch (error) {
        console.error(`Error loading Vite config: ${error.message}`);
        process.exit(1);
    }
}

// Function to render a route with Playwright and save the rendered HTML
async function renderAndSaveRoute(browser, route, outputDir) {
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
    const { paths, outputDir } = await getRoutesFromConfig();

    if (paths.length === 0) {
        console.error('No paths found in Vite configuration.');
        process.exit(1);
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: true });

    for (const route of paths) {
        await renderAndSaveRoute(browser, route, outputDir);
    }

    await browser.close();

})();
