let productsContainer = document.getElementById('products-container');
let searchBar = document.getElementById('search-bar');
let categoryFilter = document.getElementById('category-filter');
let loadingIndicator = document.getElementById('loading');
let errorIndicator = document.getElementById('error');
let noProductsMessage = document.getElementById('no-products-message');
let cartItemsContainer = document.getElementById('cart-items');
let cartTotalElement = document.getElementById('cart-total');
let allProducts = [];
let cart = [];

let notyf = new Notyf({
    duration: 1000,
    position: { x: 'right', y: 'bottom' },
    types: [
        { type: 'success', background: '#28a745', icon: false },
        { type: 'error', background: '#dc3545', icon: false }
    ]
});

function loadCart() {
    let saved = localStorage.getItem('shoppingCart');
    if (saved) {
        cart = JSON.parse(saved);
    } else {
        cart = [];
    }
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

function addToCart(productId) {
    for (let i = 0; i < allProducts.length; i++) {
        if (allProducts[i].id === productId) {
            let found = false;
            for (let j = 0; j < cart.length; j++) {
                if (cart[j].id === productId) {
                    cart[j].quantity++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                cart.push({
                    id: allProducts[i].id,
                    title: allProducts[i].title,
                    price: allProducts[i].price,
                    quantity: 1
                });
            }
            break;
        }
    }
    saveCart();
    updateCartDisplay();
}

function removeFromCart(productId) {
    let newCart = [];
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id !== productId) {
            newCart.push(cart[i]);
        }
    }
    cart = newCart;
    saveCart();
    updateCartDisplay();
}

function updateQuantity(productId, newQuantity) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            if (newQuantity > 0) {
                cart[i].quantity = newQuantity;
            } else {
                removeFromCart(productId);
            }
            break;
        }
    }
    saveCart();
    updateCartDisplay();
}

function updateCartDisplay() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color: #666;">Your cart is empty.</p>';
    } else {
        for (let i = 0; i < cart.length; i++) {
            let item = cart[i];
            let li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = '<div class="cart-item-details">' +
                '<span class="cart-item-title" title="' + item.title + '">' + item.title + '</span>' +
                '<span>($' + item.price.toFixed(2) + ')</span>' +
                '</div>' +
                '<div class="cart-item-quantity">' +
                '<input type="number" min="1" value="' + item.quantity + '" data-id="' + item.id + '" class="quantity-input" aria-label="Quantity for ' + item.title + '">' +
                '</div>' +
                '<div class="cart-item-actions">' +
                '<button class="remove-btn" data-id="' + item.id + '" aria-label="Remove ' + item.title + ' from cart">Remove</button>' +
                '</div>';
            cartItemsContainer.appendChild(li);
            total += item.price * item.quantity;
        }
    }

    cartTotalElement.textContent = 'Total: $' + total.toFixed(2);
}

function fetchProducts() {
    loadingIndicator.style.display = 'block';
    errorIndicator.style.display = 'none';
    productsContainer.innerHTML = '';
    noProductsMessage.style.display = 'none';

    fetch('https://fakestoreapi.com/products')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP error: ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            allProducts = data;
            applyFilters();
        })
        .catch(function (error) {
            console.log("Error fetching products:", error);
            errorIndicator.textContent = "Failed to load products. Try again.";
            errorIndicator.style.display = 'block';
        })
        .finally(function () {
            loadingIndicator.style.display = 'none';
        });
}

function fetchCategories() {
    fetch('https://fakestoreapi.com/products/categories')
        .then(function (response) {
            return response.json();
        })
        .then(function (categories) {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            for (let i = 0; i < categories.length; i++) {
                let option = document.createElement('option');
                option.value = categories[i];
                option.textContent = categories[i].charAt(0).toUpperCase() + categories[i].slice(1);
                categoryFilter.appendChild(option);
            }
            categoryFilter.disabled = false;
        })
        .catch(function (e) {
            console.log("Error loading categories:", e);
            categoryFilter.innerHTML = '<option value="all">Error loading categories</option>';
        });
}

function applyFilters() {
    let searchTerm = searchBar.value.toLowerCase().trim();
    let selectedCategory = categoryFilter.value;
    let filtered = [];

    for (let i = 0; i < allProducts.length; i++) {
        let p = allProducts[i];
        if ((selectedCategory === 'all' || p.category === selectedCategory) &&
            p.title.toLowerCase().includes(searchTerm)) {
            filtered.push(p);
        }
    }

    displayProducts(filtered);
}

function displayProducts(products) {
    productsContainer.innerHTML = '';
    noProductsMessage.style.display = 'none';

    if (products.length === 0) {
        noProductsMessage.style.display = 'block';
    } else {
        for (let i = 0; i < products.length; i++) {
            let card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = '<img src="' + products[i].image + '" class="images" alt="' + products[i].title + '">' +
                '<h3>' + products[i].title + '</h3>' +
                '<p class="price">$' + products[i].price.toFixed(2) + '</p>' +
                '<button class="add-to-cart-btn" data-product-id="' + products[i].id + '">Add to Cart</button>';
            productsContainer.appendChild(card);
        }
    }
}

function init() {
    loadCart();
    fetchCategories();
    fetchProducts();
}

document.addEventListener('DOMContentLoaded', function () {
    init();

    searchBar.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);

    productsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('add-to-cart-btn')) {
            let id = parseInt(event.target.getAttribute('data-product-id'));
            addToCart(id);
        }
    });

    cartItemsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-btn')) {
            let id = parseInt(event.target.getAttribute('data-id'));
            removeFromCart(id);
        }
    });

    cartItemsContainer.addEventListener('change', function (event) {
        if (event.target.classList.contains('quantity-input')) {
            let id = parseInt(event.target.getAttribute('data-id'));
            let qty = parseInt(event.target.value);
            if (!isNaN(qty)) {
                updateQuantity(id, qty);
            } else {
                updateCartDisplay();
            }
        }
    });

    let checkoutBtn = document.getElementById('checkout-btn');
    let modal = document.getElementById('checkout-modal');
    let summaryList = document.getElementById('checkout-summary');
    let checkoutTotal = document.getElementById('checkout-total');
    let confirmBtn = document.getElementById('confirm-checkout');
    let cancelBtn = document.getElementById('cancel-checkout');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            if (cart.length === 0) {
                notyf.error('Your cart is empty!');
                return;
            }

            summaryList.innerHTML = '';
            let total = 0;
            for (let i = 0; i < cart.length; i++) {
                let item = cart[i];
                let li = document.createElement('li');
                li.textContent = item.title + ' (x' + item.quantity + ') - $' + (item.price * item.quantity).toFixed(2);
                summaryList.appendChild(li);
                total += item.price * item.quantity;
            }
            checkoutTotal.textContent = 'Total: $' + total.toFixed(2);
            modal.style.display = 'flex';
        });
    }

    confirmBtn.addEventListener('click', function () {
        cart = [];
        saveCart();
        updateCartDisplay();
        modal.style.display = 'none';
        notyf.success('Checkout successful! Thank you!');
    });

    cancelBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });
});