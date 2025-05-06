import { useState, useEffect } from 'react';
import Button from './Button';

const BadgeUnlockModal = ({ badge, onClose }) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Ensure modal appears with delay for better UX
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!badge) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      style={{ pointerEvents: 'auto' }} // Ensure clicks register
      onClick={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl p-6 transform transition-all duration-500 ease-out ${
          animationComplete ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={{ maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
              {badge.icon ? (
                <span className="text-5xl">{badge.icon}</span>
              ) : (
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              )}
            </div>
          </div>
          
          <div className={`transition-all duration-500 delay-300 ${
            animationComplete ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
          }`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Badge Unlocked!
            </h2>
            <div className="text-xl font-semibold text-primary-600 mb-2">
              {badge.name}
            </div>
            <p className="text-gray-600 mb-6">
              {badge.description}
            </p>
            
            <div className="flex justify-center">
              <Button 
                variant="primary"
                onClick={onClose}
                className="px-6"
              >
                Awesome!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeUnlockModal;