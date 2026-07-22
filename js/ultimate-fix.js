const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

const hdOverrides = {
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
    
    'Butter Naan': 'https://upload.wikimedia.org/wikipedia/commons/1/17/Butter_naan.jpg',
    'Garlic Naan': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Garlic_Naan.jpg',
    'Tandoori Roti': 'https://upload.wikimedia.org/wikipedia/commons/0/02/Roti_-_India.jpg',
    'Jeera Rice': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Jeera_Rice.jpg',
    'Veg Pulao': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Pulao.jpg',
    
    'Hyderabadi Veg Biryani': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_Biryani_in_Chennai.jpg',
    'Paneer Dum Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    'Mushroom Biryani': 'https://upload.wikimedia.org/wikipedia/commons/5/59/Mushroom_Biryani.JPG',
    
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
    
    'Veg Hakka Noodles': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Veg_Hakka_Noodles.jpg',
    'Chilli Paneer Dry': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Chilli_Paneer.jpg',
    'Veg Manchurian': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Veg_Manchurian.jpg',
    'Veg Fried Rice': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Veg_Fried_Rice.jpg',
    'Spring Rolls': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Spring_rolls_with_sweet_chili_sauce.jpg',
    'Chilli Mushroom': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Mushroom_Chilli.jpg',
    
    'Paneer Tikka': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Paneer_Tikka_in_India.jpg',
    'Dahi Ke Sholay': 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Dahi_Ke_Kebab.jpg',
    'Hara Bhara Kebab': 'https://upload.wikimedia.org/wikipedia/commons/6/66/Hara_bhara_kebab.jpg',
    'Samosa (2 pcs)': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Samosa_dish.jpg',
    'Pav Bhaji': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pav_Bhaji.jpg',
    
    'Choco Lava Cake': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Choco_Lava_Cake.jpg',
    'Gulab Jamun (2 pcs)': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Gulab_Jamun_1.jpg',
    'Rasmalai': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Rasmalai_in_a_bowl.jpg',
    'Vanilla Ice Cream': 'https://upload.wikimedia.org/wikipedia/commons/0/00/Vanilla_ice_cream.jpg',
    'Brownie with Ice Cream': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Chocolate_brownie_with_vanilla_icecream.jpg',
    
    'Cold Coffee': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    'Mango Lassi': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Mango_Lassi.jpg',
    'Sweet Lassi': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Lassi_in_a_glass.jpg',
    'Fresh Lime Soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
    'Strawberry Milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80'
};

let matches = [...content.matchAll(/({.*?id:\s*(\d+),.*?name:\s*"([^"]+)",.*?category:\s*"([^"]+)",.*?imageUrl:\s*")([^"]*)(".*?\})/g)];

for (let match of matches) {
    let fullMatch = match[0];
    let name = match[3];
    let before = match[1];
    let after = match[6];
    
    let img = hdOverrides[name];
    if (img) {
        content = content.replace(fullMatch, before + img + after);
    } else {
        console.log("CRITICAL: Missing override for", name);
    }
}

fs.writeFileSync(serverPath, content);
console.log("Ultimate HD fix applied without APIs.");
