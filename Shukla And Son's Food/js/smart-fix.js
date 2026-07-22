const fs = require('fs');
const path = require('path');

const imgPools = {
    'north indian': [
        '1631452180519-c014fe946bc0',
        '1565557623262-b51c2513a641',
        '1589301760014-d929f39ce9b1',
        '1606491956689-2ea866880c84',
        '1585937421612-70a008356fbe',
        '1601050690597-df0568f70950'
    ],
    'breads': ['1626200419199-391ae4be7a41'],
    'rice': ['1516684732162-798a0062be99'],
    'biryani': ['1563379091339-03b21ab4a4f8', '1589302168068-964664d93cb0', '1516684732162-798a0062be99'],
    'south indian': ['1610192244261-3f33de3f55e4', '1589301760014-d929f39ce9b1'],
    'burger': ['1585238342024-78d387f4a707', '1568901346375-23c9450c58cd', '1610440042657-612c34d95e9f', '1594212666324-c1e138377b79'],
    'sandwich': ['1528735602780-2552fd46c7af'],
    'wrap': ['1626700051175-6818013e1d4f'],
    'pizza': ['1574071318508-1cdbab80d002', '1513104890138-7c749659a591', '1565299624946-b28f40a0ae38', '1628840042765-356cda07504e'],
    'chinese': ['1552611052-33e04de081de', '1525755662778-989d0524087e', '1585032226651-759b368d7246', '1544025162-d76694265947'],
    'snacks': ['1599487488170-d11ec9c172f0', '1601050690597-df0568f70950', '1606491956689-2ea866880c84'],
    'desserts': ['1578985545062-69928b1d9587', '1551024601-bec78aea704b', '1495147466023-ac5c588e2e94', '1497034825429-c343d7c6a68f', '1606313564200-e75d5e30476c'],
    'drinks': ['1461023058943-07fcbe16d735', '1546833999-b9f581a1996d', '1513558161293-cdaf765ed2fd', '1572490122747-3968b75cc699']
};

let pIndex = {};

const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Replace imageUrls
content = content.replace(/({.*?category:\s*"([^"]+)",.*?imageUrl:\s*")([^"]+)(".*?\})/g, (match, before, category, oldUrl, after) => {
    category = category.toLowerCase();
    
    // special fallbacks if category is unknown
    if (!imgPools[category]) category = 'snacks';
    
    if (!pIndex[category]) pIndex[category] = 0;
    
    // get next image in the pool
    let imgId = imgPools[category][pIndex[category] % imgPools[category].length];
    pIndex[category]++;
    
    let newUrl = `https://images.unsplash.com/photo-${imgId}?w=500&q=80`;
    return before + newUrl + after;
});

fs.writeFileSync(serverPath, content);
console.log('Smart images applied!');
