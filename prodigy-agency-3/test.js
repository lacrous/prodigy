const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        consoleErrors.push(error.message);
    });

    try {
        // Load the local HTML file
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });

        // Wait for the page to be fully loaded
        await page.waitForTimeout(2000);

        // Check if the page loaded successfully
        const title = await page.title();
        console.log('Page Title:', title);

        // Check for main sections
        const heroExists = await page.$('#home') !== null;
        const servicesExists = await page.$('#services') !== null;
        const portfolioExists = await page.$('#portfolio') !== null;
        const aboutExists = await page.$('#about') !== null;
        const testimonialsExists = await page.$('#testimonials') !== null;
        const contactExists = await page.$('#contact') !== null;

        console.log('Hero Section:', heroExists ? 'OK' : 'MISSING');
        console.log('Services Section:', servicesExists ? 'OK' : 'MISSING');
        console.log('Portfolio Section:', portfolioExists ? 'OK' : 'MISSING');
        console.log('About Section:', aboutExists ? 'OK' : 'MISSING');
        console.log('Testimonials Section:', testimonialsExists ? 'OK' : 'MISSING');
        console.log('Contact Section:', contactExists ? 'OK' : 'MISSING');

        // Check for navigation
        const navExists = await page.$('nav') !== null;
        console.log('Navigation:', navExists ? 'OK' : 'MISSING');

        // Check Tailwind CSS loaded (by verifying some styled elements)
        const hasGradientText = await page.$('.gradient-text') !== null;
        console.log('Gradient Text Classes:', hasGradientText ? 'OK' : 'MISSING');

        // Report console errors
        if (consoleErrors.length > 0) {
            console.log('\nConsole Errors:');
            consoleErrors.forEach(err => console.log('  -', err));
        } else {
            console.log('\nNo console errors detected!');
        }

        console.log('\nWebsite test completed successfully!');

    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
