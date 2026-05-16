import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiryTimestamp, onExpire, className = '' }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTimestamp) - +new Date();

    if (difference <= 0) {
      return {
        minutes: '00',
        seconds: '00',
        expired: true,
      };
    }

    return {
      minutes: Math.floor((difference / 1000 / 60) % 60)
        .toString()
        .padStart(2, '0'),
      seconds: Math.floor((difference / 1000) % 60)
        .toString()
        .padStart(2, '0'),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Si déjà expiré, déclencher le callback immédiatement
    if (timeLeft.expired) {
      onExpire && onExpire();
      return;
    }

    // Mettre à jour le timer chaque seconde
    const timer = setTimeout(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);

      if (updatedTimeLeft.expired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onExpire, expiryTimestamp]);

  return (
    <div className={className}>
      {timeLeft.minutes}:{timeLeft.seconds}
    </div>
  );
};

export default CountdownTimer;
