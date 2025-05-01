import React, { useState } from 'react';

// Example mock order data 
// !! Replace this with actual fetching code
const mockOrder = {
  id: 101,
  restaurantName: "SumFood Pizza",
  createdAt: new Date().toISOString(),
  orderStatus: "DELIVERED",
  paymentStatus: "SUCCESSFUL",
  totalPrice: 26.55,
  foodItems: [
    { foodItemId: 1, name: "Margherita Pizza", quantity: 2, price: 15.00 },
    { foodItemId: 2, name: "Garlic Bread", quantity: 1, price: 5.00 },
    { foodItemId: 3, name: "Cola", quantity: 2, price: 5.00 }
  ]
};

const OrderReviewPage = () => {
  const [reviews, setReviews] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (foodItemId, field, value) => {
    setReviews(prev => ({
      ...prev,
      [foodItemId]: { ...prev[foodItemId], [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // POST reviews here
    // axios.post('/api/review/food', etc
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Review Your Order</h2>
      <div>
        <strong>Order #{mockOrder.id}</strong> from <strong>{mockOrder.restaurantName}</strong>
      </div>
      <div style={{ margin: "16px 0" }}>
        <small>Date: {new Date(mockOrder.createdAt).toLocaleString()}</small>
      </div>
      <form onSubmit={handleSubmit}>
        {mockOrder.foodItems.map(item => (
          <div key={item.foodItemId} style={{ marginBottom: 24, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
            <div>
              <strong>{item.name}</strong> (x{item.quantity}) - ${item.price}
            </div>
            <div>
              <label>
                Rating:
                <select
                  value={reviews[item.foodItemId]?.score || ''}
                  onChange={e => handleChange(item.foodItemId, 'score', e.target.value)}
                  required
                  style={{ marginLeft: 8 }}
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                Review:
                <input
                  type="text"
                  value={reviews[item.foodItemId]?.comment || ''}
                  onChange={e => handleChange(item.foodItemId, 'comment', e.target.value)}
                  placeholder="Write your review"
                  style={{ marginLeft: 8, width: 300 }}
                />
              </label>
            </div>
          </div>
        ))}
        <button type="submit" style={{ padding: "8px 24px" }}>Submit Reviews</button>
      </form>
      {submitted && <div style={{ color: "green", marginTop: 16 }}>Thank you for your reviews!</div>}
    </div>
  );
};

export default OrderReviewPage;