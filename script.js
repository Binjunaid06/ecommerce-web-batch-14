  const productsContainer = document.getElementById('products-container');
  const searchBar = document.getElementById('search-bar');
  const categoryFilter = document.getElementById('category-filter');
  const loadingIndicator = document.getElementById('loading');
  const errorIndicator = document.getElementById('error');
  const noProductsMessage = document.getElementById('no-products-message');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElement = document.getElementById('cart-total');


  let allProducts = []; 
  let cart = []; 

    function loadCart() {
      const savedCart = localStorage.getItem('shoppingCart');
      cart = savedCart ? JSON.parse(savedCart) : [];
      updateCartDisplay();
  }
  function saveCart() {
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }
  function addToCart(productId) {
      const productToAdd = allProducts.find(p => p.id === productId);
      if (!productToAdd) return;
      const existingCartItemIndex = cart.findIndex(item => item.id === productId);
      if (existingCartItemIndex > -1) {
          cart[existingCartItemIndex].quantity += 1;
      } else {
          cart.push({ id: productToAdd.id, title: productToAdd.title, price: productToAdd.price, quantity: 1 });
      }
      saveCart();
      updateCartDisplay();
  }
  function removeFromCart(productId) {
      cart = cart.filter(item => item.id !== productId);
      saveCart();
      updateCartDisplay();
  }
  function updateQuantity(productId, newQuantity) {
       const itemIndex = cart.findIndex(item => item.id === productId);
       if (itemIndex > -1) {
           if (newQuantity > 0) {
               cart[itemIndex].quantity = newQuantity;
           } else {
               removeFromCart(productId);
           }
           saveCart();
           updateCartDisplay();
       }
  }
  function updateCartDisplay() {
      cartItemsContainer.innerHTML = '';
      let total = 0;
      if (cart.length === 0) {
          cartItemsContainer.innerHTML = '<p style="text-align:center; color: #666;">Your cart is empty.</p>';
      } else {
           cart.forEach(item => {
              const li = document.createElement('li');
              li.classList.add('cart-item');
              li.innerHTML = `
                  <div class="cart-item-details">
                      <span class="cart-item-title" title="${item.title}">${item.title}</span>
                      <span>($${item.price.toFixed(2)})</span>
                  </div>
                  <div class="cart-item-quantity">
                      <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="quantity-input" aria-label="Quantity for ${item.title}">
                  </div>
                  <div class="cart-item-actions">
                      <button class="remove-btn" data-id="${item.id}" aria-label="Remove ${item.title} from cart">Remove</button>
                  </div>
              `;
              cartItemsContainer.appendChild(li);
              total += item.price * item.quantity;
           });
      }
      cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
  }


  async function fetchProducts() {
      loadingIndicator.style.display = 'block';
      errorIndicator.style.display = 'none';
      productsContainer.innerHTML = ''; 
      noProductsMessage.style.display = 'none';

      try {
          const response = await fetch('https://fakestoreapi.com/products');
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          allProducts = await response.json();
          applyFilters();
      } catch (e) {
          console.error("Failed to fetch products:", e);
          errorIndicator.textContent = `Failed to load products: ${e.message}. Please try refreshing.`;
          errorIndicator.style.display = 'block';
      } finally {
          loadingIndicator.style.display = 'none';
      }
  }

  async function fetchCategories() {
      try {
          const response = await fetch('https://fakestoreapi.com/products/categories');
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const categories = await response.json();

          categoryFilter.innerHTML = '<option value="all">All Categories</option>'; 
          categories.forEach(category => {
              const option = document.createElement('option');
              option.value = category;
              option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
              categoryFilter.appendChild(option);
          });
          categoryFilter.disabled = false; 
      } catch (e) {
          console.error("Failed to fetch categories:", e);
          categoryFilter.innerHTML = '<option value="all">Error loading categories</option>';
      }
  }
// filter wala scene

  function applyFilters() {
      const searchTerm = searchBar.value.toLowerCase().trim();
      const selectedCategory = categoryFilter.value;

      let filteredProducts = allProducts;

      if (selectedCategory !== 'all') {
          filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
      }

      // Filter by search term
      if (searchTerm) {
          filteredProducts = filteredProducts.filter(product =>
              product.title.toLowerCase().includes(searchTerm)
          );
      }

      displayProducts(filteredProducts);
  }

// error resolve karna hai

  function displayProducts(productsToDisplay) {
      productsContainer.innerHTML = ''; 
      noProductsMessage.style.display = 'none'; 

      if (productsToDisplay.length === 0) {
           if (allProducts.length > 0 || searchBar.value || categoryFilter.value !== 'all') {
              noProductsMessage.style.display = 'block';
           }
           else if (loadingIndicator.style.display !== 'block' && errorIndicator.style.display !== 'block') {
               noProductsMessage.textContent = "No products available currently.";
               noProductsMessage.style.display = 'block';
           }

      } else {
          productsToDisplay.forEach(product => {
              const card = document.createElement('div');
              card.classList.add('product-card');
              card.innerHTML = `
                  <img src="${product.image}" class="images" alt="${product.title}">
                  <h3>${product.title}</h3>
                  <p class="price">$${product.price.toFixed(2)}</p>
                  <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
              `;
              productsContainer.appendChild(card);
          });
      }
  }


  
  searchBar.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);

// carts item addition
  productsContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('add-to-cart-btn')) {
          const productId = parseInt(event.target.getAttribute('data-product-id'));
          addToCart(productId);
      }
  });

// remove wala function
  cartItemsContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-btn')) {
          const productId = parseInt(event.target.getAttribute('data-id'));
          removeFromCart(productId);
      }
  });
  cartItemsContainer.addEventListener('change', (event) => {
       if (event.target.classList.contains('quantity-input')) {
          const productId = parseInt(event.target.getAttribute('data-id'));
          const newQuantity = parseInt(event.target.value);
          if (!isNaN(newQuantity)) {
              updateQuantity(productId, newQuantity);
          } else {
              updateCartDisplay(); 
          }
      }
  });

 
  function initializeApp() {
      loadCart(); 
      fetchCategories(); 
      fetchProducts(); 
  }

  initializeApp();
