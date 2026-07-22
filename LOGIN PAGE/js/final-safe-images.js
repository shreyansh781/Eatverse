const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

const imageMap = {
    // Valid Wikipedia URLs from previous run
    'Paneer Butter Masala': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Butter_Naan_With_Paneer_Butter_Masala.jpg',
    'Kadai Paneer': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Kadai_Paneer_With_Gravy.jpg',
    'Shahi Paneer': 'https://upload.wikimedia.org/wikipedia/commons/5/58/Shahi_Paneer_%26_Butter_Naan.jpg',
    'Dal Makhani': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Dal_Makhani_01.jpg',
    'Mix Veg Curry': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Mix_veg_with_garlic_kulcha.jpg',
    'Malai Kofta': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Malai_Kofta_Curry.jpg',
    'Matar Paneer': 'https://upload.wikimedia.org/wikipedia/commons/5/56/Matar_Paneer_Curry_1.jpg',
    'Palak Paneer': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Palak_Paneer_curry_on_plate.jpg',
    'Chana Masala': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Chana_Masala_Fry.jpg',
    'Aloo Gobi': 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Aloo_Gobi_Sabzi.jpg',
    
    // Verified Unsplash Images for missing ones
    'Butter Naan': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80',
    'Garlic Naan': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80',
    'Tandoori Roti': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80',
    'Jeera Rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
    'Veg Pulao': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
    
    'Hyderabadi Veg Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    'Paneer Dum Biryani': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    
    'Masala Dosa': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Masala_dosa_01.jpg',
    'Paneer Dosa': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/PANEER_MASALA_DOSA_-_Mini_MADRAS_2016-05-03.jpg',
    'Idli Sambar': 'https://upload.wikimedia.org/wikipedia/commons/0/02/Idli_Sambar-Noida-UP-SP004.jpg',
    'Medu Vada': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Medu_Vada_-_Calcutta_16_2013-07-11.jpg',
    'Rava Dosa': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Rava_Dosa_with_Coconut_Chutney.jpg',
    'Uttapam': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Food-Uttapam-2.jpg',
    
    'Aloo Tikki Burger': 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Aloo_tikki_burger_%28homemade%29.jpg',
    'Veg Maharaja Mac': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    'Spicy Paneer Burger': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80',
    'Crispy Veg Burger': 'https://images.unsplash.com/photo-1594212666324-c1e138377b79?w=800&q=80',
    'Cheese Grilled Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
    'Paneer Tikka Sandwich': 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=800&q=80',
    'Veggie Delite Wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
    'Cheesy Paneer Wrap': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
    
    'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    'Farmhouse Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    'Peppy Paneer Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    'Veg Extravaganza': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
    'Cheese n Corn Pizza': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80',
    'Mushroom Delight Pizza': 'https://images.unsplash.com/photo-1604381536136-57e9d4e5658e?w=800&q=80',
    
    'Veg Hakka Noodles': 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80',
    'Chilli Paneer Dry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    'Veg Manchurian': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
    'Veg Fried Rice': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    'Spring Rolls': 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80',
    'Chilli Mushroom': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80',
    
    'Paneer Tikka': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    'Dahi Ke Sholay': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    'Hara Bhara Kebab': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    'Samosa (2 pcs)': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    'Pav Bhaji': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    
    'Choco Lava Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    'Gulab Jamun (2 pcs)': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    'Rasmalai': 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800&q=80',
    'Vanilla Ice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
    'Brownie with Ice Cream': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
    
    'Cold Coffee': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    'Mango Lassi': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    'Sweet Lassi': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
    'Fresh Lime Soda': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
    'Strawberry Milkshake': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80'
};

let matches = [...content.matchAll(/({.*?id:\s*(\d+),.*?name:\s*"([^"]+)",.*?category:\s*"([^"]+)",.*?imageUrl:\s*")([^"]*)(".*?\})/g)];

for (let match of matches) {
    let fullMatch = match[0];
    let name = match[3];
    let before = match[1];
    let after = match[6];
    
    let img = imageMap[name];
    if (img) {
        content = content.replace(fullMatch, before + img + after);
    } else {
        // Safe verified fallback
        content = content.replace(fullMatch, before + 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' + after);
    }
}

fs.writeFileSync(serverPath, content);
console.log("Safe images applied!");
