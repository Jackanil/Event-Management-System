// Store events in localStorage
let events = JSON.parse(localStorage.getItem('events')) || [];

// DOM Elements
const eventForm = document.getElementById('eventForm');
const eventsList = document.getElementById('eventsList');
const searchEvent = document.getElementById('searchEvent');
const sortEvents = document.getElementById('sortEvents');

// Add Event
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const eventDescription = document.getElementById('eventDescription').value;
    
    const newEvent = {
        id: Date.now(),
        name: eventName,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        description: eventDescription
    };
    
    events.push(newEvent);
    saveEvents();
    displayEvents();
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
            <p><strong>Description:</strong> ${event.description}</p>
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

// Initial display
displayEvents(); 