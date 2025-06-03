// Store events in localStorage
let events = JSON.parse(localStorage.getItem('events')) || [];
let bookingRequests = JSON.parse(localStorage.getItem('bookingRequests')) || [];

// DOM Elements
const eventForm = document.getElementById('eventForm');
const eventsList = document.getElementById('eventsList');
const searchEvent = document.getElementById('searchEvent');
const sortEvents = document.getElementById('sortEvents');
const bookingRequestsList = document.getElementById('bookingRequestsList');

// Initialize statistics
updateStatistics();

// Add Event
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newEvent = {
        id: Date.now(),
        name: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        capacity: document.getElementById('eventCapacity').value,
        price: document.getElementById('eventPrice').value,
        description: document.getElementById('eventDescription').value,
        bookings: 0,
        revenue: 0
    };
    
    events.push(newEvent);
    saveEvents();
    displayEvents();
    updateStatistics();
    eventForm.reset();
});

// Save Events to localStorage
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Display Events
function displayEvents(filteredEvents = events) {
    eventsList.innerHTML = '';
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        const eventDate = new Date(event.date + 'T' + event.time);
        const formattedDate = eventDate.toLocaleDateString();
        const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        eventCard.innerHTML = `
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Capacity:</strong> ${event.capacity}</p>
            <p><strong>Price:</strong> $${event.price}</p>
            <p><strong>Bookings:</strong> ${event.bookings}</p>
            <p><strong>Revenue:</strong> $${event.revenue}</p>
            <div class="event-actions">
                <button class="btn-edit" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        `;
        
        eventsList.appendChild(eventCard);
    });
}

// Delete Event
function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(event => event.id !== id);
        saveEvents();
        displayEvents();
        updateStatistics();
    }
}

// Edit Event
function editEvent(id) {
    const event = events.find(event => event.id === id);
    if (!event) return;
    
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventCapacity').value = event.capacity;
    document.getElementById('eventPrice').value = event.price;
    document.getElementById('eventDescription').value = event.description;
    
    // Remove the old event
    events = events.filter(e => e.id !== id);
    saveEvents();
    displayEvents();
    
    // Scroll to form
    document.querySelector('.event-form').scrollIntoView({ behavior: 'smooth' });
}

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

// Sort Events
sortEvents.addEventListener('change', (e) => {
    const sortValue = e.target.value;
    let sortedEvents = [...events];
    
    switch(sortValue) {
        case 'date-asc':
            sortedEvents.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
            break;
        case 'date-desc':
            sortedEvents.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
            break;
        case 'name-asc':
            sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedEvents.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    
    displayEvents(sortedEvents);
});

// Display Booking Requests
function displayBookingRequests() {
    bookingRequestsList.innerHTML = '';
    
    bookingRequests.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'booking-request-card';
        
        const event = events.find(e => e.id === request.eventId);
        if (!event) return;
        
        requestCard.innerHTML = `
            <h3>${event.name}</h3>
            <p><strong>Customer:</strong> ${request.fullName}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Phone:</strong> ${request.phone}</p>
            <p><strong>Tickets:</strong> ${request.tickets}</p>
            <p><strong>Total Amount:</strong> $${request.totalAmount}</p>
            <div class="request-actions">
                <button class="btn-approve" onclick="approveBooking(${request.id})">Approve</button>
                <button class="btn-reject" onclick="rejectBooking(${request.id})">Reject</button>
            </div>
        `;
        
        bookingRequestsList.appendChild(requestCard);
    });
}

// Approve Booking
function approveBooking(requestId) {
    const request = bookingRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const event = events.find(e => e.id === request.eventId);
    if (!event) return;
    
    // Update event statistics
    event.bookings += parseInt(request.tickets);
    event.revenue += parseFloat(request.totalAmount);
    
    // Remove the booking request
    bookingRequests = bookingRequests.filter(r => r.id !== requestId);
    
    // Save changes
    saveEvents();
    localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
    
    // Update UI
    displayBookingRequests();
    displayEvents();
    updateStatistics();
}

// Reject Booking
function rejectBooking(requestId) {
    if (confirm('Are you sure you want to reject this booking request?')) {
        bookingRequests = bookingRequests.filter(r => r.id !== requestId);
        localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
        displayBookingRequests();
    }
}

// Update Statistics
function updateStatistics() {
    const totalEvents = events.length;
    const activeBookings = events.reduce((sum, event) => sum + event.bookings, 0);
    const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
    const pendingRequests = bookingRequests.length;
    
    document.getElementById('totalEvents').textContent = totalEvents;
    document.getElementById('activeBookings').textContent = activeBookings;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('pendingRequests').textContent = pendingRequests;
}

// Initial display
displayEvents();
displayBookingRequests(); 