document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        window.location.href = 'index.html';
        return;
    }
    
    const currentUser = JSON.parse(currentUserJson);
    const API_URL = 'http://localhost:3000/api';
    
    // Custom Toast
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';
        
        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Populate UI User Data
    const profileSpan = document.querySelector('#user-profile span');
    if (profileSpan && currentUser.name) {
        profileSpan.textContent = currentUser.name.split(' ')[0];
    }
    
    const addressDisplay = document.getElementById('user-address-display');
    if (addressDisplay && currentUser.address) {
        addressDisplay.textContent = currentUser.address;
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // --- Profile Sidebar & Modal Logic ---
    const profileSidebar = document.getElementById('profile-sidebar');
    const profileBtn = document.getElementById('profile-btn');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    
    // Set Sidebar Data
    document.getElementById('sidebar-name').textContent = currentUser.name;
    document.getElementById('sidebar-email').textContent = currentUser.email;

    function toggleProfileSidebar() {
        profileSidebar.classList.toggle('open');
        if(profileSidebar.classList.contains('open') && typeof cartSidebar !== 'undefined') {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        }
    }

    profileBtn.addEventListener('click', toggleProfileSidebar);
    closeProfileBtn.addEventListener('click', toggleProfileSidebar);

    // My Orders Modal
    const ordersModal = document.getElementById('orders-modal');
    document.getElementById('menu-orders').addEventListener('click', () => {
        toggleProfileSidebar();
        ordersModal.classList.add('active');
        fetchMyOrders();
    });
    document.getElementById('close-orders-btn').addEventListener('click', () => {
        ordersModal.classList.remove('active');
    });

    async function fetchMyOrders() {
        const list = document.getElementById('my-orders-list');
        list.innerHTML = '<div class="loader-circle text-center mt-3"><i class="fa-solid fa-circle-notch fa-spin"></i></div>';
        try {
            const res = await fetch(`${API_URL}/orders/${currentUser.userId}`);
            const data = await res.json();
            list.innerHTML = '';
            if(data.success && data.orders.length > 0) {
                data.orders.forEach(o => {
                    let stClass = 'status-confirmed';
                    let statusText = o.status;
                    let elapsed = Math.floor((Date.now() - new Date(o.date).getTime()) / 1000);
                    let trackBtnHtml = '';
                    
                    if(elapsed < 10) { stClass = 'status-confirmed'; statusText = 'Order Confirmed'; }
                    else if(elapsed < 20) { stClass = 'status-preparing'; statusText = 'Preparing'; }
                    else if(elapsed < 40) { stClass = 'status-ontheway'; statusText = 'On the way'; }
                    else { stClass = 'status-delivered'; statusText = 'Delivered'; }
                    
                    let btnText = elapsed < 40 ? 'Track Order' : 'View Delivery Summary';
                    let btnIcon = elapsed < 40 ? 'fa-location-dot' : 'fa-circle-check';
                    trackBtnHtml = `<button class="btn btn-outline btn-sm mt-2" onclick="window.reopenTracking('${o.orderId}', ${new Date(o.date).getTime()})" style="padding:4px 10px; font-size:12px; margin-top:10px;"><i class="fa-solid ${btnIcon}"></i> ${btnText}</button>`;
                    
                    list.innerHTML += `
                        <div class="order-card" style="flex-direction:column; align-items:flex-start;">
                            <div style="display:flex; justify-content:space-between; width:100%;">
                                <div class="order-info">
                                    <h3>${o.orderId}</h3>
                                    <p class="order-date">${new Date(o.date).toLocaleString()}</p>
                                    <p class="text-primary mt-1">₹${o.totalAmount} • ${o.items.length} Items</p>
                                </div>
                                <div class="order-status ${stClass}" style="height:fit-content;">${statusText}</div>
                            </div>
                            ${trackBtnHtml}
                        </div>
                    `;
                });
            } else {
                list.innerHTML = '<p class="text-muted text-center mt-3">No orders found. Time to eat!</p>';
            }
        } catch(e) {
            list.innerHTML = '<p class="text-muted text-center mt-3 text-primary">Failed to load orders.</p>';
        }
    }

    // --- Cart Logic ---
    let cart = [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    
    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    }

    document.getElementById('open-cart-btn').addEventListener('click', toggleCart);
    document.getElementById('close-cart-btn').addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    // --- Checkout Flow Logic ---
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');
    
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if(cart.length === 0) return showToast('Your cart is empty!', 'error');
        
        // Populate Summary
        checkoutSummaryItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const div = document.createElement('div');
            div.style.cssText = "display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;";
            div.innerHTML = `<span>${item.quantity}x ${item.name}</span><span class="text-primary">₹${itemTotal}</span>`;
            checkoutSummaryItems.appendChild(div);
        });
        document.getElementById('checkout-total').textContent = total;
        document.getElementById('pay-amount').textContent = total;
        
        // Populate Address Dropdown
        const addrSelect = document.getElementById('checkout-address-select');
        let addrs = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        if(addrs.length === 0 && currentUser.address) {
            addrs.push(currentUser.address);
            localStorage.setItem('savedAddresses', JSON.stringify(addrs));
        }
        
        addrSelect.innerHTML = '';
        addrs.forEach((a, i) => {
            addrSelect.innerHTML += `<option value="${i}">${a}</option>`;
        });
        addrSelect.innerHTML += `<option value="new">+ Add New Address</option>`;
        document.getElementById('checkout-new-address-container').style.display = 'none';
        
        // Reset Steps
        showCheckoutStep(1);
        
        // Show Modal
        toggleCart(); // Close cart sidebar
        checkoutOverlay.classList.add('active');
    });

    document.getElementById('checkout-address-select').addEventListener('change', (e) => {
        if(e.target.value === 'new') {
            document.getElementById('checkout-new-address-container').style.display = 'block';
        } else {
            document.getElementById('checkout-new-address-container').style.display = 'none';
        }
    });

    document.getElementById('checkout-save-address-btn').addEventListener('click', () => {
        const val = document.getElementById('checkout-new-address-input').value.trim();
        if(!val) return showToast('Address cannot be empty', 'error');
        let addrs = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        if(addrs.length === 0 && currentUser.address) addrs.push(currentUser.address);
        addrs.push(val);
        localStorage.setItem('savedAddresses', JSON.stringify(addrs));
        
        // Update select
        const addrSelect = document.getElementById('checkout-address-select');
        addrSelect.innerHTML = '';
        addrs.forEach((a, i) => {
            addrSelect.innerHTML += `<option value="${i}">${a}</option>`;
        });
        addrSelect.innerHTML += `<option value="new">+ Add New Address</option>`;
        
        // Select the newly added address
        addrSelect.value = addrs.length - 1;
        document.getElementById('checkout-new-address-input').value = '';
        document.getElementById('checkout-new-address-container').style.display = 'none';
        showToast('Address saved and selected', 'success');
        if (typeof renderAddresses === 'function') renderAddresses();
    });

    document.getElementById('close-checkout-btn').addEventListener('click', () => {
        checkoutOverlay.classList.remove('active');
        document.querySelector('.checkout-modal').classList.remove('fullscreen');
    });

    // Step management
    function showCheckoutStep(stepNumber) {
        document.querySelectorAll('.checkout-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.step').forEach((el, index) => {
            el.classList.remove('active', 'completed');
            if (index < stepNumber - 1) el.classList.add('completed');
            if (index === stepNumber - 1) el.classList.add('active');
        });
        
        if (stepNumber === 1) document.getElementById('checkout-step-1').style.display = 'block';
        if (stepNumber === 2) document.getElementById('checkout-step-2').style.display = 'block';
        if (stepNumber === 2.5) document.getElementById('checkout-processing').style.display = 'block';
        if (stepNumber === 3) document.getElementById('checkout-step-3').style.display = 'block';
    }

    document.getElementById('proceed-payment-btn').addEventListener('click', () => showCheckoutStep(2));

    // Payment Methods Toggle
    document.querySelectorAll('.pay-method').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
            const method = e.currentTarget.dataset.method;
            e.currentTarget.classList.add('active');
            
            document.getElementById('card-details-ui').style.display = method === 'card' ? 'block' : 'none';
            document.getElementById('upi-details-ui').style.display = method === 'upi' ? 'block' : 'none';
            document.getElementById('cod-details-ui').style.display = method === 'cod' ? 'block' : 'none';
        });
    });

    // Process Payment
    document.getElementById('pay-now-btn').addEventListener('click', () => {
        // Validation
        const activeMethod = document.querySelector('.pay-method.active').dataset.method;
        if(activeMethod === 'card') {
            const num = document.getElementById('card-num').value.trim();
            const exp = document.getElementById('card-exp').value.trim();
            const cvv = document.getElementById('card-cvv').value.trim();
            if(num.length < 16) return showToast('Please enter a valid Card Number', 'error');
            if(exp.length < 5 || !exp.includes('/')) return showToast('Please enter valid MM/YY (e.g. 12/25)', 'error');
            if(cvv.length < 3) return showToast('Please enter valid CVV', 'error');
        } else if(activeMethod === 'upi') {
            const upi = document.getElementById('upi-id').value.trim();
            if(upi.length < 5 || !upi.includes('@')) return showToast('Please enter a valid UPI ID', 'error');
        }
        
        showCheckoutStep(2.5); // Processing
        
        setTimeout(async () => {
            const orderTotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const fakeOrderId = '#ORD' + Math.floor(Math.random() * 90000 + 10000);
            
            try {
                // Post to Backend
                await fetch(`${API_URL}/order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.userId,
                        order: {
                            orderId: fakeOrderId,
                            items: cart,
                            totalAmount: orderTotal,
                            status: 'Order Confirmed'
                        }
                    })
                });
                
                document.getElementById('final-order-id').textContent = fakeOrderId;
                
                // Save Tracking State to LocalStorage
                const orderNameStr = cart.length === 1 ? cart[0].name : cart[0].name + ' + ' + (cart.length - 1) + ' more';
                localStorage.setItem('activeOrder', JSON.stringify({
                    orderId: fakeOrderId,
                    orderName: orderNameStr,
                    timestamp: Date.now(),
                    notified: false
                }));
                
                showCheckoutStep(3); // Success/Tracking
                document.querySelector('.checkout-modal').classList.add('fullscreen');
                
                cart = []; updateCartUI();
                startTrackingAnimation();
            } catch(e) {
                showToast('Payment failed. Try again.', 'error');
                showCheckoutStep(2);
            }
        }, 2000);
    });

    let trackingInterval;
    function startTrackingAnimation() {
        const fill = document.getElementById('tracking-fill');
        const stages = [
            document.getElementById('ts-1'),
            document.getElementById('ts-2'),
            document.getElementById('ts-3'),
            document.getElementById('ts-4'),
            document.getElementById('ts-5')
        ];
        const successAnim = document.getElementById('success-anim-container');
        successAnim.innerHTML = `
            <svg class="checkmark-circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
        `;
        
        if(typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        
        clearInterval(trackingInterval);
        
        function updateTimeline() {
            const activeOrderJson = localStorage.getItem('activeOrder');
            if(!activeOrderJson) return;
            const activeOrder = JSON.parse(activeOrderJson);
            const elapsed = Math.floor((Date.now() - activeOrder.timestamp) / 1000);
            
            // 10 sec per stage: 0=1, 10=2, 20=3, 30=4, 40=5
            stages.forEach(s => s.classList.remove('active'));
            
            if(elapsed < 10) { fill.style.width = '20%'; stages[0].classList.add('active'); }
            else if(elapsed < 20) { fill.style.width = '40%'; stages[0].classList.add('active'); stages[1].classList.add('active'); }
            else if(elapsed < 30) { fill.style.width = '60%'; stages[0].classList.add('active'); stages[1].classList.add('active'); stages[2].classList.add('active'); }
            else if(elapsed < 40) { fill.style.width = '80%'; stages[0].classList.add('active'); stages[1].classList.add('active'); stages[2].classList.add('active'); stages[3].classList.add('active'); }
            else { 
                fill.style.width = '100%'; 
                stages.forEach(s => s.classList.add('active')); 
                clearInterval(trackingInterval);
                if(elapsed >= 40 && elapsed < 42 && typeof confetti === 'function') confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
            }
        }
        
        updateTimeline();
        trackingInterval = setInterval(updateTimeline, 1000);
    }

    document.getElementById('view-orders-btn').addEventListener('click', () => {
        checkoutOverlay.classList.remove('active');
        document.querySelector('.checkout-modal').classList.remove('fullscreen');
        document.getElementById('menu-orders').click();
    });

    document.getElementById('back-home-btn').addEventListener('click', () => {
        checkoutOverlay.classList.remove('active');
        document.querySelector('.checkout-modal').classList.remove('fullscreen');
    });

    // On Load, check if active order exists
    if(localStorage.getItem('activeOrder')) {
        const o = JSON.parse(localStorage.getItem('activeOrder'));
        if(Date.now() - o.timestamp < 60000) {
            // Re-open tracking if within 1 min
            document.getElementById('final-order-id').textContent = o.orderId;
            showCheckoutStep(3);
            document.querySelector('.checkout-modal').classList.add('fullscreen');
            checkoutOverlay.classList.add('active');
            startTrackingAnimation();
        }
    }

    function updateCartUI() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-state">
                    <i class="fa-solid fa-basket-shopping empty-icon"></i>
                    <p>Your cart is looking a little empty.</p>
                </div>`;
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">₹${item.price}</span>
                    </div>
                    <div class="cart-qty-controls">
                        <button class="qty-btn dec-btn" data-index="${index}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn inc-btn" data-index="${index}">+</button>
                    </div>
                    <button class="remove-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                `;
                cartItemsContainer.appendChild(div);
            });

            document.querySelectorAll('.inc-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    cart[e.currentTarget.dataset.index].quantity++;
                    updateCartUI();
                });
            });
            document.querySelectorAll('.dec-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.currentTarget.dataset.index;
                    if(cart[idx].quantity > 1) cart[idx].quantity--;
                    updateCartUI();
                });
            });
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    cart.splice(e.currentTarget.dataset.index, 1);
                    updateCartUI();
                });
            });
        }
        document.getElementById('cart-total').textContent = total;
    }

    // --- Search & Grid Logic ---
    const gridContainer = document.getElementById('food-grid-container');
    const gridTitle = document.getElementById('grid-title');

    function getIconClass(category) {
        if(category.includes('pizza')) return 'fa-pizza-slice text-primary';
        if(category.includes('burger')) return 'fa-burger text-primary';
        if(category.includes('sushi')) return 'fa-fish text-primary';
        if(category.includes('pasta')) return 'fa-bowl-rice text-primary';
        return 'fa-utensils text-primary';
    }

    async function fetchAndRenderFood(query = '') {
        try {
            gridContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';
            
            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&_t=${Date.now()}`);
            if(!res.ok) throw new Error('Network error');
            const items = await res.json();
            
            gridContainer.innerHTML = '';
            
            if (items.length === 0) {
                gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No tasty results found for your search.</p>';
                return;
            }
            
            items.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'food-card animate-card';
                card.style.animationDelay = `${index * 0.05}s`;
                // Fallback to local images if imageUrl is missing
                const imgUrl = item.imageUrl || `images/${item.imgClass || 'pizza'}.png`;
                card.innerHTML = `
                    <div class="food-img" style="background-image: url('${imgUrl}');"></div>
                    <div class="food-info">
                        <h3>${item.name}</h3>
                        <p class="restaurant"><i class="fa-solid fa-store" style="font-size:10px;"></i> ${item.restaurant}</p>
                        <div class="food-meta">
                            <span class="price">₹${item.price}</span>
                            <span class="rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
                        </div>
                        <div style="display:flex; gap:10px; width:100%;">
                            <button class="btn btn-outline add-to-cart-btn" style="flex:1;" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                                <i class="fa-solid fa-plus"></i> Add
                            </button>
                            <button class="icon-btn fav-toggle-btn" style="width:45px;" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-img="${imgUrl}" title="Favorite">
                                <i class="fa-solid fa-heart"></i>
                            </button>
                        </div>
                    </div>
                `;
                gridContainer.appendChild(card);
            });
            
            document.querySelectorAll('.fav-toggle-btn').forEach(btn => {
                const id = btn.dataset.id;
                let favs = JSON.parse(localStorage.getItem('savedFavorites') || '[]');
                if(favs.find(f => f.id === id)) {
                    btn.querySelector('i').classList.add('text-primary');
                }
                
                btn.addEventListener('click', (e) => {
                    const el = e.currentTarget;
                    let favs = JSON.parse(localStorage.getItem('savedFavorites') || '[]');
                    const exists = favs.find(f => f.id === id);
                    if(exists) {
                        favs = favs.filter(f => f.id !== id);
                        el.querySelector('i').classList.remove('text-primary');
                        showToast('Removed from Favorites');
                    } else {
                        favs.push({
                            id: id,
                            name: el.dataset.name,
                            price: el.dataset.price,
                            img: el.dataset.img
                        });
                        el.querySelector('i').classList.add('text-primary');
                        showToast('Added to Favorites', 'success');
                    }
                    localStorage.setItem('savedFavorites', JSON.stringify(favs));
                });
            });

            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const el = e.currentTarget;
                    const id = el.dataset.id;
                    const existingItem = cart.find(i => i.id === id);
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cart.push({ id, name: el.dataset.name, price: parseInt(el.dataset.price), quantity: 1 });
                    }
                    updateCartUI();
                    
                    const originalHtml = el.innerHTML;
                    el.innerHTML = '<i class="fa-solid fa-check"></i> Added';
                    el.style.background = 'var(--primary)';
                    el.style.color = 'white';
                    el.style.borderColor = 'var(--primary)';
                    
                    setTimeout(() => {
                        el.innerHTML = originalHtml;
                        el.style = '';
                    }, 1000);
                });
            });
            
        } catch (err) {
            console.error(err);
            gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px;">Failed to load food items. Is backend running?</p>';
        }
    }

    // Map Logic
    let globalLat = 26.4499, globalLng = 80.3319;
    let mapInstance = null;
    let markersGroup = L.layerGroup();

    async function fetchAndRenderHotels(query = '') {
        try {
            const res = await fetch(`${API_URL}/hotels?q=${encodeURIComponent(query)}&lat=${globalLat}&lng=${globalLng}&_t=${Date.now()}`);
            if(!res.ok) return;
            const hotels = await res.json();
            
            markersGroup.clearLayers();
            
            hotels.forEach(hotel => {
                const icon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });
                L.marker([hotel.lat, hotel.lng], {icon}).addTo(markersGroup)
                 .bindPopup(`<div style="font-family:'Outfit',sans-serif"><b>${hotel.name}</b><br>⭐ ${hotel.rating}<br>Price: ${hotel.price}</div>`);
            });
            
            if (mapInstance) markersGroup.addTo(mapInstance);
        } catch(e) {}
    }

    // --- Advanced Search System ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchSuggestions = document.getElementById('search-suggestions');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        clearTimeout(searchTimeout);
        if(!q) {
            searchSuggestions.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`);
                const items = await res.json();
                
                if(items.length > 0) {
                    searchSuggestions.innerHTML = '';
                    items.slice(0, 5).forEach(item => {
                        const imgUrl = item.imageUrl || `images/${item.imgClass || 'pizza'}.png`;
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.innerHTML = `
                            <div class="suggestion-img" style="background-image: url('${imgUrl}');"></div>
                            <div>
                                <h4 style="font-size:14px; margin-bottom:4px;">${item.name}</h4>
                                <span class="text-muted text-sm">${item.restaurant}</span>
                            </div>
                        `;
                        div.addEventListener('click', () => {
                            searchInput.value = item.name;
                            searchSuggestions.style.display = 'none';
                            searchBtn.click();
                        });
                        searchSuggestions.appendChild(div);
                    });
                    searchSuggestions.style.display = 'block';
                } else {
                    searchSuggestions.style.display = 'none';
                }
            } catch(err) {}
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if(!e.target.closest('.search-bar')) searchSuggestions.style.display = 'none';
    });

    searchBtn.addEventListener('click', () => {
        searchSuggestions.style.display = 'none';
        const q = searchInput.value.trim();
        gridTitle.textContent = q ? `Results for "${q}"` : "Our Menu";
        fetchAndRenderFood(q);
        fetchAndRenderHotels(q);
    });

    searchInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') searchBtn.click();
    });

    // Category pills click handler
    document.querySelectorAll('.cat-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const term = e.currentTarget.dataset.cat || '';
            searchInput.value = term;
            searchBtn.click();
        });
    });

    async function initMap() {
        const address = currentUser.address || "Kanpur, Uttar Pradesh";
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const geoData = await geoRes.json();
            
            if (geoData && geoData.length > 0) {
                globalLat = parseFloat(geoData[0].lat);
                globalLng = parseFloat(geoData[0].lon);
            }
            
            mapInstance = L.map('map', { zoomControl: false }).setView([globalLat, globalLng], 13);
            L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
            
            // CartoDB Dark Matter base map for modern look
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance);
            
            // Custom User Marker
            const userIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            });
            
            L.marker([globalLat, globalLng], {icon: userIcon}).addTo(mapInstance)
                .bindPopup(`<div style="font-family:'Outfit',sans-serif"><b>Home</b><br>${address}</div>`)
                .openPopup();
                
            fetchAndRenderHotels();
            
        } catch (error) {
            document.getElementById('map').innerHTML = "<div style='display:flex; height:100%; justify-content:center; align-items:center; color:#94a3b8;'>Map unavailable</div>";
        }
    }

    // Init Page
    fetchAndRenderFood();
    initMap();

    // --- Background Delivery Notifier ---
    setInterval(() => {
        const activeOrderJson = localStorage.getItem('activeOrder');
        if(activeOrderJson) {
            const activeOrder = JSON.parse(activeOrderJson);
            const elapsed = Math.floor((Date.now() - activeOrder.timestamp) / 1000);
            if(elapsed >= 40 && elapsed < 60 && !activeOrder.notified) {
                activeOrder.notified = true;
                localStorage.setItem('activeOrder', JSON.stringify(activeOrder));
                showToast(`Order Delivered: ${activeOrder.orderName}`, 'success');
            }
        }
    }, 2000);

    // --- Addresses & Favorites Logic ---
    const addressesModal = document.getElementById('addresses-modal');
    document.getElementById('menu-address').addEventListener('click', () => {
        toggleProfileSidebar();
        addressesModal.classList.add('active');
        renderAddresses();
    });
    document.getElementById('close-addresses-btn').addEventListener('click', () => {
        addressesModal.classList.remove('active');
    });
    
    document.getElementById('show-add-address-btn').addEventListener('click', () => {
        document.getElementById('add-address-form').style.display = 'block';
    });
    
    document.getElementById('save-address-btn').addEventListener('click', () => {
        const val = document.getElementById('new-address-input').value.trim();
        if(!val) return showToast('Address cannot be empty', 'error');
        let addrs = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        if(addrs.length === 0 && currentUser.address) addrs.push(currentUser.address);
        addrs.push(val);
        localStorage.setItem('savedAddresses', JSON.stringify(addrs));
        document.getElementById('new-address-input').value = '';
        document.getElementById('add-address-form').style.display = 'none';
        showToast('Address saved successfully', 'success');
        renderAddresses();
    });
    
    function renderAddresses() {
        let addrs = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        if(addrs.length === 0 && currentUser.address) {
            addrs.push(currentUser.address);
            localStorage.setItem('savedAddresses', JSON.stringify(addrs));
        }
        const list = document.getElementById('my-addresses-list');
        list.innerHTML = '';
        if(addrs.length === 0) {
            list.innerHTML = '<p class="text-muted text-center mt-3">No saved addresses.</p>';
            return;
        }
        addrs.forEach((a, i) => {
            list.innerHTML += `
                <div class="address-card">
                    <div class="address-text">${a}</div>
                    <button class="icon-btn text-primary" onclick="deleteAddress(${i})" style="width:30px;height:30px;font-size:12px;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        });
    }
    
    window.deleteAddress = function(index) {
        let addrs = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        addrs.splice(index, 1);
        localStorage.setItem('savedAddresses', JSON.stringify(addrs));
        renderAddresses();
    };

    const favoritesModal = document.getElementById('favorites-modal');
    document.getElementById('menu-favs').addEventListener('click', () => {
        toggleProfileSidebar();
        favoritesModal.classList.add('active');
        renderFavorites();
    });
    document.getElementById('close-favorites-btn').addEventListener('click', () => {
        favoritesModal.classList.remove('active');
    });

    function renderFavorites() {
        let favs = JSON.parse(localStorage.getItem('savedFavorites') || '[]');
        const list = document.getElementById('my-favorites-list');
        list.innerHTML = '';
        if(favs.length === 0) {
            list.innerHTML = '<p class="text-muted text-center mt-3">You have no favorites yet.</p>';
            return;
        }
        favs.forEach((f) => {
            list.innerHTML += `
                <div class="fav-item">
                    <div class="fav-img" style="background-image: url('${f.img}')"></div>
                    <div class="fav-info">
                        <h4>${f.name}</h4>
                        <p>₹${f.price}</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="addToCartFromFav('${f.id}','${f.name}',${f.price})" style="padding: 5px 10px; font-size:12px;"><i class="fa-solid fa-plus"></i> Add</button>
                    <button class="icon-btn text-primary" onclick="removeFav('${f.id}')" style="width:30px;height:30px;font-size:12px;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        });
    }
    
    window.removeFav = function(id) {
        let favs = JSON.parse(localStorage.getItem('savedFavorites') || '[]');
        favs = favs.filter(f => f.id !== id);
        localStorage.setItem('savedFavorites', JSON.stringify(favs));
        renderFavorites();
        fetchAndRenderFood(searchInput.value.trim()); // update hearts in feed
    };
    
    window.addToCartFromFav = function(id, name, price) {
        const existingItem = cart.find(i => i.id === id);
        if (existingItem) existingItem.quantity += 1;
        else cart.push({ id, name, price: parseInt(price), quantity: 1 });
        updateCartUI();
        showToast(name + ' added to cart', 'success');
    };
    // --- Settings Modal Logic ---
    const settingsModal = document.getElementById('settings-modal');
    document.getElementById('menu-settings').addEventListener('click', () => {
        toggleProfileSidebar();
        settingsModal.classList.add('active');
        
        // Populate profile inputs
        document.getElementById('setting-name-input').value = currentUser.name;
        document.getElementById('setting-email-input').value = currentUser.email;
        document.getElementById('setting-phone-input').value = currentUser.phone || '';
    });
    
    document.getElementById('close-settings-btn').addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    // Tab Navigation
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.setting-pane').forEach(p => p.style.display = 'none');
            
            const targetId = e.currentTarget.dataset.tab;
            e.currentTarget.classList.add('active');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // Save Profile
    document.getElementById('save-profile-btn').addEventListener('click', () => {
        const newName = document.getElementById('setting-name-input').value.trim();
        const newPhone = document.getElementById('setting-phone-input').value.trim();
        
        if(!newName) return showToast('Name cannot be empty', 'error');
        
        currentUser.name = newName;
        currentUser.phone = newPhone;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        const profileSpan = document.querySelector('#user-profile span');
        if(profileSpan) profileSpan.textContent = newName.split(' ')[0];
        document.getElementById('sidebar-name').textContent = newName;
        
        showToast('Profile updated successfully', 'success');
        settingsModal.classList.remove('active'); // Close window
    });

    // Toggles logic
    document.querySelectorAll('.setting-toggle input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', () => {
            showToast('Preferences updated', 'success');
        });
    });

    // Delete Account
    document.getElementById('delete-account-btn').addEventListener('click', () => {
        if(confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });

    // --- Global Function for Tracking ---
    window.reopenTracking = function(orderId, timestamp) {
        document.getElementById('orders-modal').classList.remove('active');
        document.getElementById('final-order-id').textContent = orderId;
        
        let activeOrder = JSON.parse(localStorage.getItem('activeOrder') || '{}');
        if(activeOrder.orderId !== orderId) {
            localStorage.setItem('activeOrder', JSON.stringify({
                orderId: orderId,
                timestamp: timestamp,
                orderName: "Your Order",
                notified: false
            }));
        }
        
        showCheckoutStep(3);
        document.querySelector('.checkout-modal').classList.add('fullscreen');
        checkoutOverlay.classList.add('active');
        startTrackingAnimation();
    };

    // --- Menu Modal Scrolling Fix ---
    window.openMenuModal = function() {
        document.getElementById('menu-modal').classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    window.closeMenuModal = function() {
        document.getElementById('menu-modal').classList.remove('show');
        document.body.style.overflow = ''; // Restore background scrolling
    };

    // Close menu modal when clicking outside of it
    document.getElementById('menu-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeMenuModal();
        }
    });
});
