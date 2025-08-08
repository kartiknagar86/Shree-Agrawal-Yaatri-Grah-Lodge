# Shree Agrawal Yaatri Grah & Lodge - Booking System

## Overview
This is a complete booking system for Shree Agrawal Yaatri Grah & Lodge that includes:
- Customer booking form
- WhatsApp integration for instant communication
- Admin panel for managing bookings
- Real-time booking updates

## Features

### Customer Booking Form (`index.html`)
- **Form Fields**: Name, Phone, Email, Check-in/Check-out dates, Room Type, Number of Guests, Special Requests
- **Validation**: Real-time form validation with error messages
- **WhatsApp Integration**: Automatically redirects to WhatsApp with pre-filled booking details
- **Success Notifications**: User-friendly success and error notifications

### WhatsApp Integration
- **Automatic Redirect**: After form submission, opens WhatsApp with detailed booking information
- **Comprehensive Message**: Includes booking ID, guest details, dates, room type, and special requests
- **Professional Format**: Well-formatted message with emojis and clear structure

### Admin Panel (`admin.html`)
- **Login System**: Secure admin login (username: `kartik`, password: `kartik123`)
- **Booking Management**: View, edit, and manage all bookings
- **Real-time Updates**: Automatically refreshes when new bookings are added
- **Filtering**: Filter bookings by status and date range
- **Export Functionality**: Export booking data

## How It Works

### Booking Flow
1. Customer fills out the booking form on the website
2. Form validates all required fields and shows error messages if needed
3. On successful submission:
   - Booking data is saved to localStorage (admin panel database)
   - Success notification is shown to the customer
   - WhatsApp opens automatically with pre-filled booking details
   - Form resets after 3 seconds

### Admin Panel Flow
1. Admin logs in with credentials
2. Dashboard shows booking statistics
3. Bookings section displays all customer bookings
4. Real-time updates every 5 seconds check for new bookings
5. Admin can view, edit, or delete bookings
6. Admin can filter bookings by status and date

## Technical Details

### Files Structure
```
shree_public/
├── index.html          # Main website with booking form
├── admin.html          # Admin panel
├── script.js           # Main JavaScript for booking functionality
├── admin.js            # Admin panel JavaScript
├── style.css           # Main styles
└── booking-styles.css  # Booking-specific styles
```

### Key Functions
- `validateBookingForm()`: Validates form data and shows error messages
- `saveBookingData()`: Saves booking to localStorage
- `sendWhatsAppBooking()`: Opens WhatsApp with booking details
- `createWhatsAppMessage()`: Formats booking data for WhatsApp
- `loadBookingsData()`: Loads bookings in admin panel
- `setupBookingRefresh()`: Sets up real-time booking updates

### Data Storage
- All booking data is stored in browser's localStorage
- Booking ID format: `BK{timestamp}{random}`
- Booking status: pending, confirmed, cancelled

## Setup Instructions

1. **Deploy Files**: Upload all files to your web server
2. **WhatsApp Number**: Update the phone number in `script.js` (line with `phoneNumber = '919827637611'`)
3. **Admin Credentials**: Change default admin credentials in `admin.js` if needed
4. **Test Booking**: Fill out the booking form to test the complete flow

## Customization

### Changing WhatsApp Number
Edit line in `script.js`:
```javascript
const phoneNumber = '919827637611'; // Replace with your number
```

### Changing Admin Credentials
Edit in `admin.js`:
```javascript
if (username === 'kartik' && password === 'kartik123') {
```

### Adding New Room Types
Update the room types in both `index.html` (form options) and `script.js` (getRoomTypeName function).

## Browser Compatibility
- Modern browsers with localStorage support
- Mobile-friendly responsive design
- WhatsApp Web integration

## Security Notes
- Admin credentials are stored in plain text (consider server-side authentication for production)
- Booking data is stored locally (consider database for production)
- Form validation is client-side (add server-side validation for production) 