const fs = require('fs');
const path = require('path');

async function fetchMeals() {
    let images = [];
    const letters = ['a', 'b', 'c', 'd', 'p', 's', 'm', 'r', 'v', 't', 'k', 'l', 'g'];
    
    for (let letter of letters) {
        try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
            const data = await res.json();
            if (data.meals) {
                for (let meal of data.meals) {
                    images.push(meal.strMealThumb);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    // Shuffle images array
    images = images.sort(() => 0.5 - Math.random());
    
    console.log(`Fetched ${images.length} unique images!`);
    
    const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
    let content = fs.readFileSync(serverPath, 'utf8');
    
    let index = 0;
    
    // Replace all imageUrls with unique MealDB images
    content = content.replace(/({.*?imageUrl:\s*")([^"]+)(".*?\})/g, (match, before, oldUrl, after) => {
        let newUrl = images[index % images.length];
        index++;
        return before + newUrl + '/preview' + after; // Using /preview for smaller size (500x500 ish) or just raw
    });
    
    fs.writeFileSync(serverPath, content);
    console.log(`Replaced images in server.js successfully.`);
}

fetchMeals();
