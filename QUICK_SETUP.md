# Quick Setup Guide - Guest Checkout System

## 🚀 Installation Steps

### 1. Backend Setup (Already Done ✅)

The following files have been created/updated:

**New Models:**
- `backend/models/Order.js` - Order management
- `backend/models/Review.js` - Review system

**New Routes:**
- `backend/routes/orders.js` - Order endpoints
- `backend/routes/reviews.js` - Review endpoints

**Updated Files:**
- `backend/server.js` - Added order and review routes
- `backend/routes/products.js` - Added public catalog endpoint
- `backend/services/notificationService.js` - Added order notifications

### 2. Frontend Setup

**New Components Created:**
- `src/components/PublicCatalog.js` - Public product catalog
- `src/components/GuestCheckout.js` - Guest checkout with OTP
- `src/components/OrderTracking.js` - Order tracking by phone
- `src/components/ReviewForm.js` - Product review form
- `src/components/ShopOrderManagement.js` - Shop order dashboard

### 3. Integration Steps

#### Step 3.1: Install Dependencies (if needed)
```bash
cd /Users/macpro/Documents/projects/ProjetReact/my-hader-app
npm install expo-device
```

#### Step 3.2: Update Navigation

Add to your `App.js` or navigation configuration:

```javascript
import PublicCatalog from './src/components/PublicCatalog';
import GuestCheckout from './src/components/GuestCheckout';
import OrderTracking from './src/components/OrderTracking';
import ReviewForm from './src/components/ReviewForm';
import ShopOrderManagement from './src/components/ShopOrderManagement';

// In your Stack Navigator:
<Stack.Screen 
  name="PublicCatalog" 
  component={PublicCatalog}
  options={{ title: 'Catalogue' }}
/>
<Stack.Screen 
  name="GuestCheckout" 
  component={GuestCheckout}
  options={{ title: 'Finaliser la commande' }}
/>
<Stack.Screen 
  name="OrderTracking" 
  component={OrderTracking}
  options={{ title: 'Suivi de commande' }}
/>
<Stack.Screen 
  name="ReviewForm" 
  component={ReviewForm}
  options={{ title: 'Donner un avis' }}
/>
```

#### Step 3.3: Add to Shop Dashboard

In your existing `ShopDashboard.js`, add:

```javascript
import ShopOrderManagement from './ShopOrderManagement';

// Inside your shop dashboard:
<ShopOrderManagement shopId={currentShopId} />
```

#### Step 3.4: Add Cart Functionality

Create a simple cart context or state management:

```javascript
// src/contexts/CartContext.js
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item._id !== productId));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
```

Wrap your app:
```javascript
// App.js
import { CartProvider } from './src/contexts/CartContext';

<CartProvider>
  <NavigationContainer>
    {/* Your navigation */}
  </NavigationContainer>
</CartProvider>
```

### 4. Start the System

#### Terminal 1 - Backend:
```bash
cd backend
node server.js
```

#### Terminal 2 - Frontend:
```bash
npm start
# or
expo start
```

### 5. Test the Flow

#### Test Guest Checkout:
1. Open app → Navigate to PublicCatalog
2. Select a product → Add to cart
3. Go to checkout → Enter phone number
4. View OTP on screen → Enter OTP
5. Verify order created

#### Test Shop Order Management:
1. Login as shop owner
2. Navigate to orders section
3. View new order notification
4. Update order status
5. Add tracking link

#### Test Review System:
1. Mark order as "delivered"
2. Customer navigates to ReviewForm
3. Submit rating and comment
4. Shop receives notification

## 🔧 Configuration

### Environment Variables

Ensure your `.env` files are configured:

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/marketplace
PORT=3000
```

**Frontend (.env):**
```
API_URL=http://localhost:3000
```

### Database Indexes

The system automatically creates indexes for:
- Order: `phoneNumber + deviceId`
- Order: `orderNumber`
- Product: `name + shopId`

## 📱 User Flows

### Guest User Flow:
```
Browse Catalog → Select Product → Add to Cart → 
Enter Phone → View OTP → Confirm → Track Order → 
Receive Delivery → Submit Review
```

### Shop Owner Flow:
```
Receive Notification → View Order → Update Status → 
Add Tracking → Mark Delivered → View Review
```

## 🔔 Notifications

### Shop Notifications:
- ✅ New order received
- ✅ Low stock alert (< 5 items)
- ✅ Customer review submitted

### Customer Notifications (Future):
- 📧 Order confirmation (email/WhatsApp)
- 📦 Shipping update (email/WhatsApp)
- ✅ Delivery confirmation (email/WhatsApp)

## 🐛 Troubleshooting

### Issue: OTP not displaying
**Solution:** Check console logs, ensure order creation successful

### Issue: Shop not receiving notifications
**Solution:** Verify `expoPushToken` in User model, check notification service logs

### Issue: Products not showing in catalog
**Solution:** Ensure products have `stock > 0`, check `/api/products/public` endpoint

### Issue: Order verification failing
**Solution:** Check OTP expiration (5 minutes), verify OTP matches exactly

## 📊 Monitoring

### Check Order Status:
```bash
# MongoDB shell
use marketplace
db.orders.find().pretty()
```

### Check Notifications:
```bash
db.notifications.find({ type: 'new_order' }).pretty()
```

### Check Reviews:
```bash
db.reviews.find().pretty()
```

## 🎯 Next Steps

1. **Test thoroughly** - Go through complete user journey
2. **Add payment gateway** - Integrate Stripe/PayPal
3. **WhatsApp integration** - Send order updates via WhatsApp
4. **Email notifications** - Configure email service
5. **Analytics dashboard** - Track orders, revenue, popular products
6. **Advanced search** - Add filters, categories, price ranges
7. **Promotions** - Implement discount codes, special offers

## 📚 Documentation

- Full documentation: `GUEST_CHECKOUT_GUIDE.md`
- API endpoints: See documentation file
- Database schema: See documentation file

## ✅ Checklist

- [x] Backend models created
- [x] Backend routes implemented
- [x] Frontend components created
- [ ] Navigation configured
- [ ] Cart system integrated
- [ ] Dependencies installed
- [ ] Backend started
- [ ] Frontend started
- [ ] Guest checkout tested
- [ ] Order management tested
- [ ] Review system tested

## 🆘 Support

If you encounter issues:
1. Check server logs in terminal
2. Verify MongoDB is running
3. Check API_URL configuration
4. Test endpoints with Postman
5. Review console logs in browser/app

---

**Ready to go! 🚀** Start with step 3 to integrate the components into your existing app.
