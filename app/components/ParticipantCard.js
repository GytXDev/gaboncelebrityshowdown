// app/components/ParticipantCard.js

'use client';

import { useState } from 'react';
import styles from './ParticipantCard.module.css';
import Modal from './Modal';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { db } from '../../lib/firebaseConfig';
import { doc, updateDoc, increment } from 'firebase/firestore';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { FaWhatsapp, FaInstagram, FaShareAlt } from 'react-icons/fa';

/**
 * Composant Carte du Participant.
 * @param {object} props 
 * @param {object} props.participant - Les informations sur le participant.
 * @param {number} props.votes - Le nombre de votes du participant.
 * @param {number} props.rank - Le rang du participant.
 * @param {boolean} props.countdownEnded - Indique si le compte à rebours est terminé.
 */
export default function ParticipantCard({ participant, votes, rank, countdownEnded }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  /**
   * Ferme le Snackbar.
   */
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * Gère l'enregistrement du vote dans Firestore.
   * @param {string} phoneNumber - Le numéro de téléphone de l'utilisateur.
   * @param {number} amount - Le montant du paiement.
   */
  const handleVote = async (phoneNumber, amount) => {
    setIsVoting(true);
    try {
      const participantDoc = doc(db, 'votes', participant.id.toString());
      const votesToAdd = Math.floor(amount / 100);

      await updateDoc(participantDoc, {
        votes: increment(votesToAdd),
      });

      setIsVoting(false);
      setIsModalOpen(false);
      setSnackbar({
        open: true,
        message: `Votre vote a été enregistré avec succès !`,
        severity: 'success',
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du vote: ", error);
      setIsVoting(false);
      setSnackbar({
        open: true,
        message: `Une erreur est survenue lors de votre vote. Veuillez réessayer.`,
        severity: 'error',
      });
    }
  };

  /**
   * Génère l'URL de partage du profil avec une ancre unique.
   * @returns {string} L'URL complète du profil avec l'ancre.
   */
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}#celebrityshowdown-${participant.id}`;
  };

  /**
   * Gère le partage via WhatsApp.
   */
  const shareWhatsApp = () => {
    const url = getShareUrl();
    const message = `Votez pour ${participant.name} lors des Gabon Celebrity Showdown 2025 ! Cliquez ici : ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  /**
   * Gère le partage via Instagram.
   * Comme Instagram ne supporte pas le partage direct de liens, on propose de copier le lien.
   */
  const shareInstagram = () => {
    const url = getShareUrl();
    const message = `Votez pour ${participant.name} lors des Gabon Celebrity Showdown 2025 ! Cliquez ici : ${url}`;
    navigator.clipboard.writeText(message)
      .then(() => {
        setSnackbar({
          open: true,
          message: `Lien et message copiés ! Vous pouvez les coller sur Instagram ou ailleurs.`,
          severity: 'info',
        });
      })
      .catch((err) => {
        console.error('Erreur lors de la copie du lien : ', err);
        setSnackbar({
          open: true,
          message: `Erreur lors de la copie. Veuillez essayer manuellement.`,
          severity: 'error',
        });
      });
  };


  // Définir les styles en fonction du rang
  let badgeClass = '';
  let rankLabel = '';
  if (countdownEnded && rank) {
    if (rank === 1) {
      badgeClass = styles.gold;
      rankLabel = 'GabonCelebrityShowdown de l\'année 2025';
    } else if (rank === 2) {
      badgeClass = styles.silver;
      rankLabel = 'Médaille d\'argent';
    } else if (rank === 3) {
      badgeClass = styles.bronze;
      rankLabel = 'Médaille de bronze';
    }
  }

  return (
    <>
      <motion.div
        id={`celebrityshowdown-${participant.id}`}
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {badgeClass && <div className={`${styles.badge} ${badgeClass}`}>{rankLabel}</div>}
        <div className={styles.imageWrapper}>
          <Image
            src={participant.image}
            alt={participant.name}
            layout="fill"
            objectFit="cover"
            className={styles.image}
          />
          {/* Overlay pour les boutons de partage */}
          <div className={styles.shareOverlay}>
            <FaShareAlt className={styles.shareIcon} />
            <div className={styles.shareButtons}>
              <FaWhatsapp className={styles.whatsapp} onClick={shareWhatsApp} title="Partager sur WhatsApp" />
              <FaInstagram className={styles.instagram} onClick={shareInstagram} title="Partager sur Instagram" />
            </div>
          </div>
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>
            {participant.name}
            <img
              src='/certificat.svg'
              alt="Certificat"
              style={{ width: '20px', height: '20px', marginLeft: '10px' }}
            />
          </h3>
          <p className={styles.votes}>
            {votes === 0 ? 'Aucun vote' : `${votes} Vote${votes > 1 ? 's' : ''}`}
          </p>
          {countdownEnded && rankLabel && <p className={styles.rankLabel}>{rankLabel}</p>}
          {!countdownEnded && (
            <button
              className={styles.voteButton}
              onClick={() => setIsModalOpen(true)}
              disabled={isVoting}
            >
              {isVoting ? 'En cours...' : 'Voter'}
            </button>
          )}
        </div>
      </motion.div>
      {isModalOpen && (
        <Modal
          participant={participant}
          onClose={() => setIsModalOpen(false)}
          onVote={handleVote}
        />
      )}
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
