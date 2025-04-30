import React from 'react';

const StandardizedInput = ({ 
    label, 
    name, 
    value, 
    onChange, 
    type = 'text', 
    required = false, 
    maxLength, 
    placeholder,
    style = {} 
}) => {
    const inputStyle = {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '15px',
        boxSizing: 'border-box',
        height: '40px',
        fontSize: '14px',
        ...style
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '500',
        fontSize: '14px',
        color: '#333'
    };

    return (
        <div>
            <label style={labelStyle}>
                {label}
                {required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                maxLength={maxLength}
                placeholder={placeholder}
                style={inputStyle}
            />
        </div>
    );
};

export default StandardizedInput; 