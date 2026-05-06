import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useCart } from '../contexts/CartContext';

const CartView = ({ navigation }) => {
  const { cartItems, removeFromCart, updateQuantity, getTotalAmount, clearCart } = useCart();

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.images?.[0] && (
        <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price} DH</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item._id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item._id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item._id)}>
        <Text style={styles.removeButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Votre panier est vide</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('PublicCatalog')}
        >
          <Text style={styles.shopButtonText}>Continuer vos achats</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
      />
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{getTotalAmount()} DH</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('GuestCheckout', { cartItems })}
        >
          <Text style={styles.checkoutButtonText}>Passer commande</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#555', marginBottom: 20 },
  shopButton: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 8 },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, marginBottom: 8, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemPrice: { fontSize: 14, color: '#2ecc71', marginTop: 4 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantityButton: { backgroundColor: '#ecf0f1', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold' },
  quantity: { fontSize: 16, marginHorizontal: 16 },
  removeButton: { fontSize: 24, color: '#e74c3c', padding: 8 },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#ddd' },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' },
  checkoutButton: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 8, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default CartView;
