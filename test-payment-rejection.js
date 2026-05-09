// Test script for payment rejection system
// Run with: node test-payment-rejection.js

const API_BASE = 'http://localhost:3000/api';

async function testPaymentRejection() {
  console.log('🧪 Testing Payment Rejection System...\n');

  try {
    // 1. Create a test order with bank payment
    console.log('1️⃣ Creating test order with bank payment...');
    const orderResponse = await fetch(`${API_BASE}/orders/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '+22212345678',
        customerName: 'Test Customer',
        shippingAddress: 'Test Address, Nouakchott',
        paymentMethod: 'bank',
        items: [{ productId: 'test123', name: 'Test Product', price: 100, quantity: 1 }],
        totalAmount: 115,
        deliveryFee: 15,
        shopId: 'test-shop-id'
      })
    });

    const orderData = await orderResponse.json();
    if (!orderData.success) {
      throw new Error('Failed to create order: ' + orderData.error);
    }

    const orderId = orderData.orderId;
    console.log(`✅ Order created: ${orderData.orderNumber} (ID: ${orderId})\n`);

    // 2. Upload a receipt
    console.log('2️⃣ Simulating receipt upload...');
    const receiptResponse = await fetch(`${API_BASE}/orders/${orderId}/receipt`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiptUrl: '/uploads/test-receipt.jpg'
      })
    });

    const receiptData = await receiptResponse.json();
    if (!receiptData.success) {
      throw new Error('Failed to upload receipt: ' + receiptData.error);
    }
    console.log('✅ Receipt uploaded successfully\n');

    // 3. Reject the payment
    console.log('3️⃣ Rejecting the payment...');
    const rejectResponse = await fetch(`${API_BASE}/orders/${orderId}/payment-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentStatus: 'rejected',
        note: 'الإيصال غير واضح'
      })
    });

    const rejectData = await rejectResponse.json();
    if (!rejectData.success) {
      throw new Error('Failed to reject payment: ' + rejectData.error);
    }
    console.log('✅ Payment rejected successfully\n');

    // 4. Try to update order status (should fail)
    console.log('4️⃣ Trying to update order status (should fail)...');
    const statusResponse = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'confirmed'
      })
    });

    const statusData = await statusResponse.json();
    if (statusResponse.ok) {
      console.log('❌ ERROR: Status update should have failed but succeeded');
    } else {
      console.log('✅ Status update correctly blocked:', statusData.error);
    }
    console.log();

    // 5. Upload new receipt
    console.log('5️⃣ Uploading new receipt...');
    const newReceiptResponse = await fetch(`${API_BASE}/orders/${orderId}/new-receipt`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiptUrl: '/uploads/new-receipt.jpg'
      })
    });

    const newReceiptData = await newReceiptResponse.json();
    if (!newReceiptData.success) {
      throw new Error('Failed to upload new receipt: ' + newReceiptData.error);
    }
    console.log('✅ New receipt uploaded successfully\n');

    // 6. Try to update order status again (should work now)
    console.log('6️⃣ Trying to update order status again (should work now)...');
    const finalStatusResponse = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'confirmed'
      })
    });

    const finalStatusData = await finalStatusResponse.json();
    if (finalStatusResponse.ok && finalStatusData.success) {
      console.log('✅ Status update successful after new receipt upload');
    } else {
      console.log('❌ ERROR: Status update failed:', finalStatusData.error);
    }

    console.log('\n🎉 Payment rejection system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentRejection();