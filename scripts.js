let cart = [];
let activeCategory = null;

function showPlantsSpinner() {
    const loader = document.getElementById('tree-loading');
    if (loader) loader.classList.remove('hidden');
}

function hidePlantsSpinner() {
    const loader = document.getElementById('tree-loading');
    if (loader) loader.classList.add('hidden');
}

function loadCategories() {
    fetch("https://openapi.programming-hero.com/api/categories")
        .then(response => response.json())
        .then(data => {
            displayCategories(data.categories);
            loadAllPlants();
        });
}

function displayCategories(categories) {
    const categoryContainer = document.getElementById("tree-category-list");
    if (!categoryContainer) {
        console.error('Category container not found!');
        return;
    }
    categoryContainer.innerHTML = "";

    // Add "All Trees" button first
    const allTreesDiv = document.createElement("div");
    const isAllActive = activeCategory === null;
    const allActiveClass = isAllActive ? 'bg-[#15803D] text-white' : 'bg-white hover:bg-[#15803D] hover:text-white text-gray-700 border border-gray-200';
    
    allTreesDiv.innerHTML = `
        <button 
            onclick="loadAllPlants()" 
            class="w-full flex items-center p-4 rounded-xl transition-all duration-200 ${allActiveClass}">
            <i class="fas fa-tree mr-3"></i>
            <span class="font-medium">All Trees</span>
        </button>
    `;
    categoryContainer.appendChild(allTreesDiv);

    // Add other category buttons
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const btnDiv = document.createElement("div");
        const isActive = activeCategory === category.id;
        const activeClass = isActive ? 'bg-[#15803D] text-white shadow-lg' : 'bg-white hover:bg-[#15803D] hover:text-white text-gray-700 border border-gray-200';
        
        btnDiv.innerHTML = `
            <button 
                onclick="loadPlantsByCategory(${category.id})" 
                class="w-full flex items-center p-4 rounded-xl transition-all duration-200 ${activeClass}">
                <i class="fas fa-leaf mr-3"></i>
                <span class="font-medium">${category.category_name}</span>
            </button>
        `;
        categoryContainer.appendChild(btnDiv);
    }
}

function loadAllPlants() {
    showPlantsSpinner();
    activeCategory = null;
    
    // Update category buttons to show active state
    fetch("https://openapi.programming-hero.com/api/categories")
        .then(response => response.json())
        .then(data => {
            displayCategories(data.categories);
        });
    
    fetch("https://openapi.programming-hero.com/api/plants")
        .then(response => response.json())
        .then(data => {
            const firstSixPlants = data.plants.slice(0, 6);
            displayPlants(firstSixPlants);
        })
        .finally(() => {
            hidePlantsSpinner();
        });
}

function loadPlantsByCategory(categoryId) {
    showPlantsSpinner();
    activeCategory = categoryId;
    
    // Update category buttons to show active state
    fetch("https://openapi.programming-hero.com/api/categories")
        .then(response => response.json())
        .then(data => {
            displayCategories(data.categories);
        });
    
    fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
        .then(response => response.json())
        .then(data => {
            displayPlants(data.plants || []);
        })
        .finally(() => {
            hidePlantsSpinner();
        });
}

function displayPlants(plants) {
    const plantsContainer = document.getElementById('tree-grid');
    if (!plantsContainer) {
        console.error('Plants container not found!');
        return;
    }
    
    if (plants.length === 0) {
        plantsContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center py-16">No plants found</p>';
        return;
    }
    
    let plantsHTML = '';
    for (let i = 0; i < plants.length; i++) {
        const plant = plants[i];
        const imageUrl = plant.image || 'https://via.placeholder.com/300x200?text=Plant+Image';
        const price = plant.price || '25.99';
        
        plantsHTML += `
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div class="relative">
                    <img 
                        src="${imageUrl}" 
                        alt="${plant.name}"
                        class="w-full h-48 object-cover cursor-pointer"
                        onclick="showPlantDetails(${plant.id})"
                        onerror="this.src='https://via.placeholder.com/300x200?text=Tree+Image'"
                    />
                    <div class="absolute top-3 right-3">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ${plant.category || 'Tree'}
                        </span>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-green-700 transition-colors" 
                        onclick="showPlantDetails(${plant.id})">
                        ${plant.name}
                    </h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                        ${plant.description || 'A beautiful tree perfect for environmental restoration and creating a greener future.'}
                    </p>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-2xl font-bold text-green-700">৳${price}</span>
                        <div class="flex items-center text-yellow-500">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                    <button 
                        onclick="addToCart(${plant.id}, '${plant.name.replace(/'/g, "\\'")}', '${price}')"
                        class="w-full bg-[#15803D] hover:bg-[#0f5f2f] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105">
                        <i class="fas fa-cart-plus mr-2"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }
    plantsContainer.innerHTML = plantsHTML;
}

function showPlantDetails(plantId) {
    fetch(`https://openapi.programming-hero.com/api/plant/${plantId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.plants) {
                showPlantPopup(data.plants);
            }
        });
}

function showPlantPopup(plant) {
    const imageUrl = plant.image || 'https://via.placeholder.com/400x300?text=Plant+Image';
    const price = plant.price || '25.99';
    
    const popupHTML = `
        <div id="plant-popup" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 10px; max-width: 500px; width: 90%; padding: 20px;">
                <button onclick="closePlantPopup()" style="float: right; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                
                <h2>${plant.name}</h2>
                <img src="${imageUrl}" alt="${plant.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 15px 0;">
                
                <p><strong>Price: ৳${price}</strong></p>
                <p>${plant.description || 'Beautiful plant perfect for your garden.'}</p>
                
                <button onclick="addToCart(${plant.id}, '${plant.name}', '${price}'); closePlantPopup();" 
                        style="width: 100%; padding: 10px; background: #FACC15; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; margin-top: 15px;">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function closePlantPopup() {
    const popup = document.getElementById('plant-popup');
    if (popup) {
        popup.remove();
    }
}

function addToCart(plantId, plantName, plantPrice) {
    const existingItem = cart.find(item => item.id === plantId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: plantId,
            name: plantName,
            price: parseFloat(plantPrice),
            quantity: 1
        });
    }
    updateCartDisplay();
    alert('Plant added to cart!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItemsDisplay = document.getElementById('shopping-cart-items');
    const cartTotalDisplay = document.getElementById('cart-total-amount');
    
    if (!cartItemsDisplay || !cartTotalDisplay) {
        console.error('Cart display elements not found!');
        return;
    }
    
    if (cart.length === 0) {
        cartItemsDisplay.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-shopping-cart text-3xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">Your cart is empty</p>
            </div>
        `;
        cartTotalDisplay.textContent = '0.00';
    } else {
        let cartHTML = '';
        let total = 0;
        
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHTML += `
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-medium text-sm text-gray-900">${item.name}</h4>
                        <button onclick="removeFromCart(${i})" class="text-red-500 hover:text-red-700 text-lg font-bold ml-2">×</button>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="text-xs text-gray-600">৳${item.price} × ${item.quantity}</p>
                        <p class="text-sm font-semibold text-green-700">৳${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
        }
        
        cartItemsDisplay.innerHTML = cartHTML;
        cartTotalDisplay.textContent = total.toFixed(2);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    
    document.getElementById('cart-toggle').addEventListener('click', function() {
        const dropdown = document.getElementById('cart-dropdown');
        dropdown.classList.toggle('hidden');
    });
    
    document.getElementById('plant-tree-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your donation!');
        this.reset();
    });
});
