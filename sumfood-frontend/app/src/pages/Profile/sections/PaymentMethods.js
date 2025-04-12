import React, { useState } from 'react';

const PaymentMethods = () => {
    // Mock data - TODO: Replace with API call to fetch payment methods
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: 1,
            type: 'credit',
            cardNumber: '**** **** **** 1234',
            expiryDate: '12/25',
            cardholderName: 'John Doe',
            isDefault: true
        },
        {
            id: 2,
            type: 'debit',
            cardNumber: '**** **** **** 5678',
            expiryDate: '06/24',
            cardholderName: 'John Doe',
            isDefault: false
        }
    ]);

    const [newPaymentMethod, setNewPaymentMethod] = useState({
        type: 'credit',
        cardNumber: '',
        expiryDate: '',
        cardholderName: '',
        cvv: '',
        isDefault: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPaymentMethod(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddPaymentMethod = (e) => {
        e.preventDefault();
        // TODO: Add API call to add new payment method
        // Example: POST /api/users/payment-methods
        const newId = Math.max(...paymentMethods.map(p => p.id)) + 1;
        setPaymentMethods([...paymentMethods, { 
            ...newPaymentMethod, 
            id: newId,
            cardNumber: `**** **** **** ${newPaymentMethod.cardNumber.slice(-4)}`
        }]);
        setNewPaymentMethod({
            type: 'credit',
            cardNumber: '',
            expiryDate: '',
            cardholderName: '',
            cvv: '',
            isDefault: false
        });
    };

    const handleDeletePaymentMethod = (id) => {
        // TODO: Add API call to delete payment method
        // Example: DELETE /api/users/payment-methods/{id}
        setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    };

    const handleSetDefault = (id) => {
        // TODO: Add API call to set default payment method
        // Example: PUT /api/users/payment-methods/{id}/default
        setPaymentMethods(paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === id
        })));
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '15px',
        boxSizing: 'border-box',
        height: '40px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold'
    };

    const formStyle = {
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    };

    const cardStyle = {
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
    };

    const buttonStyle = {
        padding: '5px 10px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    return (
        <div className="payment-methods" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Payment Methods</h2>
            
            {/* Add New Payment Method Form */}
            <form onSubmit={handleAddPaymentMethod} style={formStyle}>
                <h3 style={{ marginBottom: '15px' }}>Add New Payment Method</h3>
                <div>
                    <label style={labelStyle}>
                        Card Type
                    </label>
                    <select
                        name="type"
                        value={newPaymentMethod.type}
                        onChange={handleInputChange}
                        style={inputStyle}
                    >
                        <option value="credit">Credit Card</option>
                        <option value="debit">Debit Card</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>
                        Card Number
                    </label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={newPaymentMethod.cardNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="1234 5678 9012 3456"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        Expiry Date
                    </label>
                    <input
                        type="text"
                        name="expiryDate"
                        value={newPaymentMethod.expiryDate}
                        onChange={handleInputChange}
                        required
                        placeholder="MM/YY"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        CVV
                    </label>
                    <input
                        type="text"
                        name="cvv"
                        value={newPaymentMethod.cvv}
                        onChange={handleInputChange}
                        required
                        placeholder="123"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        Cardholder Name
                    </label>
                    <input
                        type="text"
                        name="cardholderName"
                        value={newPaymentMethod.cardholderName}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={newPaymentMethod.isDefault}
                            onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                        />
                        Set as default payment method
                    </label>
                </div>
                <button
                    type="submit"
                    style={{
                        ...buttonStyle,
                        padding: '10px 20px',
                        backgroundColor: '#28a745'
                    }}
                >
                    Add Payment Method
                </button>
            </form>

            {/* Payment Methods List */}
            <div>
                <h3 style={{ marginBottom: '15px' }}>Saved Payment Methods</h3>
                {paymentMethods.map(method => (
                    <div key={method.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0 }}>{method.type === 'credit' ? 'Credit Card' : 'Debit Card'}</h4>
                            {method.isDefault && (
                                <span style={{ 
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}>
                                    Default
                                </span>
                            )}
                        </div>
                        <p style={{ margin: '5px 0' }}>Card Number: {method.cardNumber}</p>
                        <p style={{ margin: '5px 0' }}>Expiry Date: {method.expiryDate}</p>
                        <p style={{ margin: '5px 0' }}>Cardholder: {method.cardholderName}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {!method.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(method.id)}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#007bff'
                                    }}
                                >
                                    Set as Default
                                </button>
                            )}
                            <button
                                onClick={() => handleDeletePaymentMethod(method.id)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#dc3545'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethods; 