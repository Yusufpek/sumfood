import { FaStar } from 'react-icons/fa';

function StarRatingDisplay({ rating = 0, totalStars = 5, size = 20, activeColor = "#ffc107", inactiveColor = "#e4e5e9" }) {
    return (
        <div className="star-rating-display" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <FaStar
                        key={index}
                        size={size}
                        color={starValue <= rating ? activeColor : inactiveColor}
                    />
                );
            })}
        </div>
    );
}

export default StarRatingDisplay;