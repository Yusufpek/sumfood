import React, { useState } from 'react';
import './PaymentMethods.css';
import StandardizedInput from '../../../components/common/StandardizedInput';

const PaymentMethods = () => {
    // Mock data - TODO: Replace with API call to fetch payment methods
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: 1,
            cardNumber: '**** **** **** 1234',
            expiryDate: '12/25',
            cardHolder: 'John Doe',
            isDefault: true
        },
        {
            id: 2,
            cardNumber: '**** **** **** 5678',
            expiryDate: '06/24',
            cardHolder: 'John Doe',
            isDefault: false
        }
    ]);

    const [newCard, setNewCard] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'expiryDate') {
            // Format expiry date as user types (MM/YY)
            const formattedValue = value
                .replace(/\D/g, '') // Remove non-digits
                .replace(/^(\d{2})/, '$1/') // Add slash after 2 digits
                .substr(0, 5); // Limit to 5 characters (MM/YY)
            setNewCard(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'cardNumber') {
            // Format card number as user types (groups of 4)
            const formattedValue = value
                .replace(/\D/g, '') // Remove non-digits
                .replace(/(\d{4})/g, '$1 ') // Add space after every 4 digits
                .trim() // Remove trailing space
                .substr(0, 19); // Limit to 16 digits + 3 spaces
            setNewCard(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else {
            setNewCard(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        // TODO: Add API call to add new card
        const newId = Math.max(...paymentMethods.map(p => p.id)) + 1;
        setPaymentMethods([...paymentMethods, {
            id: newId,
            cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
            expiryDate: newCard.expiryDate,
            cardHolder: newCard.cardHolder,
            isDefault: false
        }]);
        setNewCard({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolder: ''
        });
        setMessage({ type: 'success', text: 'Card added successfully' });
    };

    const handleDeleteCard = (id) => {
        setPaymentMethods(paymentMethods.filter(card => card.id !== id));
        setMessage({ type: 'success', text: 'Card deleted successfully' });
    };

    const handleSetDefault = (id) => {
        setPaymentMethods(paymentMethods.map(card => ({
            ...card,
            isDefault: card.id === id
        })));
        setMessage({ type: 'success', text: 'Default card updated successfully' });
    };

    return (
        <div className="payment-methods">
            <h2>Payment Methods</h2>
            
            <form onSubmit={handleAddCard} className="payment-form">
                <h3>Add New Card</h3>
                <div className="input-group">
                    <StandardizedInput
                        label="Card Number"
                        name="cardNumber"
                        value={newCard.cardNumber}
                        onChange={handleInputChange}
                        required
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                    />
                </div>
                <div className="expiry-and-cvv">
                    <div className="half-width">
                        <StandardizedInput
                            label="Expiry Date (MM/YY)"
                            name="expiryDate"
                            value={newCard.expiryDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="half-width">
                        <StandardizedInput
                            label="CVV"
                            name="cvv"
                            value={newCard.cvv}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <StandardizedInput
                        label="Card Holder Name"
                        name="cardHolder"
                        value={newCard.cardHolder}
                        onChange={handleInputChange}
                        required
                        placeholder="JOHN DOE"
                    />
                </div>
                <button
                    type="submit"
                    className="add-button"
                >
                    Add Card
                </button>
            </form>

            {message.text && (
                <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                    {message.text}
                </div>
            )}

            {paymentMethods.length > 0 && (
                <div className="saved-cards">
                    <h3>Saved Cards</h3>
                    {paymentMethods.map(card => (
                        <div key={card.id} className="payment-card">
                            <div className="card-header">
                                <h4>Card {card.id}</h4>
                                {card.isDefault && (
                                    <span className="default-badge">
                                        Default
                                    </span>
                                )}
                            </div>
                            <div className="card-details">
                                <div className="card-number">{card.cardNumber}</div>
                                <div className="card-info">
                                    <span>Expires: {card.expiryDate}</span>
                                    <span>Holder: {card.cardHolder}</span>
                                </div>
                            </div>
                            <div className="card-actions">
                                {!card.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(card.id)}
                                        className="set-default-button"
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentMethods; 