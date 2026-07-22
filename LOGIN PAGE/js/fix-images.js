const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
let code = fs.readFileSync(serverPath, 'utf8');

// We will use regex to replace specific images for specific IDs to ensure no duplicates.

const fixes = [
    // Dal Makhani to a dal image
    { id: 104, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80', newImg: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80' }, // Wait, the image for Dal Makhani is Mango Lassi. Let's fix!
    // I will replace ALL imageUrl fields for certain IDs.
];

// Instead of regex replacing every id, let's just parse the file and replace the array string.
// Actually, using regex on the file string is safer to preserve the rest of the file.

let newCode = code
    // Dal Makhani (104) -> Indian curry
    .replace(/({ id: 104.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80$2')
    // Uttapam (124) -> Dosa image
    .replace(/({ id: 124.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&q=80$2')
    // Dahi Ke Sholay (146) -> Snacks
    .replace(/({ id: 146.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80$2')
    // Idli Sambar (121) -> Idli image
    .replace(/({ id: 121.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80$2')
    // Paneer Dum Biryani (117)
    .replace(/({ id: 117.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80$2')
    // Shahi Paneer (103)
    .replace(/({ id: 103.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=500&q=80$2')
    // Veg Maharaja Mac (126) -> Burger
    .replace(/({ id: 126.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80$2')
    // Mix Veg Curry (105)
    .replace(/({ id: 105.*?imageUrl: ")[^"]+(" })/g, '$1https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80$2');

fs.writeFileSync(serverPath, newCode);
console.log('Images fixed');
