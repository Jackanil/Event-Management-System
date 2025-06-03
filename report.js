// Get data from localStorage
const events = JSON.parse(localStorage.getItem('events')) || [];
const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests')) || [];

// DOM Elements
const dateRange = document.getElementById('dateRange');
const customDateRange = document.querySelector('.custom-date-range');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const exportReport = document.getElementById('exportReport');

// Charts
let revenueChart, eventsChart, bookingsChart;

// Initialize date range picker
dateRange.addEventListener('change', () => {
    if (dateRange.value === 'custom') {
        customDateRange.style.display = 'block';
    } else {
        customDateRange.style.display = 'none';
        updateReports(getDateRange(dateRange.value));
    }
});

// Custom date range
[startDate, endDate].forEach(input => {
    input.addEventListener('change', () => {
        if (startDate.value && endDate.value) {
            updateReports({
                start: new Date(startDate.value),
                end: new Date(endDate.value)
            });
        }
    });
});

// Get date range based on selection
function getDateRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - parseInt(days));
    return { start, end };
}

// Update all reports
function updateReports(dateRange) {
    const filteredEvents = filterEventsByDate(events, dateRange);
    const filteredBookings = filterBookingsByDate(bookingRequests, dateRange);
    
    updateRevenueChart(filteredEvents);
    updateEventsChart(filteredEvents);
    updateBookingsChart(filteredBookings);
    updateDetailedReport(filteredEvents);
    updateSummaryCards(filteredEvents, filteredBookings);
}

// Filter events by date range
function filterEventsByDate(events, dateRange) {
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= dateRange.start && eventDate <= dateRange.end;
    });
}

// Filter bookings by date range
function filterBookingsByDate(bookings, dateRange) {
    return bookings.filter(booking => {
        const bookingDate = new Date(booking.id); // Using timestamp as date
        return bookingDate >= dateRange.start && bookingDate <= dateRange.end;
    });
}

// Update revenue chart
function updateRevenueChart(filteredEvents) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Group revenue by date
    const revenueData = {};
    filteredEvents.forEach(event => {
        const date = event.date;
        revenueData[date] = (revenueData[date] || 0) + event.revenue;
    });
    
    const data = {
        labels: Object.keys(revenueData),
        datasets: [{
            label: 'Revenue',
            data: Object.values(revenueData),
            backgroundColor: 'rgba(44, 62, 80, 0.2)',
            borderColor: 'rgba(44, 62, 80, 1)',
            borderWidth: 1
        }]
    };
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `$${value}`
                    }
                }
            }
        }
    });
}

// Update events chart
function updateEventsChart(filteredEvents) {
    const ctx = document.getElementById('eventsChart').getContext('2d');
    
    // Count events by category
    const categoryData = {};
    filteredEvents.forEach(event => {
        const category = event.category || 'Uncategorized';
        categoryData[category] = (categoryData[category] || 0) + 1;
    });
    
    const data = {
        labels: Object.keys(categoryData),
        datasets: [{
            data: Object.values(categoryData),
            backgroundColor: [
                'rgba(52, 152, 219, 0.8)',
                'rgba(46, 204, 113, 0.8)',
                'rgba(155, 89, 182, 0.8)',
                'rgba(230, 126, 34, 0.8)',
                'rgba(231, 76, 60, 0.8)'
            ]
        }]
    };
    
    if (eventsChart) {
        eventsChart.destroy();
    }
    
    eventsChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update bookings chart
function updateBookingsChart(filteredBookings) {
    const ctx = document.getElementById('bookingsChart').getContext('2d');
    
    // Group bookings by status
    const statusData = {
        pending: 0,
        paid: 0,
        cancelled: 0
    };
    
    filteredBookings.forEach(booking => {
        statusData[booking.status]++;
    });
    
    const data = {
        labels: Object.keys(statusData),
        datasets: [{
            data: Object.values(statusData),
            backgroundColor: [
                'rgba(241, 196, 15, 0.8)',
                'rgba(46, 204, 113, 0.8)',
                'rgba(231, 76, 60, 0.8)'
            ]
        }]
    };
    
    if (bookingsChart) {
        bookingsChart.destroy();
    }
    
    bookingsChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update detailed report table
function updateDetailedReport(filteredEvents) {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';
    
    filteredEvents.forEach(event => {
        const row = document.createElement('tr');
        const eventDate = new Date(event.date + 'T' + event.time);
        
        row.innerHTML = `
            <td>${event.name}</td>
            <td>${eventDate.toLocaleDateString()}</td>
            <td>${event.bookings}/${event.capacity}</td>
            <td>$${event.revenue}</td>
            <td>${getEventStatus(event)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get event status
function getEventStatus(event) {
    const now = new Date();
    const eventDate = new Date(event.date + 'T' + event.time);
    
    if (eventDate < now) return 'Completed';
    if (event.bookings >= event.capacity) return 'Sold Out';
    return 'Available';
}

// Update summary cards
function updateSummaryCards(filteredEvents, filteredBookings) {
    const totalRevenue = filteredEvents.reduce((sum, event) => sum + event.revenue, 0);
    const avgRevenue = totalRevenue / (filteredEvents.length || 1);
    
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('avgRevenue').textContent = `$${avgRevenue.toFixed(2)}`;
    document.getElementById('totalEvents').textContent = filteredEvents.length;
    document.getElementById('totalBookings').textContent = filteredBookings.length;
    
    // Calculate booking rate
    const totalCapacity = filteredEvents.reduce((sum, event) => sum + parseInt(event.capacity), 0);
    const totalBookings = filteredEvents.reduce((sum, event) => sum + event.bookings, 0);
    const bookingRate = (totalBookings / (totalCapacity || 1)) * 100;
    
    document.getElementById('bookingRate').textContent = `${bookingRate.toFixed(1)}%`;
    
    // Find most popular category
    const categoryCount = {};
    filteredEvents.forEach(event => {
        const category = event.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + event.bookings;
    });
    
    const popularCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '-';
    
    document.getElementById('popularCategory').textContent = popularCategory;
}

// Export report
exportReport.addEventListener('click', () => {
    const dateRangeText = dateRange.value === 'custom' 
        ? `${startDate.value} to ${endDate.value}`
        : `Last ${dateRange.value} days`;
    
    const reportData = {
        dateRange: dateRangeText,
        summary: {
            totalRevenue: document.getElementById('totalRevenue').textContent,
            avgRevenue: document.getElementById('avgRevenue').textContent,
            totalEvents: document.getElementById('totalEvents').textContent,
            totalBookings: document.getElementById('totalBookings').textContent,
            bookingRate: document.getElementById('bookingRate').textContent,
            popularCategory: document.getElementById('popularCategory').textContent
        },
        events: events.map(event => ({
            name: event.name,
            date: event.date,
            bookings: event.bookings,
            capacity: event.capacity,
            revenue: event.revenue,
            status: getEventStatus(event)
        }))
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Initialize with last 30 days
updateReports(getDateRange(30)); 