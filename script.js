// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

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
    
    // Make room prices clickable to open booking section with pre-selected room
    document.querySelectorAll('.room-price').forEach(priceElement => {
        priceElement.addEventListener('click', function() {
            // Find the room card containing this price element
            const roomCard = this.closest('.room-card');
            
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
            
            // Scroll to booking section
            const bookingSection = document.getElementById('booking');
            if (bookingSection) {
                const offsetTop = bookingSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Pre-select the room type in the dropdown
                const roomTypeSelect = document.getElementById('roomtype');
                if (roomTypeSelect && roomTypeValue) {
                    roomTypeSelect.value = roomTypeValue;
                    
                    // Add a highlight effect to the form
                    const bookingForm = document.querySelector('.booking-form');
                    if (bookingForm) {
                        bookingForm.classList.add('highlight-form');
                        setTimeout(() => {
                            bookingForm.classList.remove('highlight-form');
                        }, 2000);
                    }
                }
            }
        });
        
        // Change cursor to pointer to indicate clickable
        priceElement.style.cursor = 'pointer';
    });

    // Booking form handling
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {};
            
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Save booking data to localStorage
            saveBookingData(data);

            // Create WhatsApp message
            const message = createWhatsAppMessage(data);
            
            // Open WhatsApp with the message
            const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            alert('Booking request submitted successfully!');
            this.reset();
        });
    }
    
    // Function to save booking data to localStorage
    function saveBookingData(data) {
        // Generate a unique ID for the booking
        const bookingId = Date.now().toString();
        
        // Add timestamp and status
        data.id = bookingId;
        data.timestamp = new Date().toISOString();
        data.status = 'pending'; // pending, confirmed, cancelled
        
        // Save booking with unique key
        localStorage.setItem(`booking_${bookingId}`, JSON.stringify(data));
        
        console.log('Booking saved with ID:', bookingId);
        return bookingId;
    }

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

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(128, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'maroon';
            navbar.style.backdropFilter = 'none';
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
});

// Create WhatsApp message from form data
function createWhatsAppMessage(data) {
    const message = `
🏨 *BOOKING REQUEST - Shree Agrawal Yaatri Grah & Lodge*

👤 *Guest Details:*
Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}

📅 *Booking Details:*
Check-in: ${formatDate(data.checkin)}
Check-out: ${formatDate(data.checkout)}
Room Type: ${getRoomTypeName(data.roomtype)}
Number of Guests: ${data.guests}

${data.message ? `📝 *Special Requests:*\n${data.message}` : ''}

Please confirm availability and send booking details. Thank you!
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

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        } else if (field) {
            field.style.borderColor = '#ddd';
        }
    });

    // Email validation
    const email = document.getElementById('email');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            email.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }

    // Phone validation
    const phone = document.getElementById('phone');
    if (phone && phone.value) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.value.replace(/\s+/g, ''))) {
            phone.style.borderColor = '#e74c3c';
            isValid = false;
        }
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
