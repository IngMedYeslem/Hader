# Marketplace Enhancement - Guest Checkout with Soft OTP

## Overview
This enhancement adds guest checkout functionality with Soft OTP verification to your existing marketplace platform **without altering existing features**.

## New Features Implemented

### 1. Guest Checkout System
- Customers can order without creating an account
- Identified by phone number and device ID
- Orders tracked via phone number

### 2. Soft OTP Verification
- 6-digit OTP generated client-side
- Displayed directly on screen (no SMS cost)
- Valid for 5 minutes
- Prevents fraudulent orders

### 3. Public Catalog
- Displays products from all participating stores
- Fair visibility algorithm (randomized/rotated display)
- Shows in-stock products only

### 4. Enhanced Notification System
- **New Order**: Notifies shop when order confirmed
- **Low Stock**: Alerts shop when product stock < 5
- **Customer Review**: Notifies shop of new reviews
- **Order Updates**: Sends tracking links to customers

### 5. Order Management
- Shops receive orders in dashboard
- Update order status (pending → confirmed → processing → shipped → delivered)
- Add tracking links for customer notifications

### 6. Review System
- Customers can review products after delivery
- Reviews linked to verified orders only
- Shops notified of new reviews

## Database Schema

### New Models

#### Order Model
```javascript
{
  orderNumber: String (unique),
  phoneNumber: String (required),
  deviceId: String,
  softOtp: String,
  otpStatus: 'pending' | 'verified' | 'expired',
  otpExpiresAt: Date,
  userId: ObjectId (optional - for registered users),
  shopId: ObjectId (required),
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: String,
  trackingLink: String,
  reviewSubmitted: Boolean
}
```

#### Review Model
```javascript
{
  orderId: ObjectId (required),
  productId: ObjectId (required),
  shopId: ObjectId (required),
  phoneNumber: String (required),
  rating: Number (1-5),
  comment: String
}
```

### Updated Models

#### Notification Model (Extended)
```javascript
{
  userId: String,
  title: String,
  body: String,
  type: 'shop_validated' | 'new_order' | 'low_stock' | 'review' | 'product_approval' | 'product_rejection' | 'order_update',
  orderId: ObjectId (optional),
  productId: ObjectId (optional),
  data: Object,
  read: Boolean,
  sent: Boolean
}
```

## API Endpoints

### Guest Checkout
- `POST /api/orders/guest` - Create guest order with OTP
- `POST /api/orders/:orderId/verify` - Verify OTP and confirm order
- `GET /api/orders/phone/:phoneNumber` - Get orders by phone number

### Order Management
- `PUT /api/orders/:orderId/status` - Update order status (shop)
- `GET /api/shops/:shopId/orders` - Get shop orders

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/products/:productId/reviews` - Get product reviews

### Public Catalog
- `GET /api/products/public` - Get all public products

## User Journey - Guest Checkout

### Step 1: Browse Public Catalog
```
Customer → PublicCatalog → View products from all stores
```

### Step 2: Select Product & Add to Cart
```
Customer → ProductDetail → Add to Cart
```

### Step 3: Checkout
```
Customer → GuestCheckout
  ↓
Enter: Phone Number + Shipping Address
  ↓
Click "Passer commande"
```

### Step 4: OTP Display
```
System generates 6-digit OTP
  ↓
Display OTP on screen (e.g., "123456")
  ↓
Customer enters OTP to confirm
```

### Step 5: Order Confirmation
```
OTP verified → Order confirmed
  ↓
Stock updated
  ↓
Shop notified (push notification)
  ↓
Customer redirected to OrderTracking
```

### Step 6: Order Tracking
```
Customer → OrderTracking (via phone number)
  ↓
View order status
  ↓
Access tracking link (when shipped)
```

### Step 7: Review (After Delivery)
```
Order status = "delivered"
  ↓
Customer → ReviewForm
  ↓
Submit rating + comment
  ↓
Shop notified
```

## Frontend Components

### New Components
1. **PublicCatalog.js** - Display all products
2. **GuestCheckout.js** - Guest checkout with OTP
3. **OrderTracking.js** - Track orders by phone
4. **ReviewForm.js** - Submit product reviews

### Integration Points
Add to your navigation:
```javascript
// App.js or navigation config
import PublicCatalog from './src/components/PublicCatalog';
import GuestCheckout from './src/components/GuestCheckout';
import OrderTracking from './src/components/OrderTracking';
import ReviewForm from './src/components/ReviewForm';

// Add routes
<Stack.Screen name="PublicCatalog" component={PublicCatalog} />
<Stack.Screen name="GuestCheckout" component={GuestCheckout} />
<Stack.Screen name="OrderTracking" component={OrderTracking} />
<Stack.Screen name="ReviewForm" component={ReviewForm} />
```

## Backend Routes

### New Route Files
1. **routes/orders.js** - Order management
2. **routes/reviews.js** - Review system

### Updated Files
1. **server.js** - Added order and review routes
2. **routes/products.js** - Added public catalog endpoint
3. **services/notificationService.js** - Added order notifications

## Notification Flow

### Shop Notifications
1. **New Order**: When customer confirms order with OTP
2. **Low Stock**: When product stock falls below 5
3. **Customer Review**: When customer submits review

### Customer Notifications (Future Enhancement)
- WhatsApp/Email integration for:
  - Order confirmation
  - Shipping updates
  - Delivery confirmation
  - Review request

## Security Features

### Soft OTP
- 6-digit random code
- 5-minute expiration
- One-time use only
- Prevents unauthorized orders

### Order Verification
- Phone number validation
- Device ID tracking
- OTP must match exactly
- Expired OTPs rejected

### Review Verification
- Only verified orders can be reviewed
- Only delivered orders can be reviewed
- One review per product per order
- Phone number must match order

## Fair Store Visibility

The public catalog implements fair visibility:
- Products from all stores displayed
- Randomized order (can be enhanced with rotation algorithm)
- Only in-stock products shown
- Limit 100 products per request (pagination recommended)

### Enhancement Options
```javascript
// Option 1: Random shuffle
products.sort(() => Math.random() - 0.5);

// Option 2: Round-robin by shop
// Group by shop, take 1 from each, repeat

// Option 3: Weighted by shop activity
// Prioritize active shops with recent orders
```

## Testing Checklist

### Guest Checkout Flow
- [ ] Create order with phone number
- [ ] OTP displayed correctly
- [ ] OTP verification works
- [ ] Invalid OTP rejected
- [ ] Expired OTP rejected
- [ ] Stock updated after confirmation
- [ ] Shop receives notification

### Order Management
- [ ] Shop can view orders
- [ ] Shop can update order status
- [ ] Shop can add tracking link
- [ ] Customer can track order

### Review System
- [ ] Customer can submit review after delivery
- [ ] Review linked to order
- [ ] Shop receives notification
- [ ] Reviews displayed on product

### Public Catalog
- [ ] Products from all shops displayed
- [ ] Only in-stock products shown
- [ ] Shop name displayed with product

## Migration Notes

### Existing Features Preserved
✅ User authentication system
✅ Shop registration and approval
✅ Product management
✅ Admin dashboard
✅ Existing notifications
✅ Media upload system

### No Breaking Changes
- All existing routes remain functional
- Database schema only extended (not modified)
- Existing components untouched
- Backward compatible

## Next Steps

### Recommended Enhancements
1. **WhatsApp Integration** - Send order updates via WhatsApp API
2. **Email Notifications** - Send order confirmations via email
3. **Payment Gateway** - Integrate payment processing
4. **Advanced Analytics** - Track order metrics and shop performance
5. **Inventory Management** - Auto-restock alerts
6. **Delivery Integration** - Connect with delivery services
7. **Customer Accounts** - Allow guests to create accounts later
8. **Loyalty Program** - Reward repeat customers

### Performance Optimizations
1. Add pagination to public catalog
2. Implement caching for product listings
3. Add search and filter functionality
4. Optimize database queries with indexes

## Support

For issues or questions:
1. Check server logs: `backend/server.js`
2. Verify MongoDB connection
3. Test API endpoints with Postman
4. Check notification service logs

## License
This enhancement maintains the same license as your existing project.
