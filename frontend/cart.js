// cart.js - updated to handle price, image, and show a toast message
function addToCart(itemName, itemPrice, itemImage) {
  // Get the current cart from localStorage, or initialize an empty array
  let cart = JSON.parse(localStorage.getItem('ushasreeCart')) || [];

  // Check if the item is already in the cart
  const existingItem = cart.find(item => item.name === itemName);

  if (existingItem) {
    // If the item exists, increase the quantity
    existingItem.quantity += 1;
  } else {
    // If the item is not in the cart, add a new entry with name, price, quantity, and image
    cart.push({
      name: itemName,
      price: itemPrice,
      quantity: 1,
      image: itemImage
    });
  }

  // Save the updated cart to localStorage
  localStorage.setItem('ushasreeCart', JSON.stringify(cart));

  // Show a toast notification
  showToast(`${itemName} added to cart!`);
}

// Function to show a toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '1000';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(toast);

  // Show the toast
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100);

  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}
