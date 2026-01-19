
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('checkoutCartItems');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shippingCost');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('totalAmount');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted">Your cart is empty</p>
                <a href="shop.html" class="btn gucci-btn-outline">Continue Shopping</a>
            </div>
        `;
        updateTotals(0);
        return;
    }

    let cartHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.prix * item.quantity;
        subtotal += itemTotal;

        cartHTML += `
            <div class="cart-summary-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex gap-3">
                        <img src="${item.images[0]}" 
                             alt="${item.title}" 
                             class="product-image-checkout">
                        <div>
                            <h6 class="mb-1 small text-uppercase">${item.title}</h6>
                            <p class="small text-muted mb-1">${item.category}</p>
                            <p class="small mb-0">Size: ${item.size || 'One Size'}</p>
                            <p class="small mb-0">Qty: ${item.quantity}</p>
                        </div>
                    </div>
                    <div class="text-end">
                        <p class="fw-bold mb-0">€${itemTotal.toFixed(2)}</p>
                        <p class="small text-muted mb-0">€${item.prix} each</p>
                    </div>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    updateTotals(subtotal);
}


function updateTotals(subtotal, shipping = 0) {
    const tax = subtotal * 0.08; 
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('shippingCost').textContent = `€${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `€${tax.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `€${total.toFixed(2)}`;
}


document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function () {
     
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('selected');
        });
        
        this.classList.add('selected');
      

        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    });
});


document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);

        let shippingCost = 0;
        if (this.id === 'express') {
            shippingCost = 25;
        } else if (this.id === 'overnight') {
            shippingCost = 50;
        }

        updateTotals(subtotal, shippingCost)
    });
});



document.getElementById('completeOrder').addEventListener('click', function () {

    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields ');
        return;
    }


    const paymentMethod = document.querySelector('input[name="payment"]:checked').id;
    const shippingMethod = document.querySelector('input[name="shipping"]:checked').id;


    const order = {
        orderId: 'GUCCI-' + Math.floor(100000 + Math.random() * 900000),
        customer: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value,
            state: document.getElementById('state').value || 'N/A'
        },
        cart: JSON.parse(localStorage.getItem('cart')) || [],
        paymentMethod: paymentMethod,
        shippingMethod: shippingMethod,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('€', '')),
        shipping: parseFloat(document.getElementById('shippingCost').textContent.replace('€', '')),
        tax: parseFloat(document.getElementById('tax').textContent.replace('€', '')),
        total: parseFloat(document.getElementById('totalAmount').textContent.replace('€', ''))
    };


    const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orders.push(order);
    localStorage.setItem('orderHistory', JSON.stringify(orders));


    generatePDFInvoice(order);


    localStorage.removeItem('cart');

    showSuccessMessage(order.orderId);

    setTimeout(() => {
        window.location.href = 'homepage.html';
    }, 5000);
});

function generatePDFInvoice(order) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('GUCCI', 105, 20, { align: 'center' });

    
    doc.setFontSize(16);
    doc.setTextColor(150, 150, 150);
    doc.text('ORDER INVOICE', 105, 30, { align: 'center' });

 
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Order Number: ${order.orderId}`, 20, 45);
    doc.text(`Date: ${order.date}`, 20, 52);

  
    doc.setFontSize(12);
    doc.setTextColor(193, 154, 107); 
    doc.text('BILLING INFORMATION', 20, 65);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, 20, 72);
    doc.text(`${order.customer.address}`, 20, 78);
    doc.text(`${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}`, 20, 84);
    doc.text(`${order.customer.country}`, 20, 90);
    doc.text(`Email: ${order.customer.email}`, 20, 96);
    doc.text(`Phone: ${order.customer.phone}`, 20, 102);

  
    const tableColumn = ["Product", "Quantity", "Unit Price", "Total"];
    const tableRows = [];

    order.cart.forEach(item => {
        const itemTotal = item.prix * item.quantity;
        const itemData = [
            item.title,
            item.quantity.toString(),
            `€${item.prix.toFixed(2)}`,
            `€${itemTotal.toFixed(2)}`
        ];
        tableRows.push(itemData);
    });


    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 110,
        theme: 'striped',
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 40 }
        }
    });

    
    const finalY = doc.lastAutoTable.finalY + 10;

  
    doc.setFontSize(12);
    doc.setTextColor(193, 154, 107);
    doc.text('ORDER SUMMARY', 20, finalY);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const summaryStartY = finalY + 10;
    doc.text(`Subtotal: €${order.subtotal.toFixed(2)}`, 140, summaryStartY);
    doc.text(`Shipping: €${order.shipping.toFixed(2)}`, 140, summaryStartY + 6);
    doc.text(`Tax: €${order.tax.toFixed(2)}`, 140, summaryStartY + 12);

  
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: €${order.total.toFixed(2)}`, 140, summaryStartY + 20);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Payment Method: ${getPaymentMethodName(order.paymentMethod)}`, 20, summaryStartY + 30);
    doc.text(`Shipping Method: ${getShippingMethodName(order.shippingMethod)}`, 20, summaryStartY + 36);

    const footerY = summaryStartY + 50;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with GUCCI', 105, footerY, { align: 'center' });
    doc.text('This is your official invoice. Please keep it for your records.', 105, footerY + 6, { align: 'center' });
    doc.text('For any questions, contact: customerservice@gucci.com', 105, footerY + 12, { align: 'center' });

   
    doc.save(`GUCCI-Invoice-${order.orderId}.pdf`);
}


function getPaymentMethodName(methodId) {
    switch (methodId) {
        case 'creditCard': return 'Credit/Debit Card';
        case 'paypal': return 'PayPal';
        case 'applePay': return 'Apple Pay';
        default: return 'Credit Card';
    }
}

function getShippingMethodName(methodId) {
    switch (methodId) {
        case 'standard': return 'Standard Shipping (5-7 days)';
        case 'express': return 'Express Shipping (2-3 days)';
        case 'overnight': return 'Overnight Shipping (Next day)';
        default: return 'Standard Shipping';
    }
}


function showSuccessMessage(orderId) {
 
    const modalHTML = `
        <div class="modal fade show" id="successModal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-5">
                        <div class="mb-4">
                            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h3 class="mb-3">Order Confirmed!</h3>
                        <p class="text-muted mb-4">
                            Thank you for your purchase. Your order <strong>${orderId}</strong> has been confirmed.
                            <br>
                            A PDF invoice has been downloaded automatically.
                        </p>
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            You will be redirected to the home page in 5 seconds...
                        </div>
                        <div class="mt-4">
                            <a href="homepage.html" class="btn gucci-btn-primary">
                                Go to Home Page Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

   
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();

   
    document.querySelector('#successModal .btn').addEventListener('click', function () {
        modal.hide();
        setTimeout(() => {
            modalContainer.remove();
        }, 300);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadCart();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);


    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    let shippingCost = 0;

    if (selectedShipping) {
        if (selectedShipping.id === 'express') {
            shippingCost = 25;
        } else if (selectedShipping.id === 'overnight') {
            shippingCost = 50;
        }
    }
    updateTotals(subtotal, shippingCost);
});
