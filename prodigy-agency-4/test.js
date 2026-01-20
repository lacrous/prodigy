const { chromium } = require('playwright');
const path = require('path');

async function testWebsite() {
    console.log('Starting browser test...');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    // Collect page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });
    
    try {
        // Load the HTML file
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
        
        console.log('Page loaded successfully');
        
        // Wait for content to render
        await page.waitForTimeout(2000);
        
        // Check if main elements are present
        const title = await page.title();
        console.log('Page title:', title);
        
        // Check for key sections
        const sections = ['home', 'services', 'about', 'testimonials', 'contact'];
        for (const section of sections) {
            const sectionExists = await page.$(`#${section}`);
            if (sectionExists) {
                console.log(`✓ Section #${section} found`);
            } else {
                console.log(`✗ Section #${section} NOT found`);
            }
        }
        
        // Check navigation
        const navLinks = await page.$$('.nav-link');
        console.log(`Navigation links found: ${navLinks.length}`);
        
        // Check service cards
        const serviceCards = await page.$$('.service-card');
        console.log(`Service cards found: ${serviceCards.length}`);
        
        // Check form exists
        const formExists = await page.$('#contact-form');
        if (formExists) {
            console.log('✓ Contact form found');
        }
        
        // Test mobile menu button
        const mobileMenuBtn = await page.$('#mobile-menu-btn');
        if (mobileMenuBtn) {
            console.log('✓ Mobile menu button found');
            await mobileMenuBtn.click();
            await page.waitForTimeout(500);
            const menuVisible = await page.$eval('#mobile-menu', el => el.classList.contains('open'));
            console.log(`Mobile menu toggle: ${menuVisible ? 'working' : 'not working'}`);
        }
        
        // Report errors
        console.log('\n--- Console Errors ---');
        if (consoleErrors.length === 0) {
            console.log('No console errors detected');
        } else {
            consoleErrors.forEach(err => console.log('ERROR:', err));
        }
        
        console.log('\n--- Page Errors ---');
        if (pageErrors.length === 0) {
            console.log('No page errors detected');
        } else {
            pageErrors.forEach(err => console.log('ERROR:', err));
        }
        
        // Final status
        const hasErrors = consoleErrors.length > 0 || pageErrors.length > 0;
        console.log('\n=== Test Result ===');
        console.log(hasErrors ? 'FAILED: Errors detected' : 'PASSED: No errors detected');
        
        await browser.close();
        process.exit(hasErrors ? 1 : 0);
        
    } catch (error) {
        console.error('Test failed with error:', error.message);
        await browser.close();
        process.exit(1);
    }
}

testWebsite();
