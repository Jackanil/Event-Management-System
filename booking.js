// Get events from localStorage
let events = JSON.parse(localStorage.getItem('events')) || [];

// DOM Elements
const eventsList = document.getElementById('eventsList');
const searchEvent = document.getElementById('searchEvent');
const filterCategory = document.getElementById('filterCategory');
const bookingForm = document.getElementById('bookingForm');
const bookingFormSection = document.getElementById('bookingFormSection');

// Display Events
function displayEvents(filteredEvents = events) {
    eventsList.innerHTML = '';
    
    filteredEvents.forEach(event => {
        if (event.bookings >= event.capacity) return; // Skip fully booked events
        
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        const eventDate = new Date(event.date + 'T' + event.time);
        const formattedDate = eventDate.toLocaleDateString();
        const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const availableTickets = event.capacity - event.bookings;
        
        eventCard.innerHTML = `
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Price:</strong> $${event.price}</p>
            <p><strong>Available Tickets:</strong> ${availableTickets}</p>
            <p>${event.description}</p>
            <button class="btn btn-primary" onclick="showBookingForm(${event.id})">Book Now</button>
        `;
        
        eventsList.appendChild(eventCard);
    });
}

// Show Booking Form
function showBookingForm(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('selectedEventName').textContent = event.name;
    document.getElementById('eventId').value = event.id;
    document.getElementById('ticketPrice').textContent = `$${event.price}`;
    
    // Show the booking form section
    bookingFormSection.style.display = 'block';
    bookingFormSection.scrollIntoView({ behavior: 'smooth' });
    
    // Update total amount when number of tickets changes
    document.getElementById('tickets').addEventListener('input', () => {
        const tickets = document.getElementById('tickets').value;
        const totalAmount = tickets * event.price;
        document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    });
}

// Handle Booking Form Submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const eventId = parseInt(document.getElementById('eventId').value);
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const tickets = parseInt(document.getElementById('tickets').value);
    const availableTickets = event.capacity - event.bookings;
    
    if (tickets > availableTickets) {
        alert(`Sorry, only ${availableTickets} tickets available.`);
        return;
    }
    
    const bookingRequest = {
        id: Date.now(),
        eventId: eventId,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        tickets: tickets,
        totalAmount: tickets * event.price,
        status: 'pending'
    };
    
    // Save booking request
    let bookingRequests = JSON.parse(localStorage.getItem('bookingRequests')) || [];
    bookingRequests.push(bookingRequest);
    localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
    
    // Redirect to payment page with booking details
    const queryParams = new URLSearchParams({
        bookingId: bookingRequest.id
    }).toString();
    
    window.location.href = `payment.html?${queryParams}`;
});

// Search Events
searchEvent.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm)
    );
    displayEvents(filteredEvents);
});

// Filter Events by Category
filterCategory.addEventListener('change', (e) => {
    const category = e.target.value;
    if (category === 'all') {
        displayEvents();
    } else {
        const filteredEvents = events.filter(event => event.category === category);
        displayEvents(filteredEvents);
    }
});

// Initial display
displayEvents(); 