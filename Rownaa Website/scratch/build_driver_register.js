// Scratch script to update driver-register.html and build netlify-driver-portal package
const fs = require('fs');
const path = require('path');

const rootDir = 'g:\\Download Official\\Rownaa Website';
const driverHtmlPath = path.join(rootDir, 'driver-register.html');
const netlifyDir = path.join(rootDir, 'netlify-driver-portal');

console.log('Building Driver Register & Netlify package...');

