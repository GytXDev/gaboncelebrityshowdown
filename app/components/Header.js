// app/components/Header.js

'use client'; // Ajoutez cette ligne en haut

import { motion } from 'framer-motion';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Gabon Celebrity Showdown
      </motion.h2>
    </header>
  );
}
