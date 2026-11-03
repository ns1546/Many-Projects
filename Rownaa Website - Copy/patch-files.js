const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.push('js/bookings.js', 'js/main.js');

files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    // Replace functions to be async if they contain BookingsManager calls
    if (content.includes('BookingsManager.')) {
        content = content.replace(/function renderOwnerBookings\(\)/g, 'async function renderOwnerBookings()');
        content = content.replace(/function renderAdminBookings\(\)/g, 'async function renderAdminBookings()');
        content = content.replace(/function renderCustomerTrips\(\)/g, 'async function renderCustomerTrips()');
        content = content.replace(/function updateBookingStatus\(/g, 'async function updateBookingStatus(');
        content = content.replace(/function softDeleteBooking\(/g, 'async function softDeleteBooking(');
        content = content.replace(/function restoreBooking\(/g, 'async function restoreBooking(');
        content = content.replace(/function handleCheckout\(/g, 'async function handleCheckout(');
        
        content = content.replace(/window\.BookingsManager\.getAll/g, 'await window.BookingsManager.getAll');
        content = content.replace(/window\.BookingsManager\.getPaginated/g, 'await window.BookingsManager.getPaginated');
        content = content.replace(/window\.BookingsManager\.updateStatus/g, 'await window.BookingsManager.updateStatus');
        content = content.replace(/window\.BookingsManager\.softDelete/g, 'await window.BookingsManager.softDelete');
        content = content.replace(/window\.BookingsManager\.getById/g, 'await window.BookingsManager.getById');
        content = content.replace(/window\.BookingsManager\.restore/g, 'await window.BookingsManager.restore');
        content = content.replace(/window\.BookingsManager\.add/g, 'await window.BookingsManager.add');
        content = content.replace(/window\.BookingsManager\.getTrash/g, 'await window.BookingsManager.getTrash');
        changed = true;
    }
    
    // Auth fixes for panel init
    if (content.includes('window.mockJWT.verify(token)')) {
        content = content.replace(/window\.mockJWT\.verify\(token\)/g, 'window.rownaaSession');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + file);
    }
});
