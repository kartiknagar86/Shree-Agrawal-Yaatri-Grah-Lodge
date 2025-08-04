// Admin Panel JavaScript - Complete and Fixed Version

// Global variables
let currentBookings = [];
let filteredBookings = [];

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginForm = document.getElementById('loginForm');
    const panel = document.getElementById('panel');

    if (isLoggedIn === 'true') {
        // Show dashboard
        loginForm.style.display = 'none';
        panel.style.display = 'block';
        // Load bookings data when dashboard is shown
        loadBookingsData();
        updatePageTitle('Dashboard');
    } else {
        // Show login form
        loginForm.style.display = 'block';
        panel.style.display = 'none';
    }

    // Initialize admin panel functionality
    initAdminPanel();
    initAdminEventListeners();
    
    // Add sample booking for testing (remove this in production)
    addSampleBooking();
});

// Add sample booking for testing
function addSampleBooking() {
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Check if sample booking already exists
    const sampleExists = existingBookings.find(booking => booking.id === 'BK1234567890');
    
    if (!sampleExists) {
        const sampleBooking = {
            id: 'BK1234567890',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            roomType: 'AC Deluxe Room - ₹1,500/night',
            checkin: '2024-01-15',
            checkout: '2024-01-17',
            guests: '2',
            message: 'Early check-in preferred',
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        existingBookings.push(sampleBooking);
        localStorage.setItem('bookings', JSON.stringify(existingBookings));
        console.log('Sample booking added for testing');
    }
}

// Login function
function login(event) {
    if (event) {
        event.preventDefault();
    }
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    const panel = document.getElementById('panel');
    const loginForm = document.getElementById('loginForm');

    // Clear any previous messages
    message.textContent = '';
    message.className = 'message';

    // Validate inputs
    if (!username || !password) {
        message.textContent = 'Please enter both username and password';
        message.className = 'message error';
        return;
    }

    if (username === 'kartik' && password === 'kartik123') {
        message.textContent = 'Login successful! Welcome to the admin panel.';
        message.className = 'message success';
        
        // Store login state
        localStorage.setItem('adminLoggedIn', 'true');
        
        // Hide login form and show admin panel with smooth transition
        setTimeout(() => {
            loginForm.style.display = 'none';
            panel.style.display = 'block';
            // Load bookings data after successful login
            loadBookingsData();
            updatePageTitle('Dashboard');
        }, 1000);
    } else {
        message.textContent = 'Invalid username or password. Please try again.';
        message.className = 'message error';
        panel.style.display = 'none';
        
        // Clear password field for security
        document.getElementById('password').value = '';
    }
}

// Logout function
function logout() {
    const panel = document.getElementById('panel');
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');
    
    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    message.textContent = '';
    message.className = 'message';
    
    // Remove login state
    localStorage.removeItem('adminLoggedIn');
    
    // Hide admin panel and show login form
    panel.style.display = 'none';
    loginForm.style.display = 'block';
}

// Handle Enter key press in login form
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        login();
    }
}

// Show message function
function showMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;

    const container = document.querySelector('.admin-container');
    if (container) {
        container.appendChild(messageDiv);
    }

    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Enhanced show section function
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Update navigation
    updateNavigation(sectionId);
    
    // Update page title based on section
    const titles = {
        'dashboard-home': 'Dashboard',
        'bookingsSection': 'Manage Bookings',
        'rooms-section': 'Room Management',
        'customers-section': 'Customer Management',
        'analytics-section': 'Analytics & Reports',
        'messages-section': 'Messages & Inquiries',
        'settings-section': 'System Settings'
    };
    
    updatePageTitle(titles[sectionId] || 'Dashboard');
    
    // Close sidebar on mobile
    const sidebar = document.querySelector('.admin-sidebar');
    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
    }
    
    // If showing bookings section, refresh the data
    if (sectionId === 'bookingsSection') {
        loadBookingsData();
    }
}

// Initialize event listeners for admin panel
function initAdminEventListeners() {
    // Add event listeners for filter controls
    const statusFilter = document.getElementById('statusFilter');
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterBookings);
    }
    
    if (dateFromFilter) {
        dateFromFilter.addEventListener('change', filterBookings);
    }
    
    if (dateToFilter) {
        dateToFilter.addEventListener('change', filterBookings);
    }

    // Add event listener for modal close button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Add event listener for clicking outside modal to close
    const modal = document.getElementById('bookingModal');
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
}

// Load bookings data from localStorage
function loadBookingsData() {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    
    if (!bookingsTableBody) return;
    
    // Clear existing table rows
    bookingsTableBody.innerHTML = '';
    
    // Get bookings from localStorage
    currentBookings = getAllBookings();
    filteredBookings = [...currentBookings];
    
    if (currentBookings.length === 0) {
        // No bookings found
        bookingsTableBody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="8">
                    <div class="no-data">
                        <i class="fas fa-calendar-times"></i>
                        <h4>No bookings found</h4>
                        <p>Bookings will appear here when customers make reservations</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        // Display bookings
        currentBookings.forEach(booking => {
            const row = createBookingRow(booking);
            bookingsTableBody.appendChild(row);
        });
    }
    
    // Update stats
    updateDashboardStats();
}

// Create booking table row
function createBookingRow(booking) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${booking.id}</td>
        <td>${booking.name}</td>
        <td>${booking.email}</td>
        <td>${booking.roomType}</td>
        <td>${booking.checkin}</td>
        <td>${booking.checkout}</td>
        <td>
            <span class="booking-status ${booking.status.toLowerCase()}">
                ${capitalizeFirstLetter(booking.status)}
            </span>
        </td>
        <td>
            <div class="booking-actions">
                <button class="action-btn view" onclick="viewBookingDetails('${booking.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editBooking('${booking.id}')" title="Edit Booking">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteBooking('${booking.id}')" title="Delete Booking">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

// Get all bookings from localStorage
function getAllBookings() {
    const bookings = localStorage.getItem('bookings');
    return bookings ? JSON.parse(bookings) : [];
}

// Filter bookings
function filterBookings() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    
    if (!bookingsTableBody) return;
    
    let filtered = [...currentBookings];
    
    // Filter by status
    if (statusFilter && statusFilter.value !== 'all') {
        filtered = filtered.filter(booking => booking.status.toLowerCase() === statusFilter.value);
    }
    
    // Filter by date range
    if (dateFromFilter && dateFromFilter.value) {
        filtered = filtered.filter(booking => booking.checkin >= dateFromFilter.value);
    }
    
    if (dateToFilter && dateToFilter.value) {
        filtered = filtered.filter(booking => booking.checkin <= dateToFilter.value);
    }
    
    filteredBookings = filtered;
    
    // Update table
    bookingsTableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        bookingsTableBody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="8">
                    <div class="no-data">
                        <i class="fas fa-filter"></i>
                        <h4>No bookings match your filters</h4>
                        <p>Try adjusting your filter criteria</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        filtered.forEach(booking => {
            const row = createBookingRow(booking);
            bookingsTableBody.appendChild(row);
        });
    }
}

// View booking details
function viewBookingDetails(bookingId) {
    const booking = getBookingById(bookingId);
    if (!booking) {
        showNotification('Booking not found', 'error');
        return;
    }
    
    const modal = document.getElementById('bookingModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="booking-details">
            <div class="booking-detail-row">
                <span class="booking-detail-label">Booking ID:</span>
                <span class="booking-detail-value">${booking.id}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Guest Name:</span>
                <span class="booking-detail-value">${booking.name}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Email:</span>
                <span class="booking-detail-value">${booking.email}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Phone:</span>
                <span class="booking-detail-value">${booking.phone}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Room Type:</span>
                <span class="booking-detail-value">${booking.roomType}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Check-in:</span>
                <span class="booking-detail-value">${booking.checkin}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Check-out:</span>
                <span class="booking-detail-value">${booking.checkout}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Number of Guests:</span>
                <span class="booking-detail-value">${booking.guests}</span>
            </div>
            <div class="booking-detail-row">
                <span class="booking-detail-label">Status:</span>
                <span class="booking-detail-value">
                    <span class="booking-status ${booking.status.toLowerCase()}">
                        ${capitalizeFirstLetter(booking.status)}
                    </span>
                </span>
            </div>
            ${booking.message ? `
            <div class="booking-detail-row">
                <span class="booking-detail-label">Special Requests:</span>
                <span class="booking-detail-value">${booking.message}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Get booking by ID
function getBookingById(bookingId) {
    return currentBookings.find(booking => booking.id === bookingId);
}

// Edit booking
function editBooking(bookingId) {
    const booking = getBookingById(bookingId);
    if (!booking) {
        showNotification('Booking not found', 'error');
        return;
    }
    
    // For now, just show a notification
    showNotification('Edit functionality coming soon!', 'info');
}

// Delete booking
function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }
    
    const bookings = getAllBookings();
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    showNotification('Booking deleted successfully!', 'success');
    loadBookingsData();
}

// Update dashboard stats
function updateDashboardStats() {
    const totalVisitors = document.getElementById('totalVisitors');
    const bookingsCount = document.getElementById('bookingsCount');
    const newMessages = document.getElementById('newMessages');
    const occupancyRate = document.getElementById('occupancyRate');
    
    if (totalVisitors) {
        totalVisitors.textContent = '1,247';
    }
    
    if (bookingsCount) {
        bookingsCount.textContent = currentBookings.length;
    }
    
    if (newMessages) {
        newMessages.textContent = '23';
    }
    
    if (occupancyRate) {
        const rate = currentBookings.length > 0 ? Math.round((currentBookings.length / 10) * 100) : 0;
        occupancyRate.textContent = `${rate}%`;
    }
}

// Show room edit form
function showRoomEditForm(roomType) {
    const modal = document.getElementById('bookingModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalHeader = modal.querySelector('.modal-header h3');
    
    // Update modal header
    modalHeader.innerHTML = `<i class="fas fa-bed"></i> Edit ${roomType} Details`;
    
    // Get current room details
    const roomDetails = getRoomDetails(roomType);
    
    modalBody.innerHTML = `
        <div class="room-edit-form">
            <div class="form-group">
                <label for="roomPrice">Price per Night (₹):</label>
                <input type="number" id="roomPrice" value="${roomDetails.price || ''}" placeholder="Enter price">
            </div>
            
            <div class="form-group">
                <label for="roomCapacity">Capacity (Guests):</label>
                <select id="roomCapacity">
                    <option value="1" ${roomDetails.capacity === '1' ? 'selected' : ''}>1 Guest</option>
                    <option value="2" ${roomDetails.capacity === '2' ? 'selected' : ''}>2 Guests</option>
                    <option value="3" ${roomDetails.capacity === '3' ? 'selected' : ''}>3 Guests</option>
                    <option value="4" ${roomDetails.capacity === '4' ? 'selected' : ''}>4 Guests</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="roomStatus">Status:</label>
                <select id="roomStatus">
                    <option value="available" ${roomDetails.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="occupied" ${roomDetails.status === 'occupied' ? 'selected' : ''}>Occupied</option>
                    <option value="maintenance" ${roomDetails.status === 'maintenance' ? 'selected' : ''}>Under Maintenance</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="roomDescription">Description:</label>
                <textarea id="roomDescription" rows="4" placeholder="Enter room description">${roomDetails.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="roomAmenities">Amenities:</label>
                <div class="amenities-grid">
                    <label class="checkbox-label">
                        <input type="checkbox" id="amenity_ac" ${roomDetails.amenities && roomDetails.amenities.includes('AC') ? 'checked' : ''}>
                        <span>Air Conditioning</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="amenity_tv" ${roomDetails.amenities && roomDetails.amenities.includes('TV') ? 'checked' : ''}>
                        <span>TV</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="amenity_wifi" ${roomDetails.amenities && roomDetails.amenities.includes('WiFi') ? 'checked' : ''}>
                        <span>WiFi</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="amenity_bathroom" ${roomDetails.amenities && roomDetails.amenities.includes('Attached Bathroom') ? 'checked' : ''}>
                        <span>Attached Bathroom</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="amenity_fridge" ${roomDetails.amenities && roomDetails.amenities.includes('Mini Fridge') ? 'checked' : ''}>
                        <span>Mini Fridge</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="amenity_fan" ${roomDetails.amenities && roomDetails.amenities.includes('Ceiling Fan') ? 'checked' : ''}>
                        <span>Ceiling Fan</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Update modal footer
    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveRoomDetails('${roomType}')">Save Changes</button>
    `;
    
    modal.style.display = 'block';
}

// Get room details from localStorage
function getRoomDetails(roomType) {
    const roomDetails = localStorage.getItem(`room_${roomType}`);
    if (roomDetails) {
        return JSON.parse(roomDetails);
    }
    
    // Return default details based on room type
    const defaultDetails = {
        'AC Deluxe Room': {
            price: '1500',
            capacity: '2',
            status: 'available',
            description: 'Comfortable AC room with modern amenities',
            amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom']
        },
        'AC Premium Room': {
            price: '2000',
            capacity: '2',
            status: 'available',
            description: 'Premium AC room with luxury features',
            amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Mini Fridge']
        },
        'Non-AC Standard Room': {
            price: '800',
            capacity: '2',
            status: 'available',
            description: 'Standard non-AC room with basic amenities',
            amenities: ['Ceiling Fan', 'TV', 'WiFi', 'Attached Bathroom']
        },
        'Non-AC Economy Room': {
            price: '500',
            capacity: '1',
            status: 'available',
            description: 'Economy room with essential facilities',
            amenities: ['Ceiling Fan', 'WiFi', 'Attached Bathroom']
        }
    };
    
    return defaultDetails[roomType] || {
        price: '',
        capacity: '2',
        status: 'available',
        description: '',
        amenities: []
    };
}

// Save room details
function saveRoomDetails(roomType) {
    const price = document.getElementById('roomPrice').value;
    const capacity = document.getElementById('roomCapacity').value;
    const status = document.getElementById('roomStatus').value;
    const description = document.getElementById('roomDescription').value;
    
    // Get selected amenities
    const amenities = [];
    const amenityCheckboxes = [
        { id: 'amenity_ac', value: 'AC' },
        { id: 'amenity_tv', value: 'TV' },
        { id: 'amenity_wifi', value: 'WiFi' },
        { id: 'amenity_bathroom', value: 'Attached Bathroom' },
        { id: 'amenity_fridge', value: 'Mini Fridge' },
        { id: 'amenity_fan', value: 'Ceiling Fan' }
    ];
    
    amenityCheckboxes.forEach(checkbox => {
        if (document.getElementById(checkbox.id) && document.getElementById(checkbox.id).checked) {
            amenities.push(checkbox.value);
        }
    });
    
    // Validate required fields
    if (!price || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Create room details object
    const roomDetails = {
        roomType: roomType,
        price: price,
        capacity: capacity,
        status: status,
        description: description,
        amenities: amenities,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(`room_${roomType}`, JSON.stringify(roomDetails));
    
    // Update room card display
    updateRoomCardDisplay(roomType, roomDetails);
    
    showNotification(`${roomType} details updated successfully!`, 'success');
    closeModal();
}

// Update room card display
function updateRoomCardDisplay(roomType, roomDetails) {
    const roomCard = document.querySelector(`[onclick="showRoomEditForm('${roomType}')"]`);
    if (roomCard) {
        const roomDetailsDiv = roomCard.querySelector('.room-details');
        if (roomDetailsDiv) {
            roomDetailsDiv.innerHTML = `
                <p><strong>Price:</strong> ₹${roomDetails.price}/night</p>
                <p><strong>Capacity:</strong> ${roomDetails.capacity} Guest${roomDetails.capacity > 1 ? 's' : ''}</p>
                <p><strong>Status:</strong> <span class="room-status ${roomDetails.status}">${capitalizeFirstLetter(roomDetails.status)}</span></p>
            `;
        }
    }
}

// Export bookings data
function exportBookingsData() {
    const bookings = getAllBookings();
    
    if (bookings.length === 0) {
        showNotification('No bookings to export', 'error');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Booking ID,Guest Name,Email,Phone,Room Type,Check-in,Check-out,Guests,Status,Special Requests\n';
    
    bookings.forEach(booking => {
        csvContent += `${booking.id},${booking.name},${booking.email},${booking.phone},${booking.roomType},${booking.checkin},${booking.checkout},${booking.guests},${booking.status},${booking.message || ''}\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    showNotification('Bookings exported successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    if (type === 'success') {
        notification.style.background = '#27ae60';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Confirm booking function
function confirmBooking() {
    showNotification('Booking confirmed successfully!', 'success');
    closeModal();
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update page title
function updatePageTitle(title) {
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = title;
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('active');
}

// Update navigation active state
function updateNavigation(sectionId) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current section
    const currentNavItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (currentNavItem) {
        currentNavItem.classList.add('active');
    }
}

// Initialize admin panel
function initAdminPanel() {
    // Add click outside to close sidebar
    document.addEventListener('click', function(event) {
        const sidebar = document.querySelector('.admin-sidebar');
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        
        if (window.innerWidth <= 1024 && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Escape to close modal
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get room details from localStorage
function getRoomDetails(roomType) {
    const roomDetails = localStorage.getItem(`room_${roomType}`);
    if (roomDetails) {
        return JSON.parse(roomDetails);
    }
    
    // Return default details based on room type
    const defaultDetails = {
        'AC Deluxe Room': {
            price: '1500',
            capacity: '2',
            status: 'available',
            description: 'Comfortable AC room with modern amenities',
            amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom']
        },
        'AC Premium Room': {
            price: '2000',
            capacity: '2',
            status: 'available',
            description: 'Premium AC room with luxury features',
            amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Mini Fridge']
        },
        'Non-AC Standard Room': {
            price: '800',
            capacity: '2',
            status: 'available',
            description: 'Standard non-AC room with basic amenities',
            amenities: ['Ceiling Fan', 'TV', 'WiFi', 'Attached Bathroom']
        },
        'Non-AC Economy Room': {
            price: '500',
            capacity: '1',
            status: 'available',
            description: 'Economy room with essential facilities',
            amenities: ['Ceiling Fan', 'WiFi', 'Attached Bathroom']
        }
    };
    
    return defaultDetails[roomType] || {
        price: '',
        capacity: '2',
        status: 'available',
        description: '',
        amenities: []
    };
}

// Save room details
function saveRoomDetails(roomType) {
    const price = document.getElementById('roomPrice').value;
    const capacity = document.getElementById('roomCapacity').value;
    const status = document.getElementById('roomStatus').value;
    const description = document.getElementById('roomDescription').value;
    
    // Get selected amenities
    const amenities = [];
    const amenityCheckboxes = [
        { id: 'amenity_ac', value: 'AC' },
        { id: 'amenity_tv', value: 'TV' },
        { id: 'amenity_wifi', value: 'WiFi' },
        { id: 'amenity_bathroom', value: 'Attached Bathroom' },
        { id: 'amenity_fridge', value: 'Mini Fridge' },
        { id: 'amenity_fan', value: 'Ceiling Fan' }
    ];
    
    amenityCheckboxes.forEach(checkbox => {
        if (document.getElementById(checkbox.id) && document.getElementById(checkbox.id).checked) {
            amenities.push(checkbox.value);
        }
    });
    
    // Validate required fields
    if (!price || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Create room details object
    const roomDetails = {
        roomType: roomType,
        price: price,
        capacity: capacity,
        status: status,
        description: description,
        amenities: amenities,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(`room_${roomType}`, JSON.stringify(roomDetails));
    
    // Update room card display
    updateRoomCardDisplay(roomType, roomDetails);
    
    showNotification(`${roomType} details updated successfully!`, 'success');
    closeModal();
}

// Update room card display
function updateRoomCardDisplay(roomType, roomDetails) {
    const roomCard = document.querySelector(`[onclick="showRoomEditForm('${roomType}')"]`);
    if (roomCard) {
        const roomDetailsDiv = roomCard.querySelector('.room-details');
        if (roomDetailsDiv) {
            roomDetailsDiv.innerHTML = `
                <p><strong>Price:</strong> ₹${roomDetails.price}/night</p>
                <p><strong>Capacity:</strong> ${roomDetails.capacity} Guest${roomDetails.capacity > 1 ? 's' : ''}</p>
                <p><strong>Status:</strong> <span class="room-status ${roomDetails.status}">${capitalizeFirstLetter(roomDetails.status)}</span></p>
            `;
        }
    }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .booking-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .booking-status.pending {
        background: #fff3cd;
        color: #856404;
    }
    
    .booking-status.confirmed {
        background: #d4edda;
        color: #155724;
    }
    
    .booking-status.cancelled {
        background: #f8d7da;
        color: #721c24;
    }
    
    .booking-actions {
        display: flex;
        gap: 5px;
    }
    
    .action-btn {
        background: none;
        border: none;
        padding: 5px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .action-btn.view {
        color: #3498db;
    }
    
    .action-btn.edit {
        color: #f39c12;
    }
    
    .action-btn.delete {
        color: #e74c3c;
    }
    
    .action-btn:hover {
        background: #f8f9fa;
        transform: scale(1.1);
    }
    
    .booking-details {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .booking-detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    
    .booking-detail-row:last-child {
        border-bottom: none;
    }
    
    .booking-detail-label {
        font-weight: 600;
        color: #333;
        min-width: 120px;
    }
    
    .booking-detail-value {
        color: #666;
        text-align: right;
    }
`;
document.head.appendChild(style);