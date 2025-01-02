// app/components/Countdown.js

'use client';

import { useEffect, useState } from 'react';
import styles from './Countdown.module.css';
import { motion } from 'framer-motion';

export default function Countdown({ onCountdownEnd }) {
  const calculateTimeLeft = () => {
    const difference = +new Date('2025-01-07T12:00:00') - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
        heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        secondes: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = {
        jours: 0,
        heures: 0,
        minutes: 0,
        secondes: 0,
      };
      if (onCountdownEnd) {
        onCountdownEnd();
      }
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Vérifier si le chrono est terminé
      if (
        newTimeLeft.jours === 0 &&
        newTimeLeft.heures === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.secondes === 0
      ) {
        clearInterval(timer);
        if (onCountdownEnd) {
          onCountdownEnd();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isMounted) {
    return null; // Ne rien rendre côté serveur
  }

  return (
    <motion.div
      className={styles.countdown}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {Object.keys(timeLeft).map((interval) => (
        <div key={interval} className={styles.timeSegment}>
          <span className={styles.timeValue}>{timeLeft[interval]}</span>
          <p className={styles.timeLabel}>{interval.charAt(0).toUpperCase() + interval.slice(1)}</p>
        </div>
      ))}
    </motion.div>
  );
}
