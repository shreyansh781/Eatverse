const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

async function getImageUrl(query) {
    try {
        // Search Wikimedia Commons for the food
        let searchRes = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + " food")}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`, {
            headers: { 'User-Agent': 'FoodAppBot/1.0' }
        });
        let data = await searchRes.json();
        if (data.query && data.query.pages) {
            let pages = Object.values(data.query.pages);
            if (pages.length > 0 && pages[0].imageinfo && pages[0].imageinfo.length > 0) {
                let imgUrl = pages[0].imageinfo[0].url;
                return imgUrl;
            }
        }
        
        // Fallback: search English Wikipedia
        searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&pithumbsize=1000&format=json`, {
            headers: { 'User-Agent': 'FoodAppBot/1.0' }
        });
        data = await searchRes.json();
        if (data.query && data.query.pages) {
            let pages = Object.values(data.query.pages);
            if (pages.length > 0 && pages[0].thumbnail) {
                return pages[0].thumbnail.source;
            }
        }
    } catch (e) {
        console.error("Error for", query, e.message);
    }
    return null;
}

// Map manual fallbacks for tricky ones
const fallbacks = {
    'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
    'Wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
    'Noodles': 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80',
    'Coffee': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    'Ice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
    'Paneer': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    'Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    'Gulab Jamun': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80'
};

async function run() {
    // We will parse all items in server.js using Regex
    let matches = [...content.matchAll(/({.*?id:\s*(\d+),.*?name:\s*"([^"]+)",.*?category:\s*"([^"]+)",.*?imageUrl:\s*")([^"]+)(".*?\})/g)];
    
    console.log(`Found ${matches.length} items to update.`);
    
    let updatedContent = content;
    
    for (let match of matches) {
        let fullMatch = match[0];
        let id = match[2];
        let name = match[3];
        let category = match[4];
        let before = match[1];
        let after = match[6];
        
        let img = await getImageUrl(name);
        
        if (!img) {
            // Check fallback by keywords
            for (let k in fallbacks) {
                if (name.toLowerCase().includes(k.toLowerCase()) || category.toLowerCase().includes(k.toLowerCase())) {
                    img = fallbacks[k];
                    break;
                }
            }
        }
        
        if (img) {
            console.log(`Matched ${name} -> ${img}`);
            updatedContent = updatedContent.replace(fullMatch, before + img + after);
        } else {
            console.log(`No image found for ${name}`);
        }
        
        // small delay to not overwhelm Wiki API
        await new Promise(r => setTimeout(r, 200));
    }
    
    fs.writeFileSync(serverPath, updatedContent);
    console.log("Finished updating server.js");
}

run();
