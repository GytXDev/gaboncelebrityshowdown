// app/components/Modal.js
'use client';

import { useState } from 'react';
import styles from './Modal.module.css';
import { motion } from 'framer-motion';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import axios from "axios";

/**
 * Composant Modal pour traiter les paiements et les votes.
 * @param {object} props - Les propriétés du composant.
 * @param {object} props.participant - Les informations sur le participant.
 * @param {function} props.onClose - Fonction à appeler pour fermer le modal.
 * @param {function} props.onVote - Fonction à appeler pour valider le vote.
 */
export default function Modal({ participant, onClose, onVote }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(100); // Montant par défaut minimum
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  /**
   * Ferme le Snackbar.
   */
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * Envoie une requête de paiement à l'API backend.
   * @param {string} phoneNumber - Le numéro de téléphone.
   * @param {number} amount - Le montant à payer.
   * @returns {Promise<object>} Les données de réponse de l'API.
   */
  const processPayment = async (phoneNumber, amount) => {
    try {
      const response = await axios.post("/api/payment", { phoneNumber, amount });
      console.log("API response:", response.data); // Log pour débogage
      return response.data;
    } catch (error) {
      // Récupère le message d'erreur de l'API ou un message générique
      const errorMessage = error.response?.data?.status_message || "Erreur inconnue.";
      console.log("API error:", errorMessage); // Log pour débogage
      throw errorMessage;
    }
  };

  /**
   * Mappe le type de message à un message utilisateur et une sévérité.
   * @param {string} type - Le type de message.
   * @returns {object} L'objet contenant le message et la sévérité.
   */
  const mapResponseMessage = (type) => {
    switch (type) {
      case "Invalid PIN length":
        return { message: "Le PIN fourni est invalide.", severity: "error" };
      case "Solde insuffisant":
        return { message: "Solde insuffisant pour la transaction.", severity: "error" };
      case "Incorrect PIN":
        return { message: "Le PIN est incorrect.", severity: "error" };
      case "Transaction effectuée avec succès":
        return { message: "Paiement réussi ! Votre vote est validé.", severity: "success" };
      case "Transaction annulée avec succès":
        return { message: "Transaction annulée.", severity: "info" };
      case "Impossible d'obtenir le statut de la transaction après plusieurs tentatives":
        return { message: "Impossible de vérifier le statut. Veuillez réessayer plus tard.", severity: "error" };
      default:
        return { message: "Une erreur est survenue.", severity: "error" };
    }
  };

  /**
   * Gère la soumission du formulaire de paiement.
   * @param {object} e - L'événement de soumission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (amount < 100) {
      setSnackbar({
        open: true,
        message: "Le montant minimum est de 100 CFA.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentResponse = await processPayment(phoneNumber, amount);
      const userMessage = mapResponseMessage(paymentResponse.status_message);
      console.log("Mapped user message:", userMessage); // Log pour débogage

      setSnackbar({
        open: true,
        message: userMessage.message,
        severity: userMessage.severity,
      });

      if (userMessage.severity === "success") {
        await onVote(phoneNumber, amount);
        setPhoneNumber('');
        setAmount(100);
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors du paiement :", error); // Log pour débogage
      setSnackbar({
        open: true,
        message: `Erreur : ${error}`,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modalContent}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button className={styles.closeBtn} onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
          <h2>Voter pour {participant.name}</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="phone">Numéro Airtel Money :</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Ex: 077000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={isSubmitting}
            />

            <label htmlFor="amount">Montant (CFA) :</label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="100"
              placeholder="100 CFA minimum"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              disabled={isSubmitting}
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'En cours...' : `Confirmer ${Math.floor(amount / 100)} Vote${Math.floor(amount / 100) > 1 ? 's' : ''}`}
            </button>
          </form>
        </motion.div>
      </motion.div>

      {/* Snackbar pour afficher les messages */}
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
