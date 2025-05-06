import { useState, useEffect } from 'react';

const PointsCounter = ({ value, previousValue = 0, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(previousValue);
  
  useEffect(() => {
    // If the value hasn't changed, don't animate
    if (value === previousValue) {
      setDisplayValue(value);
      return;
    }
    
    // Calculate step size for smooth animation
    const step = Math.max(1, Math.ceil((value - previousValue) / (duration / 16)));
    
    let currentValue = previousValue;
    const interval = setInterval(() => {
      currentValue += step;
      
      // Make sure we don't exceed the target value
      if ((step > 0 && currentValue >= value) || (step < 0 && currentValue <= value)) {
        clearInterval(interval);
        setDisplayValue(value);
      } else {
        setDisplayValue(currentValue);
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [value, previousValue, duration]);
  
  return <span>{displayValue}</span>;
};

export default PointsCounter; 