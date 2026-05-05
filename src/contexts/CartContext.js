import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartShop, setCartShop] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');

  const addToCart = (product, quantity = 1, shop = null) => {
    // إذا كانت السلة تحتوي على منتجات من متجر آخر، نظّفها
    if (cartShop && shop && cartShop._id !== shop._id) {
      setCartItems([{ ...product, quantity }]);
      setCartShop(shop);
      return;
    }
    if (!cartShop && shop) setCartShop(shop);

    const existingItem = cartItems.find(item => item._id === product._id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter(item => item._id !== productId);
    setCartItems(updated);
    if (updated.length === 0) setCartShop(null);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartShop(null);
  };

  const getTotalAmount = () =>
    cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, cartShop, deliveryAddress, deliveryPhone,
      setDeliveryAddress, setDeliveryPhone,
      addToCart, removeFromCart, updateQuantity, clearCart,
      getTotalAmount, getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
