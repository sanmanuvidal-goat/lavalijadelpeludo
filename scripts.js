document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. LÓGICA DE FILTROS DE PRODUCTOS ----
    const filterButtons = document.querySelectorAll('.btn-filter');
    const productCards = document.querySelectorAll('.product-card');

    if (filterButtons.length > 0 && productCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Cambiar estado visual del botón activo
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                // Filtrado inmediato sobre la grilla
                productCards.forEach(card => {
                    const categories = card.getAttribute('data-category').split(' ');

                    if (filterValue === 'todos' || categories.includes(filterValue)) {
                        card.classList.remove('card-hidden');
                    } else {
                        card.classList.add('card-hidden');
                    }
                });
            });
        });
    }

    // ---- 2. LOGÍSTICA / CALCULADORA DE ENVÍOS ----
    const zoneSelect = document.getElementById('zone-select');
    const shippingResult = document.getElementById('shipping-result');

    if (zoneSelect && shippingResult) {
        zoneSelect.addEventListener('change', () => {
            const zone = zoneSelect.value;
            let message = '';

            if (zone === 'centro') {
                message = '🛵 <strong>Envío Estándar:</strong> Entre $1.000 y $1.500. Coordinar por WhatsApp.';
            } else if (zone === 'intermedias') {
                message = '🚗 <strong>Envío Estándar:</strong> Entre $1.500 y $2.500 según la distancia exacta (comunicar por Whatsapp).';
            } else if (zone === 'patagonia') {
                message = '🌳 <strong>Afueras:</strong> El envío inmediato cuesta $4.000. <br>🔥 <strong>¡PROMO!</strong> En compras mayores a <strong>$15.000</strong> pagás solo la MITAD ($2.000) o te lo llevamos <strong>GRATIS</strong> SUPERANDO LOS <strong>$20.000.</strong>';
            }

            shippingResult.innerHTML = message;
            shippingResult.style.display = 'block';
        });
    }

    // ---- 3. ESCUCHADOR PARA RESALTAR LA CALCULADORA ----
    const calcLinks = document.querySelectorAll('a[href="#calculadora-zona"]');
    const calculatorCard = document.getElementById('calculadora-zona');

    if (calcLinks.length > 0 && calculatorCard) {
        calcLinks.forEach(link => {
            link.addEventListener('click', () => {
                calculatorCard.classList.add('highlight-flash');
                setTimeout(() => {
                    calculatorCard.classList.remove('highlight-flash');
                }, 800);
            });
        });
    }

    // ---- 4. LÓGICA DEL CARRITO DE COMPRAS ----
    let cart = JSON.parse(localStorage.getItem('valija_cart')) || [];

    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const addCartButtons = document.querySelectorAll('.btn-add-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartBadge = document.getElementById('cart-badge');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Abrir / Cerrar Carrito
    const toggleCart = () => {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.toggle('open');
            cartOverlay.classList.toggle('open');
        }
    };

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Agregar al Carrito
    if (addCartButtons.length > 0) {
        addCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const name = button.getAttribute('data-name');
                const price = parseInt(button.getAttribute('data-price').replace('.', '')); // Asegura leer precios con puntos (ej: 10.490 -> 10490)

                // Buscar si ya existe el ítem para aumentar cantidad
                const existingItem = cart.find(item => item.name === name);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ name, price, quantity: 1 });
                }

                saveAndRenderCart();
                
                // Efecto visual de rebote en el carrito al agregar
                if (cartBtn) {
                    cartBtn.style.transform = 'scale(1.25)';
                    setTimeout(() => { cartBtn.style.transform = 'none'; }, 200);
                }
            });
        });
    }

    // Guardar en Storage y Renderizar en pantalla
    function saveAndRenderCart() {
        localStorage.setItem('valija_cart', JSON.stringify(cart));
        renderCart();
    }

    function renderCart() {
        if (!cartItemsContainer || !cartTotalElement || !cartBadge) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
            cartTotalElement.innerText = '$0';
            cartBadge.innerText = '0';
            return;
        }

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <span class="cart-item-title">${item.name}</span>
                    <div class="cart-item-price">$${(item.price * item.quantity).toLocaleString('es-AR')}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-qty btn-minus" data-index="${index}">-</button>
                    <span class="qty-number">${item.quantity}</span>
                    <button class="btn-qty btn-plus" data-index="${index}">+</button>
                    <button class="btn-remove-item" data-index="${index}" aria-label="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.innerText = `$${total.toLocaleString('es-AR')}`;
        cartBadge.innerText = totalItems;

        // Agregar escuchadores de eventos a los botones de control de cantidad
        document.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                saveAndRenderCart();
            });
        });

        document.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                cart[index].quantity += 1;
                saveAndRenderCart();
            });
        });

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                cart.splice(index, 1);
                saveAndRenderCart();
            });
        });
    }

    // Procesar pedido y armar el mensaje de WhatsApp
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            let message = '¡Hola! Me gustaría armar un pedido desde la web:\n\n';
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                message += `• ${item.quantity}x ${item.name} ($${itemTotal.toLocaleString('es-AR')})\n`;
            });

            message += `\n*Total estimado: $${total.toLocaleString('es-AR')}*\n`;
            message += '¿Cómo coordinamos el pago y envío?';

            const whatsappNumber = '5492914120752'; // Asegúrate de cambiar esto por tu número real
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        });
    }

    // Inicializar el renderizado del carrito por primera vez
    renderCart();
});