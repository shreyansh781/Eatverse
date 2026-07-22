const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'data', 'database.json');

// Helper to read DB
const readDB = () => {
    if (!fs.existsSync(dbPath)) return [];
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data || '[]');
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Signup Endpoint
app.post('/api/signup', (req, res) => {
    const { username, email, phone, password, address, phoneVerified } = req.body;
    let users = readDB();

    let baseName = username.toLowerCase().replace(/\s+/g, '') || "user";
    let uniqueId = '';
    let isUnique = false;

    while (!isUnique) {
        let randomNum = Math.floor(1000 + Math.random() * 9000);
        uniqueId = baseName + randomNum;
        if (!users.some(u => u.userId === uniqueId)) {
            isUnique = true;
        }
    }

    const newUser = {
        userId: uniqueId,
        name: username,
        email,
        password,
        address: address || "Kanpur, Uttar Pradesh", // Defaulting if not provided
        phone: phone || "",
        phoneVerified: phoneVerified || false
    };

    users.push(newUser);
    writeDB(users);

    res.json({ success: true, user: newUser });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { loginId, password } = req.body;
    const users = readDB();

    const foundUser = users.find(u => u.userId === loginId);
    
    if (foundUser) {
        if (foundUser.password === password) {
            res.json({ success: true, user: foundUser });
        } else {
            res.status(401).json({ success: false, message: "Incorrect Password!" });
        }
    } else {
        res.status(404).json({ success: false, message: "Incorrect User ID!" });
    }
});

// Update Profile Endpoint
app.post('/api/update-profile', (req, res) => {
    const { userId, password, phone, address } = req.body;
    let users = readDB();

    const userIndex = users.findIndex(u => u.userId === userId);
    
    if (userIndex !== -1) {
        if (users[userIndex].password === password) {
            // Update fields
            users[userIndex].phone = phone || users[userIndex].phone;
            users[userIndex].address = address || users[userIndex].address;
            
            writeDB(users);
            res.json({ success: true, user: users[userIndex] });
        } else {
            res.status(401).json({ success: false, message: "Incorrect Password! Profile update failed." });
        }
    } else {
        res.status(404).json({ success: false, message: "User not found!" });
    }
});

// Create Order Endpoint
app.post('/api/order', (req, res) => {
    const { userId, order } = req.body;
    let users = readDB();
    const userIndex = users.findIndex(u => u.userId === userId);
    
    if (userIndex !== -1) {
        if (!users[userIndex].orders) users[userIndex].orders = [];
        
        const newOrder = {
            orderId: order.orderId || ('#ORD' + Math.floor(Math.random() * 90000 + 10000)),
            date: new Date().toISOString(),
            status: order.status || 'Order Confirmed',
            items: order.items || [],
            totalAmount: order.totalAmount || 0
        };
        
        users[userIndex].orders.unshift(newOrder); // Add to beginning (most recent first)
        writeDB(users);
        res.json({ success: true, order: newOrder });
    } else {
        res.status(404).json({ success: false, message: "User not found!" });
    }
});

// Get User Orders Endpoint
app.get('/api/orders/:userId', (req, res) => {
    const { userId } = req.params;
    const users = readDB();
    const user = users.find(u => u.userId === userId);
    
    if (user) {
        res.json({ success: true, orders: user.orders || [] });
    } else {
        res.status(404).json({ success: false, message: "User not found!" });
    }
});

// Nearby Hotels API (Mock Data)
app.get('/api/hotels', (req, res) => {
    const { q, lat, lng } = req.query;
    const query = (q || '').toLowerCase();
    
    // We generate some mock hotels around the given coordinates
    const baseLat = parseFloat(lat) || 26.4499;
    const baseLng = parseFloat(lng) || 80.3319;
    
    const hotels = [
        { id: 1, name: "Hotel Royal Inn", lat: baseLat + 0.005, lng: baseLng + 0.002, rating: 4.5, price: "₹1200" },
        { id: 2, name: "The Grand Kitchen", lat: baseLat - 0.003, lng: baseLng - 0.004, rating: 4.8, price: "₹800" },
        { id: 3, name: "Spice Route Restaurant", lat: baseLat + 0.008, lng: baseLng - 0.001, rating: 4.2, price: "₹500" },
        { id: 4, name: "Shukla and Son's Premium Dine", lat: baseLat - 0.005, lng: baseLng + 0.006, rating: 4.9, price: "₹1500" },
        { id: 5, name: "Domino's Pizza", lat: baseLat + 0.002, lng: baseLng - 0.005, rating: 4.3, price: "₹300" },
        { id: 6, name: "Burger King", lat: baseLat - 0.006, lng: baseLng + 0.003, rating: 4.1, price: "₹200" }
    ];
    
    let results = hotels;
    if (query && query !== 'hotel' && query !== 'hotels' && query !== 'restaurant' && query !== 'restaurants') {
        results = hotels.filter(h => h.name.toLowerCase().includes(query));
    }
    
    res.json(results);
});

// Search API (Mock Data for Food and Restaurants)
app.get('/api/search', (req, res) => {
    const { q, lat, lng } = req.query;
    const query = (q || '').toLowerCase();
    
    const baseLat = parseFloat(lat) || 26.4499;
    const baseLng = parseFloat(lng) || 80.3319;
    
    const allItems = [
        // Category: North Indian (Main Course)
        { id: 101, name: "Paneer Butter Masala", restaurant: "The Grand Kitchen", type: "food", category: "north indian", rating: 4.8, price: 280, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Butter_Naan_With_Paneer_Butter_Masala.jpg" },
        { id: 102, name: "Kadai Paneer", restaurant: "Shukla and Son's", type: "food", category: "north indian", rating: 4.7, price: 260, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Kadai_Paneer_With_Gravy.jpg" },
        { id: 103, name: "Shahi Paneer", restaurant: "Royal Dine", type: "food", category: "north indian", rating: 4.9, price: 290, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/58/Shahi_Paneer_%26_Butter_Naan.jpg" },
        { id: 104, name: "Dal Makhani", restaurant: "Punjab Grill", type: "food", category: "north indian", rating: 4.8, price: 220, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/35/Dal_Makhani_01.jpg" },
        { id: 105, name: "Mix Veg Curry", restaurant: "Green Leaf", type: "food", category: "north indian", rating: 4.5, price: 190, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Mix_veg_with_garlic_kulcha.jpg" },
        { id: 106, name: "Malai Kofta", restaurant: "The Grand Kitchen", type: "food", category: "north indian", rating: 4.6, price: 270, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Malai_Kofta_Curry.jpg" },
        { id: 107, name: "Matar Paneer", restaurant: "Shukla and Son's", type: "food", category: "north indian", rating: 4.7, price: 240, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/56/Matar_Paneer_Curry_1.jpg" },
        { id: 108, name: "Palak Paneer", restaurant: "Healthy Eats", type: "food", category: "north indian", rating: 4.4, price: 250, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Palak_Paneer_curry_on_plate.jpg" },
        { id: 109, name: "Chana Masala", restaurant: "Amritsari Tadka", type: "food", category: "north indian", rating: 4.5, price: 180, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Chana_Masala_Fry.jpg" },
        { id: 110, name: "Aloo Gobi", restaurant: "Desi Dhaba", type: "food", category: "north indian", rating: 4.3, price: 160, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aloo_Gobi_Sabzi.jpg" },
        
        // Category: Breads & Rice
        { id: 111, name: "Butter Naan", restaurant: "The Grand Kitchen", type: "food", category: "breads", rating: 4.9, price: 50, imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80" },
        { id: 112, name: "Garlic Naan", restaurant: "Punjab Grill", type: "food", category: "breads", rating: 4.8, price: 60, imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80" },
        { id: 113, name: "Tandoori Roti", restaurant: "Desi Dhaba", type: "food", category: "breads", rating: 4.5, price: 25, imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80" },
        { id: 114, name: "Jeera Rice", restaurant: "Royal Dine", type: "food", category: "rice", rating: 4.6, price: 120, imageUrl: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80" },
        { id: 115, name: "Veg Pulao", restaurant: "Shukla and Son's", type: "food", category: "rice", rating: 4.7, price: 180, imageUrl: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80" },
        
        // Category: Biryani (Veg)
        { id: 116, name: "Hyderabadi Veg Biryani", restaurant: "Biryani Blues", type: "food", category: "biryani", rating: 4.8, price: 250, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80" },
        { id: 117, name: "Paneer Dum Biryani", restaurant: "Awadh Biryani", type: "food", category: "biryani", rating: 4.9, price: 280, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80" },
        { id: 118, name: "Mushroom Biryani", restaurant: "Paradise", type: "food", category: "biryani", rating: 4.6, price: 260, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80" },
        
        // Category: South Indian
        { id: 119, name: "Masala Dosa", restaurant: "Saravana Bhavan", type: "food", category: "south indian", rating: 4.8, price: 140, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/Masala_dosa_01.jpg" },
        { id: 120, name: "Paneer Dosa", restaurant: "Sagar Ratna", type: "food", category: "south indian", rating: 4.7, price: 180, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/PANEER_MASALA_DOSA_-_Mini_MADRAS_2016-05-03.jpg" },
        { id: 121, name: "Idli Sambar", restaurant: "Udupi Cafe", type: "food", category: "south indian", rating: 4.5, price: 100, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/02/Idli_Sambar-Noida-UP-SP004.jpg" },
        { id: 122, name: "Medu Vada", restaurant: "Saravana Bhavan", type: "food", category: "south indian", rating: 4.6, price: 90, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Medu_Vada_-_Calcutta_16_2013-07-11.jpg" },
        { id: 123, name: "Rava Dosa", restaurant: "Sagar Ratna", type: "food", category: "south indian", rating: 4.7, price: 150, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/Rava_Dosa_with_Coconut_Chutney.jpg" },
        { id: 124, name: "Uttapam", restaurant: "Udupi Cafe", type: "food", category: "south indian", rating: 4.4, price: 130, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Food-Uttapam-2.jpg" },
        
        // Category: Fast Food (Burgers, Sandwiches, Wraps)
        { id: 125, name: "Aloo Tikki Burger", restaurant: "Burger King", type: "food", category: "burger", rating: 4.2, price: 89, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Aloo_tikki_burger_%28homemade%29.jpg" },
        { id: 126, name: "Veg Maharaja Mac", restaurant: "McDonald's", type: "food", category: "burger", rating: 4.5, price: 199, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
        { id: 127, name: "Spicy Paneer Burger", restaurant: "Burger King", type: "food", category: "burger", rating: 4.7, price: 179, imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80" },
        { id: 128, name: "Crispy Veg Burger", restaurant: "Wendy's", type: "food", category: "burger", rating: 4.4, price: 129, imageUrl: "https://images.unsplash.com/photo-1594212666324-c1e138377b79?w=800&q=80" },
        { id: 129, name: "Cheese Grilled Sandwich", restaurant: "Subway", type: "food", category: "sandwich", rating: 4.6, price: 149, imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80" },
        { id: 130, name: "Paneer Tikka Sandwich", restaurant: "Subway", type: "food", category: "sandwich", rating: 4.8, price: 189, imageUrl: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=800&q=80" },
        { id: 131, name: "Veggie Delite Wrap", restaurant: "Faasos", type: "food", category: "wrap", rating: 4.3, price: 139, imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80" },
        { id: 132, name: "Cheesy Paneer Wrap", restaurant: "Faasos", type: "food", category: "wrap", rating: 4.7, price: 179, imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80" },
        
        // Category: Pizza (Veg)
        { id: 133, name: "Margherita Pizza", restaurant: "Domino's Pizza", type: "food", category: "pizza", rating: 4.6, price: 249, imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80" },
        { id: 134, name: "Farmhouse Pizza", restaurant: "Domino's Pizza", type: "food", category: "pizza", rating: 4.8, price: 399, imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
        { id: 135, name: "Peppy Paneer Pizza", restaurant: "Domino's Pizza", type: "food", category: "pizza", rating: 4.9, price: 449, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
        { id: 136, name: "Veg Extravaganza", restaurant: "Pizza Hut", type: "food", category: "pizza", rating: 4.7, price: 499, imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80" },
        { id: 137, name: "Cheese n Corn Pizza", restaurant: "La Pino'z", type: "food", category: "pizza", rating: 4.5, price: 299, imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80" },
        { id: 138, name: "Mushroom Delight Pizza", restaurant: "Oven Story", type: "food", category: "pizza", rating: 4.6, price: 349, imageUrl: "https://images.unsplash.com/photo-1604381536136-57e9d4e5658e?w=800&q=80" },
        
        // Category: Chinese (Veg)
        { id: 139, name: "Veg Hakka Noodles", restaurant: "Mainland China", type: "food", category: "chinese", rating: 4.5, price: 190, imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80" },
        { id: 140, name: "Chilli Paneer Dry", restaurant: "Chung Fa", type: "food", category: "chinese", rating: 4.7, price: 240, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80" },
        { id: 141, name: "Veg Manchurian", restaurant: "Spice Route", type: "food", category: "chinese", rating: 4.6, price: 210, imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80" },
        { id: 142, name: "Veg Fried Rice", restaurant: "Mainland China", type: "food", category: "chinese", rating: 4.4, price: 180, imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80" },
        { id: 143, name: "Spring Rolls", restaurant: "Chowman", type: "food", category: "chinese", rating: 4.8, price: 160, imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80" },
        { id: 144, name: "Chilli Mushroom", restaurant: "Spice Route", type: "food", category: "chinese", rating: 4.5, price: 230, imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80" },
        
        // Category: Starters / Snacks
        { id: 145, name: "Paneer Tikka", restaurant: "Barbeque Nation", type: "food", category: "snacks", rating: 4.9, price: 280, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80" },
        { id: 146, name: "Dahi Ke Sholay", restaurant: "Haldiram's", type: "food", category: "snacks", rating: 4.6, price: 180, imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80" },
        { id: 147, name: "Hara Bhara Kebab", restaurant: "The Grand Kitchen", type: "food", category: "snacks", rating: 4.5, price: 220, imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80" },
        { id: 148, name: "Samosa (2 pcs)", restaurant: "Bikanervala", type: "food", category: "snacks", rating: 4.8, price: 40, imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80" },
        { id: 149, name: "Pav Bhaji", restaurant: "Bombay Street Food", type: "food", category: "snacks", rating: 4.7, price: 130, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80" },
        
        // Category: Desserts
        { id: 150, name: "Choco Lava Cake", restaurant: "Domino's Pizza", type: "food", category: "desserts", rating: 4.8, price: 119, imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80" },
        { id: 151, name: "Gulab Jamun (2 pcs)", restaurant: "Haldiram's", type: "food", category: "desserts", rating: 4.9, price: 80, imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80" },
        { id: 152, name: "Rasmalai", restaurant: "Bikanervala", type: "food", category: "desserts", rating: 4.7, price: 120, imageUrl: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800&q=80" },
        { id: 153, name: "Vanilla Ice Cream", restaurant: "Baskin Robbins", type: "food", category: "desserts", rating: 4.5, price: 90, imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80" },
        { id: 154, name: "Brownie with Ice Cream", restaurant: "The Grand Kitchen", type: "food", category: "desserts", rating: 4.9, price: 180, imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80" },
        
        // Category: Drinks
        { id: 155, name: "Cold Coffee", restaurant: "Starbucks", type: "food", category: "drinks", rating: 4.7, price: 190, imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80" },
        { id: 156, name: "Mango Lassi", restaurant: "Haldiram's", type: "food", category: "drinks", rating: 4.8, price: 110, imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80" },
        { id: 157, name: "Sweet Lassi", restaurant: "Bikanervala", type: "food", category: "drinks", rating: 4.5, price: 90, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80" },
        { id: 158, name: "Fresh Lime Soda", restaurant: "Shukla and Son's", type: "food", category: "drinks", rating: 4.4, price: 70, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80" },
        { id: 159, name: "Strawberry Milkshake", restaurant: "Keventers", type: "food", category: "drinks", rating: 4.6, price: 160, imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80" }
    ];
    
    let results = allItems;
    
    if (query) {
        if (query === 'restaurant' || query === 'restaurants' || query === 'menu') {
            results = allItems;
        } else {
            results = allItems.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.restaurant.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }
    } else {
        // Trending section: pick up to 20 items of mixed varieties
        const trendingItems = [];
        const categories = [...new Set(allItems.map(i => i.category))];
        
        categories.forEach(cat => {
            const catItems = allItems.filter(i => i.category === cat);
            // Take 2 items from each category for variety
            trendingItems.push(...catItems.slice(0, 2));
        });
        
        // Return exactly 20 items for the trending feed
        results = trendingItems.slice(0, 20);
    }
    
    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
