const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    
    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}`);
    });
    
    try {
        const filePath = path.resolve(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
        
        // Wait for page to fully load
        await page.waitForTimeout(2000);
        
        // Check if key elements exist
        const title = await page.title();
        console.log('Page Title:', title);
        
        const heroExists = await page.$('h1');
        console.log('Hero section exists:', !!heroExists);
        
        const navExists = await page.$('nav');
        console.log('Navigation exists:', !!navExists);
        
        // Check sections
        const sections = ['services', 'portfolio', 'about', 'testimonials', 'contact'];
        for (const section of sections) {
            const sectionExists = await page.$(`#${section}`);
            console.log(`Section #${section} exists:`, !!sectionExists);
        }
        
        // Report errors
        if (errors.length > 0) {
            console.log('\n=== ERRORS FOUND ===');
            errors.forEach(err => console.log(err));
        } else {
            console.log('\n=== NO ERRORS FOUND ===');
        }
        
    } catch (e) {
        console.log('Test Error:', e.message);
    } finally {
        await browser.close();
    }
})();
