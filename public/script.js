let cart = [];
let allBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    showSection('home');
});

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) throw new Error('Network response was not ok');
        const books = await response.json();
        allBooks = books; // Guardar todos los libros en una variable global
        displayBooks(books);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function displayBooks(books) {
    const bookContainer = document.getElementById('book-container');
    bookContainer.innerHTML = '';
    books.forEach(book => {
        const price = parseFloat(book.precio);
        const bookElement = document.createElement('div');
        bookElement.className = 'book';
        bookElement.onclick = () => showDescription(book.articulo_id, book.foto_portada, price);
        bookElement.innerHTML = `
            <img src="${book.foto_portada}" alt="${book.titulo}">
            <span class="precio-book">$${price.toFixed(2)}</span>
            <button class="boton-book" onclick="event.stopPropagation(); addToCart(${book.articulo_id}, ${price}, '${book.foto_portada}', '${book.titulo}')">Agregar al Carrito</button>
        `;
        bookContainer.appendChild(bookElement);
    });
}

function buscar() {
    const terminoBusqueda = document.getElementById('buscar').value.toLowerCase();
    const librosFiltrados = allBooks.filter(book =>
        book.titulo.toLowerCase().includes(terminoBusqueda) ||
        book.autor.toLowerCase().includes(terminoBusqueda)
    );
    displayBooks(librosFiltrados);
}

function redirectToAdvancedSearch() {
    window.location.href = 'http://localhost:3000/advsearch';
}

function redirectToLogin() {
    window.location.href = 'http://localhost:3000/login';
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    if (sectionId === 'cart') {
        showCart();
    }
}

function showDescription(bookId, pdfLink, price) {
    fetch(`/api/books/${bookId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Book not found');
            }
            return response.json();
        })
        .then(book => {
            document.getElementById('description-text').innerText = book.descripcion;
            document.getElementById('go-to-book-button').onclick = () => window.open(pdfLink, '_blank');
            document.getElementById('buy-book-button').onclick = () => window.location.href = `https://www.pse.com.co/pay?bookId=${bookId}&price=${price}`;
            document.getElementById('add-to-cart-button').onclick = () => addToCart(bookId, price, book.foto_portada, book.titulo);
            showSection('book-description');
        })
        .catch(error => console.error('Error fetching book details:', error));
}

function hideDescription() {
    showSection('home');
}

function addToCart(bookId, price, foto_portada, titulo) {
    const existingItem = cart.find(item => item.bookId === bookId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ bookId, bookTitle: titulo, price, foto_portada, quantity: 1 });
    }
    alert('Libro agregado al carrito');
    showCart();
}

function showCart() {
    const cartItemsElement = document.getElementById('cart-items');
    cartItemsElement.innerHTML = '';
    let totalPrice = 0;
    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="carrito-item">
                <img src="${item.foto_portada}" alt="${item.bookTitle}" width="80px">
                <div class="carrito-item-detalles">
                    <span class="carrito-item-titulo">${item.bookTitle}</span>
                    <div class="selector-cantidad">
                        <i class="fa-solid fa-minus" onclick="updateQuantity(${item.bookId}, -1)"></i>
                        <input type="text" value="${item.quantity}" class="carrito-item-cantidad" disabled>
                        <i class="fa-solid fa-plus" onclick="updateQuantity(${item.bookId}, 1)"></i>
                    </div>
                    <span class="carrito-item-precio">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <span class="btn-eliminar" onclick="removeFromCart(${item.bookId})">
                    <i class="fa-solid fa-trash"></i>
                </span>
            </div>
        `;
        cartItemsElement.appendChild(li);
    });
    document.getElementById('total-price').innerText = `$${totalPrice.toFixed(2)}`;
}

function removeFromCart(bookId) {
    cart = cart.filter(item => item.bookId !== bookId);
    showCart();
}

function updateQuantity(bookId, change) {
    const item = cart.find(item => item.bookId === bookId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(bookId);
        } else {
            showCart();
        }
    }
}

function checkout() {
    alert('Procediendo al pago');
    cart = [];
    showCart();
}
