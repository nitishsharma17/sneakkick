////ON CLICK EVENT FOR NEW LAUNCHES BUTTON

document.getElementById("newLaunchesButton").addEventListener("click", function(event) {
    event.preventDefault(); 
    window.location.href = "newlaunches.html"; 
});



//slider
const slider = document.querySelectorAll(".slide");
let counter = 0;
slider.forEach((slide, index) => {
  slide.style.left = `${index * 100}%`;
});
const gonext = () => {
  if (counter < slider.length - 1) {
    counter++;
    slideImage();
  }
} 
const goprevious = () => {
  if (counter > 0) {
    counter--;
    slideImage();
  }
}
const slideImage = () => {
  slider.forEach((slide) => {
    slide.style.transform = `translateX(-${counter * 100}%)`;
  });
}


//cart

let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

const addDataToHTML = () => {
    listProductHTML.innerHTML = ''; // Clear existing products
    if (products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
                <img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart">Add To Cart</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
};

listProductHTML.addEventListener('click', (event) => {
    if (event.target.classList.contains('addCart')) {
        let id_product = event.target.parentElement.dataset.id;
        addToCart(id_product);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionThisProductInCart < 0) {
        cart.push({ product_id: product_id, quantity: 1 });
    } else {
        cart[positionThisProductInCart].quantity++;
    }
    addCartToHTML();
    addCartToMemory();
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            newItem.innerHTML = `
                <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">${info.name}</div>
                <div class="totalPrice">$${info.price * item.quantity}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>`;
            listCartHTML.appendChild(newItem);
        });
    }
    iconCartSpan.innerText = totalQuantity;
};

listCartHTML.addEventListener('click', (event) => {
    if (event.target.classList.contains('minus') || event.target.classList.contains('plus')) {
        let product_id = event.target.parentElement.parentElement.dataset.id;
        let type = event.target.classList.contains('plus') ? 'plus' : 'minus';
        changeQuantityCart(product_id, type);
    }
});

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((    value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        if (type === 'plus') {
            cart[positionItemInCart].quantity++;
        } else {
            if (cart[positionItemInCart].quantity > 1) {
                cart[positionItemInCart].quantity--;
            } else {
                cart.splice(positionItemInCart, 1); // Remove item if quantity is 0
            }
        }
    }
    addCartToHTML();
    addCartToMemory();
};

const initApp = () => {
    // Fetch product data
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            // Load cart from local storage
            if (localStorage.getItem('cart')) {
                cart = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }
        })
        .catch(error => console.error('Error fetching product data:', error));
};

initApp();


