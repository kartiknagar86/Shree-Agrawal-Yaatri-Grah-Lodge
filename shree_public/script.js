// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing booking system...');
    
    // Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        // Toggle mobile menu
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        // Handle window resize - close menu and restore scroll on desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Make room prices and Book Now buttons clickable to open booking section with pre-selected room
    document.querySelectorAll('.room-price, .btn-primary').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find the room card containing this element
            const roomCard = this.closest('.room-card');
            
            if (roomCard) {
                // Get the room title
                const roomTitle = roomCard.querySelector('h3').textContent.trim();
                
                // Determine which room type to select in the dropdown
                let roomTypeValue = '';
                if (roomTitle.includes('AC Deluxe')) {
                    roomTypeValue = 'ac-deluxe';
                } else if (roomTitle.includes('AC Premium')) {
                    roomTypeValue = 'ac-premium';
                } else if (roomTitle.includes('Non-AC Standard')) {
                    roomTypeValue = 'non-ac-standard';
                } else if (roomTitle.includes('Non-AC Economy')) {
                    roomTypeValue = 'non-ac-economy';
                }
                
                // Scroll directly to booking form instead of booking section
                const bookingForm = document.getElementById('bookingForm');
                if (bookingForm) {
                    const offsetTop = bookingForm.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Pre-select the room type in the dropdown
                    const roomTypeSelect = document.getElementById('roomtype');
                    if (roomTypeSelect && roomTypeValue) {
                        roomTypeSelect.value = roomTypeValue;
                        
                        // Add a highlight effect to the form and focus on the first input field
                        const formContainer = document.querySelector('.booking-form');
                        const firstInput = document.getElementById('name');
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }
                }
            }
        });
    });

    // Initialize booking form
    initializeBookingForm();
    
    // Initialize date inputs
    initializeDateInputs();
    
    // Initialize image loading
    initializeImageLoading();
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    console.log('All initialization complete');
});

// Initialize booking form functionality
function initializeBookingForm() {
    console.log('Initializing booking form...');
    
    // Booking form handling
    const bookingForm = document.getElementById('bookingForm');
    console.log('Booking form found:', bookingForm); // Debug log
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted - event triggered');
            
            try {
                // Validate form data
                if (!validateBookingForm()) {
                    console.log('Form validation failed');
                    return;
                }
                
                console.log('Form validation passed');
                
                // Get form data
                const formData = new FormData(this);
                const data = {};
                
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                
                // Add timestamp and booking ID
                data.timestamp = new Date().toISOString();
                data.bookingId = generateBookingId();
                
                console.log('Booking data:', data);
                
                // Save booking data to admin panel first
                saveBookingData(data);
                
                // Show success notification
                showSuccessNotification('Booking request submitted successfully! Redirecting to WhatsApp for confirmation...');
                
                // Send WhatsApp message and redirect
                sendWhatsAppBooking(data);
                
                // Show loading state on button
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    submitBtn.style.backgroundColor = '#f39c12';
                    submitBtn.disabled = true;
                    
                    // Show success message after a short delay
                    setTimeout(() => {
                        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Booking Submitted Successfully!';
                        submitBtn.style.backgroundColor = '#27ae60';
                    }, 1000);
                    
                    // Reset form after 3 seconds
                    setTimeout(() => {
                        this.reset();
                        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit Booking Request';
                        submitBtn.style.backgroundColor = '';
                        submitBtn.disabled = false;
                        
                        // Hide booking summary
                        const bookingSummary = document.getElementById('bookingSummary');
                        if (bookingSummary) {
                            bookingSummary.style.display = 'none';
                        }
                    }, 3000);
                }
            } catch (error) {
                console.error('Error in form submission:', error);
                showErrorNotification('An error occurred while submitting the booking. Please try again.');
            }
        });
        
        console.log('Form submit event listener attached successfully');
    } else {
        console.error('Booking form not found!');
    }
}

// Initialize date inputs
function initializeDateInputs() {
    // Set minimum date for check-in and check-out
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput) {
        checkinInput.setAttribute('min', today);
        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(checkinDate.getDate() + 1);
            const minCheckout = nextDay.toISOString().split('T')[0];
            if (checkoutInput) {
                checkoutInput.setAttribute('min', minCheckout);
                if (checkoutInput.value && checkoutInput.value <= this.value) {
                    checkoutInput.value = minCheckout;
                }
            }
        });
    }
}

// Initialize image loading
function initializeImageLoading() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // If image is already loaded
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        }
    });
}

// Initialize scroll effects
function initializeScrollEffects() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(128, 0, 0, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'maroon';
                navbar.style.backdropFilter = 'none';
            }
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe room cards and gallery items
    document.querySelectorAll('.room-card, .gallery-item, .feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}
                    if (formContainer) {
                        formContainer.classList.add('highlight-form');
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }
                }
            }
        });
        
        // Change cursor to pointer to indicate clickable
        element.style.cursor = 'pointer';
    });
});

// Create WhatsApp message from form data
function createWhatsAppMessage(data) {
    // Calculate number of nights
    const checkinDate = new Date(data.checkin);
    const checkoutDate = new Date(data.checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    
    const message = `
🏨 *NEW BOOKING REQUEST - Shree Agrawal Yaatri Grah & Lodge*

🆔 *Booking ID:* ${data.bookingId}

👤 *Guest Details:*
• Name: ${data.name}
• Phone: ${data.phone}
• Email: ${data.email}

📅 *Booking Details:*
• Check-in: ${formatDate(data.checkin)}
• Check-out: ${formatDate(data.checkout)}
• Duration: ${nights} night${nights > 1 ? 's' : ''}
• Room Type: ${getRoomTypeName(data.roomtype)}
• Number of Guests: ${data.guests}

${data.message ? `📝 *Special Requests:*\n${data.message}` : ''}

⏰ *Submitted:* ${new Date().toLocaleString('en-IN')}

Please confirm availability and provide booking confirmation. Thank you!
    `.trim();
    
    return message;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Get room type name from value
function getRoomTypeName(value) {
    const roomTypes = {
        'ac-deluxe': 'AC Deluxe Room - ₹1,500/night',
        'ac-premium': 'AC Premium Room - ₹2,000/night',
        'non-ac-standard': 'Non-AC Standard Room - ₹800/night',
        'non-ac-economy': 'Non-AC Economy Room - ₹500/night'
    };
    return roomTypes[value] || value;
}

// Add loading animation for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // If image is already loaded
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        }
    });
});

// Form validation
function validateBookingForm() {
    const requiredFields = ['name', 'phone', 'email', 'checkin', 'checkout', 'roomtype', 'guests'];
    let isValid = true;
    let errorMessage = '';

    // Reset all field borders
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.style.borderColor = '#ddd';
        }
    });

    // Check required fields
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
            if (!errorMessage) {
                const fieldLabel = field.previousElementSibling?.textContent || fieldName;
                errorMessage = `Please fill in ${fieldLabel.toLowerCase()}`;
            }
        }
    });

    // Email validation
    const email = document.getElementById('email');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            email.style.borderColor = '#e74c3c';
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Phone validation - simplified for testing
    const phone = document.getElementById('phone');
    if (phone && phone.value) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.value.replace(/\s+/g, ''))) {
            phone.style.borderColor = '#e74c3c';
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit phone number';
        }
    }

    // Date validation
    const checkin = document.getElementById('checkin');
    const checkout = document.getElementById('checkout');
    if (checkin && checkout && checkin.value && checkout.value) {
        const checkinDate = new Date(checkin.value);
        const checkoutDate = new Date(checkout.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkinDate < today) {
            checkin.style.borderColor = '#e74c3c';
            isValid = false;
            errorMessage = 'Check-in date cannot be in the past';
        } else if (checkoutDate <= checkinDate) {
            checkout.style.borderColor = '#e74c3c';
            isValid = false;
            errorMessage = 'Check-out date must be after check-in date';
        }
    }

    // Show error message if validation fails
    if (!isValid && errorMessage) {
        showErrorNotification(errorMessage);
    }

    return isValid;
}

// Update form validation on input
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = 'maroon';
            } else {
                this.style.borderColor = '#ddd';
            }
        });
    });
});

// Full-page booking functions
function openBookingModal() {
    // Hide all main sections
    const sections = ['home', 'about', 'rooms', 'gallery', 'contact'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Hide footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'none';
    }
    
    // Show booking page
    const bookingPage = document.getElementById('booking');
    if (bookingPage) {
        bookingPage.style.display = 'block';
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goBackFromBooking() {
    // Hide booking page
    const bookingPage = document.getElementById('booking');
    if (bookingPage) {
        bookingPage.style.display = 'none';
    }
    
    // Show all main sections
    const sections = ['home', 'about', 'rooms', 'gallery', 'contact'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    });
    
    // Show footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'block';
    }
    
    // Scroll to home section
    const homeSection = document.getElementById('home');
    if (homeSection) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update navigation to handle booking page
document.addEventListener('DOMContentLoaded', function() {
    // Add booking summary functionality
    const roomTypeSelect = document.getElementById('roomtype');
    const guestsSelect = document.getElementById('guests');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const bookingSummary = document.getElementById('bookingSummary');
    
    function updateBookingSummary() {
        if (roomTypeSelect && guestsSelect && checkinInput && checkoutInput && bookingSummary) {
            const roomType = roomTypeSelect.value;
            const guests = guestsSelect.value;
            const checkin = checkinInput.value;
            const checkout = checkoutInput.value;
            
            if (roomType && guests && checkin && checkout) {
                const checkinDate = new Date(checkin);
                const checkoutDate = new Date(checkout);
                const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
                
                if (nights > 0) {
                    const roomPrices = {
                        'ac-deluxe': 1500,
                        'ac-premium': 2000,
                        'non-ac-standard': 800,
                        'non-ac-economy': 500
                    };
                    
                    const pricePerNight = roomPrices[roomType] || 0;
                    const totalAmount = pricePerNight * nights;
                    
                    const summaryHTML = `
                        <div class="summary-item">
                            <span>Room Type:</span>
                            <strong>${getRoomTypeName(roomType)}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Guests:</span>
                            <strong>${guests} Guest${guests > 1 ? 's' : ''}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Check-in:</span>
                            <strong>${formatDate(checkin)}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Check-out:</span>
                            <strong>${formatDate(checkout)}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Duration:</span>
                            <strong>${nights} Night${nights > 1 ? 's' : ''}</strong>
                        </div>
                        <div class="summary-item total">
                            <span>Total Amount:</span>
                            <strong>₹${totalAmount.toLocaleString()}</strong>
                        </div>
                    `;
                    
                    bookingSummary.querySelector('.summary-details').innerHTML = summaryHTML;
                    bookingSummary.style.display = 'block';
                } else {
                    bookingSummary.style.display = 'none';
                }
            } else {
                bookingSummary.style.display = 'none';
            }
        }
    }
    
    // Add event listeners for summary updates
    if (roomTypeSelect) roomTypeSelect.addEventListener('change', updateBookingSummary);
    if (guestsSelect) guestsSelect.addEventListener('change', updateBookingSummary);
    if (checkinInput) checkinInput.addEventListener('change', updateBookingSummary);
    if (checkoutInput) checkoutInput.addEventListener('change', updateBookingSummary);
});

// Generate unique booking ID
function generateBookingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BK${timestamp}${random}`;
}

// Send WhatsApp booking message
function sendWhatsAppBooking(data) {
    const message = createWhatsAppMessage(data);
    const phoneNumber = '919827637611'; // Your WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab after a short delay to show notification first
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1500);
}

// Show success notification
function showSuccessNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <div class="notification-text">
                <span class="notification-title">Booking Submitted Successfully!</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// Show error notification
function showErrorNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-circle"></i>
            <div class="notification-text">
                <span class="notification-title">Validation Error</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

// Enhanced saveBookingData function
function saveBookingData(data) {
    // Create booking object with all required fields
    const booking = {
        id: data.bookingId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        roomType: getRoomTypeName(data.roomtype),
        checkin: data.checkin,
        checkout: data.checkout,
        guests: data.guests,
        message: data.message || '',
        status: 'pending',
        timestamp: data.timestamp,
        submittedAt: new Date().toLocaleString('en-IN')
    };
    
    // Get existing bookings
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Add new booking to the beginning of the array (most recent first)
    existingBookings.unshift(booking);
    
    // Keep only last 100 bookings to prevent localStorage overflow
    if (existingBookings.length > 100) {
        existingBookings.splice(100);
    }
    
    // Save back to localStorage
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    console.log('Booking saved with ID:', data.bookingId);
    return data.bookingId;
}

// Test function for debugging - can be called from browser console
function testBookingSubmission() {
    console.log('Testing booking submission...');
    
    // Check if form exists
    const form = document.getElementById('bookingForm');
    console.log('Form found:', form);
    
    if (form) {
        // Fill form with test data
        document.getElementById('name').value = 'Test User';
        document.getElementById('phone').value = '9876543210';
        document.getElementById('email').value = 'test@example.com';
        document.getElementById('checkin').value = '2024-02-01';
        document.getElementById('checkout').value = '2024-02-03';
        document.getElementById('roomtype').value = 'ac-deluxe';
        document.getElementById('guests').value = '2';
        document.getElementById('message').value = 'Test booking';
        
        console.log('Form filled with test data');
        
        // Trigger form submission
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
        
        console.log('Form submission event dispatched');
    } else {
        console.error('Form not found!');
    }
}
