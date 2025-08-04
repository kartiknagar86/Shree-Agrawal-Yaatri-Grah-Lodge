// Admin Panel JavaScript

// Login functionality
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
    } else {
        // Show login form
        loginForm.style.display = 'block';
        panel.style.display = 'none';
    }

    // Initialize event listeners for admin panel functionality
    initAdminEventListeners();
});

// Login function
function login() {
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
    container.appendChild(messageDiv);

    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Show section function
function showSection(sectionId) {
    // Hide all sections first
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
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
    
    // Add event listener for room image URL input to show preview
    const roomImageUrlInput = document.getElementById('roomImageUrl');
    if (roomImageUrlInput) {
        roomImageUrlInput.addEventListener('input', function() {
            updateImagePreview(this.value);
        });
    }
    
    // Initialize room management section if available
    if (document.getElementById('roomsSection')) {
        updateRoomStats();
    }
}

// Load bookings data from localStorage
function loadBookingsData() {
    const bookingsTable = document.getElementById('bookingsTable');
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    
    if (!bookingsTableBody) return;
    
    // Clear existing table rows
    bookingsTableBody.innerHTML = '';
    
    // Get bookings from localStorage
    const bookings = getAllBookings();
    
    if (bookings.length === 0) {
        // No bookings found
        bookingsTableBody.innerHTML = `
            <tr class="no-bookings-row">
                <td colspan="7">No bookings found</td>
            </tr>
        `;
        return;
    }
    
    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Populate table with bookings
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Format date for display
        const bookingDate = new Date(booking.timestamp);
        const formattedDate = bookingDate.toLocaleDateString() + ' ' + bookingDate.toLocaleTimeString();
        
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.name}</td>
            <td>${booking.email}</td>
            <td>${booking.roomType}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="booking-status status-${booking.status.toLowerCase()}">
                    ${capitalizeFirstLetter(booking.status)}
                </span>
            </td>
            <td class="booking-actions">
                <button class="action-btn view" onclick="viewBookingDetails('${booking.id}')"><i class="fas fa-eye"></i> View</button>
                <button class="action-btn edit" onclick="editRoomDetails('${booking.id}')"><i class="fas fa-edit"></i> Edit Room</button>
                <button class="action-btn delete" onclick="deleteBooking('${booking.id}')"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        
        bookingsTableBody.appendChild(row);
    });
}

// Get all bookings from localStorage
function getAllBookings() {
    const bookings = [];
    // Iterate through localStorage to find booking entries
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('booking_')) {
            try {
                const booking = JSON.parse(localStorage.getItem(key));
                bookings.push(booking);
            } catch (e) {
                console.error('Error parsing booking data:', e);
            }
        }
    }
    return bookings;
}

// Filter bookings based on selected criteria
function filterBookings() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFromFilter = document.getElementById('dateFromFilter').value;
    const dateToFilter = document.getElementById('dateToFilter').value;
    
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    if (!bookingsTableBody) return;
    
    // Clear existing table rows
    bookingsTableBody.innerHTML = '';
    
    // Get all bookings
    let bookings = getAllBookings();
    
    // Apply status filter
    if (statusFilter !== 'all') {
        bookings = bookings.filter(booking => booking.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply date range filter
    if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter);
        bookings = bookings.filter(booking => new Date(booking.timestamp) >= fromDate);
    }
    
    if (dateToFilter) {
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59, 999); // End of the day
        bookings = bookings.filter(booking => new Date(booking.timestamp) <= toDate);
    }
    
    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (bookings.length === 0) {
        // No bookings found after filtering
        bookingsTableBody.innerHTML = `
            <tr class="no-bookings-row">
                <td colspan="7">No bookings match the selected filters</td>
            </tr>
        `;
        return;
    }
    
    // Populate table with filtered bookings
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Format date for display
        const bookingDate = new Date(booking.timestamp);
        const formattedDate = bookingDate.toLocaleDateString() + ' ' + bookingDate.toLocaleTimeString();
        
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.name}</td>
            <td>${booking.email}</td>
            <td>${booking.roomType}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="booking-status status-${booking.status.toLowerCase()}">
                    ${capitalizeFirstLetter(booking.status)}
                </span>
            </td>
            <td class="booking-actions">
                <button class="action-btn view" onclick="viewBookingDetails('${booking.id}')"><i class="fas fa-eye"></i> View</button>
                <button class="action-btn edit" onclick="editRoomDetails('${booking.id}')"><i class="fas fa-edit"></i> Edit Room</button>
                <button class="action-btn delete" onclick="deleteBooking('${booking.id}')"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        
        bookingsTableBody.appendChild(row);
    });
}

// View booking details in modal
function viewBookingDetails(bookingId) {
    const booking = getBookingById(bookingId);
    if (!booking) return;
    
    const modal = document.getElementById('bookingModal');
    const modalBody = document.querySelector('.modal-body');
    const modalTitle = document.querySelector('.modal-header h3');
    
    modalTitle.textContent = `Booking Details - ${booking.id}`;
    
    // Format dates for display
    const bookingDate = new Date(booking.timestamp);
    const formattedBookingDate = bookingDate.toLocaleDateString() + ' ' + bookingDate.toLocaleTimeString();
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    
    modalBody.innerHTML = `
        <div class="booking-detail-row">
            <div class="booking-detail-label">Booking ID:</div>
            <div class="booking-detail-value">${booking.id}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Status:</div>
            <div class="booking-detail-value">
                <span class="booking-status status-${booking.status.toLowerCase()}">
                    ${capitalizeFirstLetter(booking.status)}
                </span>
            </div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Booking Date:</div>
            <div class="booking-detail-value">${formattedBookingDate}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Guest Name:</div>
            <div class="booking-detail-value">${booking.name}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Email:</div>
            <div class="booking-detail-value">${booking.email}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Phone:</div>
            <div class="booking-detail-value">${booking.phone}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Room Type:</div>
            <div class="booking-detail-value">${booking.roomType}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Check-in Date:</div>
            <div class="booking-detail-value">${checkInDate.toLocaleDateString()}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Check-out Date:</div>
            <div class="booking-detail-value">${checkOutDate.toLocaleDateString()}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Guests:</div>
            <div class="booking-detail-value">${booking.guests}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Special Requests:</div>
            <div class="booking-detail-value">${booking.specialRequests || 'None'}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Update Status:</div>
            <div class="booking-detail-value">
                <select id="statusUpdate" class="status-select">
                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
                <button class="admin-btn success" onclick="updateBookingStatus('${booking.id}')">Update</button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
}

// Edit room details for a booking
function editRoomDetails(bookingId) {
    const booking = getBookingById(bookingId);
    if (!booking) return;
    
    // Get existing room details if available
    const roomDetails = getRoomDetails(booking.roomType) || {
        imageUrl: '',
        description: '',
        price: ''
    };
    
    const modal = document.getElementById('bookingModal');
    const modalBody = document.querySelector('.modal-body');
    const modalTitle = document.querySelector('.modal-header h3');
    
    modalTitle.textContent = `Edit Room Details - ${booking.roomType}`;
    
    modalBody.innerHTML = `
        <div class="booking-detail-row">
            <div class="booking-detail-label">Room Type:</div>
            <div class="booking-detail-value">${booking.roomType}</div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Room Image URL:</div>
            <div class="booking-detail-value">
                <input type="text" id="roomImageUrl" class="form-control" value="${roomDetails.imageUrl || ''}" placeholder="Enter image URL" />
                <div class="image-preview-container" id="imagePreviewContainer">
                    ${roomDetails.imageUrl ? `<img src="${roomDetails.imageUrl}" alt="Room preview" class="image-preview" />` : ''}
                </div>
            </div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Room Description:</div>
            <div class="booking-detail-value">
                <textarea id="roomDescription" class="form-control" rows="4" placeholder="Enter room description">${roomDetails.description || ''}</textarea>
            </div>
        </div>
        <div class="booking-detail-row">
            <div class="booking-detail-label">Room Price:</div>
            <div class="booking-detail-value">
                <input type="number" id="roomPrice" class="form-control" value="${roomDetails.price || ''}" placeholder="Enter room price" />
            </div>
        </div>
    `;
    
    // Add save button to modal footer
    const modalFooter = document.querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button class="admin-btn" onclick="closeModal()">Cancel</button>
        <button class="admin-btn success" onclick="saveRoomDetails('${booking.roomType}')">Save Changes</button>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listener for image URL input to show preview
    const roomImageUrlInput = document.getElementById('roomImageUrl');
    if (roomImageUrlInput) {
        roomImageUrlInput.addEventListener('input', function() {
            updateImagePreview(this.value);
        });
    }
}

// Update image preview when URL changes
function updateImagePreview(imageUrl) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (!previewContainer) return;
    
    if (imageUrl) {
        previewContainer.innerHTML = `<img src="${imageUrl}" alt="Room preview" class="image-preview" onerror="this.src='images/placeholder.jpg'; this.onerror=null;" />`;
    } else {
        previewContainer.innerHTML = '';
    }
}

// Get room details from localStorage
function getRoomDetails(roomType) {
    const roomDetailsData = localStorage.getItem(`room_${roomType}`);
    if (!roomDetailsData) return null;
    
    try {
        return JSON.parse(roomDetailsData);
    } catch (e) {
        console.error('Error parsing room details:', e);
        return null;
    }
}

// Show room edit form
function showRoomEditForm(roomType) {
    const roomDetails = getRoomDetails(roomType) || {
        imageUrl: '',
        description: '',
        price: ''
    };
    
    // Set form title
    document.getElementById('edit-room-title').textContent = `Edit ${roomType} Details`;
    
    // Populate form fields
    document.getElementById('roomImageUrl').value = roomDetails.imageUrl || '';
    document.getElementById('roomDescription').value = roomDetails.description || '';
    document.getElementById('roomPrice').value = roomDetails.price || '';
    
    // Update image preview
    updateImagePreview(roomDetails.imageUrl);
    
    // Show the form
    document.getElementById('room-edit-form').style.display = 'block';
    
    // Set up save button event handler
    const saveButton = document.getElementById('saveRoomBtn');
    saveButton.onclick = function() {
        saveRoomDetails(roomType);
    };
}

// Cancel room edit
function cancelRoomEdit() {
    document.getElementById('room-edit-form').style.display = 'none';
}

// Save room details
function saveRoomDetails(roomType) {
    const imageUrl = document.getElementById('roomImageUrl').value;
    const description = document.getElementById('roomDescription').value;
    const price = document.getElementById('roomPrice').value;
    
    if (!imageUrl || !description || !price) {
        showMessage('error', 'Please fill in all fields');
        return;
    }
    
    // Create room details object
    const roomDetails = {
        roomType: roomType,
        imageUrl: imageUrl,
        description: description,
        price: price,
        lastUpdated: new Date().toISOString()
    };
    
    // Save room details to localStorage
    localStorage.setItem(`room_${roomType}`, JSON.stringify(roomDetails));
    
    showMessage('success', `Room details for ${roomType} updated successfully!`);
    closeModal();
    
    // Refresh the bookings table
    loadBookingsData();
}

// Update booking status
function updateBookingStatus(bookingId) {
    const statusSelect = document.getElementById('statusUpdate');
    const newStatus = statusSelect.value;
    
    const booking = getBookingById(bookingId);
    if (!booking) return;
    
    // Update booking status
    booking.status = newStatus;
    
    // Save updated booking to localStorage
    localStorage.setItem(`booking_${bookingId}`, JSON.stringify(booking));
    
    showMessage('success', `Booking status updated to ${capitalizeFirstLetter(newStatus)}`);
    closeModal();
    
    // Refresh the bookings table
    loadBookingsData();
}

// Delete booking
function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking?')) {
        // Remove booking from localStorage
        localStorage.removeItem(`booking_${bookingId}`);
        
        showMessage('success', 'Booking deleted successfully');
        
        // Refresh the bookings table
        loadBookingsData();
    }
}

// Get booking by ID
function getBookingById(bookingId) {
    const bookingData = localStorage.getItem(`booking_${bookingId}`);
    if (!bookingData) return null;
    
    try {
        return JSON.parse(bookingData);
    } catch (e) {
        console.error('Error parsing booking data:', e);
        return null;
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}