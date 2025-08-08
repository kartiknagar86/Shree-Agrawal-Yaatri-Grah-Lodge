// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing booking system...');
    
    // Initialize all components
    initializeMobileNavigation();
    initializeSmoothScrolling();
    initializeRoomButtons();
    initializeBookingForm();
    initializeDateInputs();
    initializeImageLoading();
    initializeScrollEffects();
    
    console.log('All initialization complete');
});

// Initialize mobile navigation
function initializeMobileNavigation() {
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

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize room buttons
function initializeRoomButtons() {
    document.querySelectorAll('.room-price, .btn-primary').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            // Always show booking section
            if (typeof openBookingModal === 'function') {
                openBookingModal();
            }
            const roomCard = this.closest('.room-card');
            
            if (roomCard) {
                const roomTitle = roomCard.querySelector('h3').textContent.trim();
                
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
                
                const bookingForm = document.getElementById('bookingForm');
                if (bookingForm) {
                    const offsetTop = bookingForm.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    const roomTypeSelect = document.getElementById('roomtype');
                    if (roomTypeSelect && roomTypeValue) {
                        roomTypeSelect.value = roomTypeValue;
                        
                        const firstInput = document.getElementById('name');
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }
                }
            }
        });
        
        element.style.cursor = 'pointer';
    });
}

// Initialize booking form functionality
function initializeBookingForm() {
    console.log('Initializing booking form...');
    
    const bookingForm = document.getElementById('bookingForm');
    console.log('Booking form found:', bookingForm);
    
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
                
                // Send WhatsApp message and redirect immediately
                sendWhatsAppBooking(data);
                
                // Show loading state on button
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
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

    document.querySelectorAll('.room-card, .gallery-item, .feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

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

// Generate unique booking ID
function generateBookingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BK${timestamp}${random}`;
}

// Send WhatsApp booking message
function sendWhatsAppBooking(data) {
    const message = createWhatsAppMessage(data);
    const phoneNumber = '919827637611';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Redirect to WhatsApp immediately
    window.open(whatsappUrl, '_blank');
}

// Show success notification
function showSuccessNotification(message) {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// Show error notification
function showErrorNotification(message) {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

// Save booking data to localStorage
function saveBookingData(data) {
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
    
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.unshift(booking);
    
    if (existingBookings.length > 100) {
        existingBookings.splice(100);
    }
    
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    console.log('Booking saved with ID:', data.bookingId);
    return data.bookingId;
}

// Test function for debugging
function testBookingSubmission() {
    console.log('Testing booking submission...');
    
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

// Booking modal functions
function openBookingModal() {
    const sections = ['home', 'about', 'rooms', 'gallery', 'contact'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'none';
    }
    
    const bookingPage = document.getElementById('booking');
    if (bookingPage) {
        bookingPage.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goBackFromBooking() {
    const bookingPage = document.getElementById('booking');
    if (bookingPage) {
        bookingPage.style.display = 'none';
    }
    
    const sections = ['home', 'about', 'rooms', 'gallery', 'contact'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    });
    
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'block';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
} 
window.openBookingModal = openBookingModal;
window.goBackFromBooking = goBackFromBooking;

// Direct booking submission and WhatsApp redirect
function submitBookingAndRedirect() {
    console.log('Direct booking submission triggered');
    
    // Get form elements
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const roomtype = document.getElementById('roomtype').value;
    const guests = document.getElementById('guests').value;
    const message = document.getElementById('message').value.trim();
    
    // Basic validation
    if (!name || !phone || !email || !checkin || !checkout || !roomtype || !guests) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Phone number validation
    if (phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Date validation
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkinDate < today) {
        alert('Check-in date cannot be in the past');
        return;
    }
    
    if (checkoutDate <= checkinDate) {
        alert('Check-out date must be after check-in date');
        return;
    }
    
    // Calculate nights
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    
    // Get room type name
    const roomTypeNames = {
        'ac-deluxe': 'AC Deluxe Room - ₹1,500/night',
        'ac-premium': 'AC Premium Room - ₹2,000/night',
        'non-ac-standard': 'Non-AC Standard Room - ₹800/night',
        'non-ac-economy': 'Non-AC Economy Room - ₹500/night'
    };
    
    const roomTypeName = roomTypeNames[roomtype] || roomtype;
    
    // Format dates
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Create WhatsApp message
    const whatsappMessage = `
🏨 *NEW BOOKING REQUEST - Shree Agrawal Yaatri Grah & Lodge*

🆔 *Booking ID:* BK${Date.now()}

👤 *Guest Details:*
• Name: ${name}
• Phone: ${phone}
• Email: ${email}

📅 *Booking Details:*
• Check-in: ${formatDate(checkin)}
• Check-out: ${formatDate(checkout)}
• Duration: ${nights} night${nights > 1 ? 's' : ''}
• Room Type: ${roomTypeName}
• Number of Guests: ${guests}

${message ? `📝 *Special Requests:*\n${message}` : ''}

⏰ *Submitted:* ${new Date().toLocaleString('en-IN')}

Please confirm availability and provide booking confirmation. Thank you!
    `.trim();
    
    // Create WhatsApp URL
    const phoneNumber = '919827637611';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    console.log('Redirecting to WhatsApp:', whatsappUrl);
    
    // Show success message
    alert('Booking submitted successfully! Redirecting to WhatsApp...');
    
    // Redirect to WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Reset form after a short delay
    setTimeout(() => {
        document.getElementById('bookingForm').reset();
    }, 1000);
} 