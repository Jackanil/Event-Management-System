// Get booking details from URL
const urlParams = new URLSearchParams(window.location.search);
const bookingId = parseInt(urlParams.get('bookingId'));

// Get booking and event details
const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests')) || [];
const booking = bookingRequests.find(b => b.id === bookingId);
const events = JSON.parse(localStorage.getItem('events')) || [];
const event = booking ? events.find(e => e.id === booking.eventId) : null;

// DOM Elements
const paymentForm = document.getElementById('paymentForm');
const cardNumber = document.getElementById('cardNumber');
const expiryDate = document.getElementById('expiryDate');
const cvv = document.getElementById('cvv');

// Display booking summary
if (booking && event) {
    const eventDate = new Date(event.date + 'T' + event.time);
    
    document.getElementById('eventName').textContent = event.name;
    document.getElementById('eventDate').textContent = eventDate.toLocaleDateString();
    document.getElementById('eventTime').textContent = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('ticketCount').textContent = booking.tickets;
    document.getElementById('pricePerTicket').textContent = `$${event.price}`;
    document.getElementById('totalAmount').textContent = `$${booking.totalAmount}`;
} else {
    // Redirect to booking page if no valid booking found
    window.location.href = 'booking.html';
}

// Format card number
cardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    e.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
});

// Format expiry date
expiryDate.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    e.target.value = value;
});

// Format CVV
cvv.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    e.target.value = value;
});

// Handle payment form submission
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Basic validation
    const cardNameValue = document.getElementById('cardName').value.trim();
    const cardNumberValue = cardNumber.value.replace(/\s/g, '');
    const expiryDateValue = expiryDate.value;
    const cvvValue = cvv.value;
    const billingAddressValue = document.getElementById('billingAddress').value.trim();
    
    if (!validateCard(cardNumberValue)) {
        alert('Please enter a valid card number');
        return;
    }
    
    if (!validateExpiryDate(expiryDateValue)) {
        alert('Please enter a valid expiry date (MM/YY)');
        return;
    }
    
    if (!validateCVV(cvvValue)) {
        alert('Please enter a valid CVV');
        return;
    }
    
    // Process payment (in a real application, this would connect to a payment gateway)
    processPayment({
        booking,
        paymentDetails: {
            cardName: cardNameValue,
            cardNumber: cardNumberValue,
            expiryDate: expiryDateValue,
            cvv: cvvValue,
            billingAddress: billingAddressValue
        }
    });
});

// Validate card number using Luhn algorithm
function validateCard(number) {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the right
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Validate expiry date
function validateExpiryDate(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    
    const [month, year] = expiry.split('/').map(num => parseInt(num));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    return month >= 1 && month <= 12 && 
           (year > currentYear || (year === currentYear && month >= currentMonth));
}

// Validate CVV
function validateCVV(cvv) {
    return /^\d{3}$/.test(cvv);
}

// Process payment
function processPayment(paymentData) {
    // Simulate payment processing
    setTimeout(() => {
        // Update booking status
        const bookingIndex = bookingRequests.findIndex(b => b.id === booking.id);
        if (bookingIndex !== -1) {
            bookingRequests[bookingIndex].status = 'paid';
            localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
            
            // Update event statistics
            const eventIndex = events.findIndex(e => e.id === event.id);
            if (eventIndex !== -1) {
                events[eventIndex].bookings += booking.tickets;
                events[eventIndex].revenue += booking.totalAmount;
                localStorage.setItem('events', JSON.stringify(events));
            }
            
            // Show success message and redirect
            alert('Payment successful! Your booking has been confirmed.');
            window.location.href = 'index.html';
        }
    }, 1500);
} 