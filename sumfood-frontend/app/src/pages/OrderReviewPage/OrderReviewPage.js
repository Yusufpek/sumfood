import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'; // Make sure react-icons is installed

const StarRating = ({ rating, onRatingChange, disabled = false }) => { // Added disabled prop
  const [hover, setHover] = useState(null);

  const handleMouseEnter = (value) => {
    if (!disabled) {
      setHover(value);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHover(null);
    }
  };

  const handleClick = (value) => {
    if (!disabled) {
      onRatingChange(value);
    }
  };


  const renderStar = (index) => {
    const starValue = index + 1;
    const halfStarValue = index + 0.5;

    // Determine filled status based on hover or actual rating
    const filled = hover ? hover >= starValue : rating >= starValue;
    const halfFilled = hover ? hover === halfStarValue : rating === halfStarValue;

    return (
      <div
        key={index}
        style={{
          display: 'inline-block', // Display stars inline
          position: 'relative',    // For positioning hover/click areas
          cursor: disabled ? 'default' : 'pointer', // Change cursor if disabled
          marginRight: '4px',      // Spacing between stars
          lineHeight: '1',         // Prevent extra vertical space
          color: disabled ? '#b0b0b0' : '#e4e5e9', // Default/disabled empty star color
        }}
        onMouseEnter={() => handleMouseEnter(starValue)} // Hover over the whole star sets full value hover
        onMouseLeave={handleMouseLeave}
      >
        {/* Click area for the LEFT half (0.5 rating) */}
        <div
          style={{
            position: 'absolute',
            width: '50%',
            height: '100%',
            left: 0,
            top: 0,
            // backgroundColor: 'rgba(0, 255, 0, 0.1)', // Optional: for debugging click areas
            cursor: disabled ? 'default' : 'pointer',
            zIndex: 2, // Above the star icon
          }}
          onMouseEnter={() => handleMouseEnter(halfStarValue)} // Hovering left sets half value hover
          // onMouseLeave is handled by the parent div
          onClick={() => handleClick(halfStarValue)}
        />
        {/* Click area for the RIGHT half (full star rating) */}
         <div
          style={{
            position: 'absolute',
            width: '50%',
            height: '100%',
            right: 0,
            top: 0,
            // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Optional: for debugging click areas
            cursor: disabled ? 'default' : 'pointer',
            zIndex: 2, // Above the star icon
          }}
          onMouseEnter={() => handleMouseEnter(starValue)} // Hovering right sets full value hover
          // onMouseLeave is handled by the parent div
          onClick={() => handleClick(starValue)}
        />

        {/* Star Icon Rendering */}
        {halfFilled ? (
          <FaStarHalfAlt size={24} style={{ color: disabled ? '#d4aa00' : '#ffc107', display: 'block' }} />
        ) : filled ? (
          <FaStar size={24} style={{ color: disabled ? '#d4aa00' : '#ffc107', display: 'block' }} />
        ) : (
          <FaStar size={24} style={{ display: 'block' }} /> // Uses the parent div's color
        )}
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',       // Use flexbox for alignment
      flexDirection: 'row',  // Align items horizontally (default)
      alignItems: 'center',  // Vertically center stars and text
      // marginLeft: 8,      // Removed margin from container, added to individual stars
    }}>
      {[...Array(5)].map((_, index) => renderStar(index))} {/* Normal index order (0 to 4) */}
      <span style={{
        marginLeft: '12px', // Spacing between last star and text
        fontSize: '0.9em',
        color: '#666',
        minWidth: '50px' // Ensure space for text display
      }}>
        {rating ? `${rating.toFixed(1)}/5.0` : 'Select'} {/* Show 'Select' if 0 */}
      </span>
    </div>
  );
};

// --- Keep the rest of your OrderReviewPage component as is ---

// Example mock order data
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
    // TODO: Add actual API call to POST reviews
    console.log("Submitting reviews:", reviews);
    setSubmitted(true);
    // Potentially disable form elements after submission
  };

  // Basic validation: Check if all items have a score > 0
  const canSubmit = () => {
      if (!mockOrder || !mockOrder.foodItems || mockOrder.foodItems.length === 0) {
          return false;
      }
      return mockOrder.foodItems.every(item => {
          const review = reviews[item.foodItemId];
          return review && review.score > 0;
      });
  };

  return (
    <div style={{
        maxWidth: 700, // Slightly wider
        margin: "40px auto",
        padding: "24px 32px", // More padding
        backgroundColor: "#ffffff",
        borderRadius: 12, // Softer corners
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", // Subtle shadow
        fontFamily: "Arial, sans-serif" // Basic font
     }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>Review Your Order</h2>
      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '24px' }}>
        <p style={{ margin: '4px 0', fontSize: '1.1em' }}>
            <strong>Order #{mockOrder.id}</strong> from <strong>{mockOrder.restaurantName}</strong>
        </p>
        <p style={{ margin: '4px 0', color: '#666', fontSize: '0.9em' }}>
            Date: {new Date(mockOrder.createdAt).toLocaleString()}
        </p>
         <p style={{ margin: '4px 0', color: '#666', fontSize: '0.9em' }}>
            Total: ${mockOrder.totalPrice.toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {mockOrder.foodItems.map(item => (
          <div key={item.foodItemId} style={{
            marginBottom: 32, // More space between items
            paddingBottom: 24, // More padding below item
            borderBottom: "1px dashed #e0e0e0", // Dashed separator
           }}>
            <div style={{ marginBottom: '16px' }}> {/* Increased margin */}
              <strong style={{ fontSize: '1.1em', color: '#444' }}>{item.name}</strong>
              <span style={{ marginLeft: '8px', color: '#777' }}>(x{item.quantity})</span>
              <span style={{ float: 'right', color: '#555', fontWeight: 'bold' }}>${(item.price / item.quantity).toFixed(2)} each</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ marginRight: '16px', fontWeight: '500', color: '#555', minWidth: '55px' }}>
                Rating:
              </label>
              <StarRating
                  rating={reviews[item.foodItemId]?.score || 0}
                  onRatingChange={(value) => handleChange(item.foodItemId, 'score', value)}
                  disabled={submitted} // Disable after submit
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <label style={{ marginRight: '16px', fontWeight: '500', color: '#555', minWidth: '55px', paddingTop: '5px' }}>
                Review:
              </label>
              <textarea // Changed to textarea for better review input
                  value={reviews[item.foodItemId]?.comment || ''}
                  onChange={e => handleChange(item.foodItemId, 'comment', e.target.value)}
                  placeholder="How was this order? (Optional)"
                  disabled={submitted} // Disable after submit
                  style={{
                      flexGrow: 1, // Take remaining space
                      padding: '10px 100px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      minHeight: '60px',
                      resize: 'vertical',
                      fontSize: '0.95em'
                  }}
              />
            </div>
          </div>
        ))}

        {/* Conditional rendering for submission status */}
        {submitted ? (
          <div style={{ color: "#28a745", marginTop: 24, textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em' }}>
            Thank you for your reviews!
          </div>
        ) : (
           <div style={{ textAlign: 'center', marginTop: '32px' }}> {/* Center the button */}
             <button
               type="submit"
               disabled={!canSubmit()} // Disable if not all items are rated
               style={{
                 padding: "10px 30px", // Larger padding
                 backgroundColor: !canSubmit() ? "#cccccc" : "#007bff", // Grey out if disabled
                 color: "white",
                 border: "none",
                 borderRadius: "5px", // Slightly more rounded
                 cursor: !canSubmit() ? "not-allowed" : "pointer",
                 fontSize: "1.05em", // Slightly larger font
                 transition: "background-color 0.2s ease" // Smooth transition
               }}
             >
               Submit Reviews
             </button>
             {!canSubmit() && ( // Optional hint if button is disabled
                <p style={{fontSize: '0.85em', color: '#777', marginTop: '8px'}}>Please rate all items.</p>
             )}
           </div>
        )}
      </form>
    </div>
  );
};


export default OrderReviewPage;