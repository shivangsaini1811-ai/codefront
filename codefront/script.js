// script.js (updated)

// number of items required to qualify for discount
const requiredItems = 3;
const discountPercentage = 0.30;

// selectedItems will store { id -> { qty, ...product } }
const selectedItems = new Map();

const products = {
  1: { id: 1, name: 'Tie-Dye Lounge Set', price: 150, image: 'assets/p1.jpg' },
  2: { id: 2, name: 'Sunburst Tracksuit', price: 150, image: 'assets/p2.jpg' },
  3: { id: 3, name: 'Retro Red Streetwear', price: 150, image: 'assets/p3.jpg' },
  4: { id: 4, name: 'Urban Sportwear Combo', price: 150, image: 'assets/p4.jpg' },
  5: { id: 5, name: 'Oversized Knit & Coat', price: 150, image: 'assets/p5.jpg' },
  6: { id: 6, name: 'Chic Monochrome Blazer', price: 150, image: 'assets/p6.jpg' }
};

// toggle selection for a product id (called from inline onclick)
function toggleProduct(id) {
  const product = products[id];
  if (!product) return;

  const card = document.querySelector(`.card[data-id='${id}']`);
  const button = card?.querySelector('button');

  if (selectedItems.has(id)) {
    // remove selection
    selectedItems.delete(id);
    if (button) {
      button.innerHTML = `Add to Bundle <span class="plus-icon">+</span>`;
      button.classList.remove('active');
    }
  } else {
    // add selection with default qty 1
    selectedItems.set(id, { ...product, qty: 1 });
    if (button) {
      button.innerHTML = `Added to Bundle <span class="check-icon">✔</span>`;
      button.classList.add('active');
    }
  }

  updateUI();
}

// render the right-side bundle panel and update totals
function updateUI() {
  // compute subtotal (sum of price * qty)
  let subtotal = 0;
  selectedItems.forEach(item => {
    subtotal += item.price * item.qty;
  });

  // discount applies when selected count >= requiredItems
  const selectedCount = selectedItems.size;
  const discount = selectedCount >= requiredItems ? subtotal * discountPercentage : 0;
  const finalTotal = subtotal - discount;

  // update the side panel item list
  const bundleItemsContainer = document.getElementById('bundleItemsContainer');
  bundleItemsContainer.innerHTML = ''; // clear previous

  if (selectedCount === 0) {
    // show placeholders if nothing selected
    for (let i = 0; i < requiredItems; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'bundle-placeholder';
      bundleItemsContainer.appendChild(placeholder);
    }
  } else {
    // show each selected item
    selectedItems.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.className = 'bundle-item';

      wrapper.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="bundle-item-info">
          <h4>${item.name}</h4>
          <p>₹${item.price.toFixed(0)}</p>
        </div>
        <div class="bundle-qty-controls">
          <button class="qty-decr" data-id="${item.id}">-</button>
          <span class="qty-value" data-id="${item.id}">${item.qty}</span>
          <button class="qty-incr" data-id="${item.id}">+</button>
        </div>
        <button class="bundle-remove" data-id="${item.id}" title="Remove">🗑</button>
      `;

      bundleItemsContainer.appendChild(wrapper);
    });

    // fill remaining slots with placeholders (visual)
    for (let i = selectedCount; i < requiredItems; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'bundle-placeholder';
      bundleItemsContainer.appendChild(placeholder);
    }
  }

  // update summary values in DOM
  document.getElementById('subtotalPrice').textContent = `₹${subtotal.toFixed(0)}`;
  document.getElementById('discountPrice').textContent = discount > 0 ? `-₹${discount.toFixed(0)}` : `-₹0`;

  // update Add to Cart button
  const addToCartButton = document.getElementById('addToCart');
  if (selectedCount >= requiredItems) {
    addToCartButton.disabled = false;
    addToCartButton.innerHTML = `Add to Cart <span class="plus-icon">›</span>`;
  } else {
    addToCartButton.disabled = true;
    addToCartButton.innerHTML = `Add ${Math.max(0, requiredItems - selectedCount)} Items to Proceed`;
  }

  // wire up qty / remove buttons (delegation)
  // simple approach: add listeners to the new elements
  document.querySelectorAll('.qty-incr').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      changeQty(id, 1);
    });
  });

  document.querySelectorAll('.qty-decr').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      changeQty(id, -1);
    });
  });

  document.querySelectorAll('.bundle-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      removeItem(id);
    });
  });

  // update buttons on the left cards to match selection (in case qty changed externally)
  document.querySelectorAll('.card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const btn = card.querySelector('button');
    if (selectedItems.has(id)) {
      btn.innerHTML = `Added to Bundle <span class="check-icon">✔</span>`;
      btn.classList.add('active');
    } else {
      btn.innerHTML = `Add to Bundle <span class="plus-icon">+</span>`;
      btn.classList.remove('active');
    }
  });
}

// change quantity for an item, min qty is 1
function changeQty(id, delta) {
  if (!selectedItems.has(id)) return;
  const item = selectedItems.get(id);
  item.qty = Math.max(1, item.qty + delta);
  selectedItems.set(id, item);
  updateUI();
}

// remove item from selection
function removeItem(id) {
  if (!selectedItems.has(id)) return;
  selectedItems.delete(id);

  // update left-side button
  const card = document.querySelector(`.card[data-id='${id}']`);
  const btn = card?.querySelector('button');
  if (btn) {
    btn.innerHTML = `Add to Bundle <span class="plus-icon">+</span>`;
    btn.classList.remove('active');
  }

  updateUI();
}

// Add to Cart button action
document.getElementById('addToCart').addEventListener('click', () => {
  if (selectedItems.size < requiredItems) return;

  const lines = [];
  let subtotal = 0;
  selectedItems.forEach(item => {
    lines.push(`${item.name} x ${item.qty} — ₹${(item.price * item.qty).toFixed(0)}`);
    subtotal += item.price * item.qty;
  });
  const discount = subtotal * discountPercentage;
  const total = subtotal - discount;

  alert(`🛒 Bundle added to cart:\n\n${lines.join('\n')}\n\nSubtotal: ₹${subtotal.toFixed(0)}\nDiscount (30%): -₹${discount.toFixed(0)}\nTotal: ₹${total.toFixed(0)}`);
});
