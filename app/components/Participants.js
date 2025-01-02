// app/components/Participants.js

'use client';

import { useEffect, useState } from 'react';
import ParticipantCard from './ParticipantCard';
import styles from './Participants.module.css';
import { motion } from 'framer-motion';
import { db } from '../../lib/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import participantsData from '../../lib/participantsData';

export default function Participants({ countdownEnded }) {
  const [votesData, setVotesData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Écouter les mises à jour en temps réel de la collection 'votes'
    const unsubscribe = onSnapshot(collection(db, 'votes'), (snapshot) => {
      const votes = {};
      snapshot.forEach((doc) => {
        votes[doc.id] = doc.data().votes;
      });
      setVotesData(votes);
    });

    return () => unsubscribe();
  }, []);

  // Fusionner les données des participants avec les votes
  const participants = participantsData.map((participant) => ({
    ...participant,
    votes: votesData[participant.id.toString()] || 0,
  }));

  // Filtrer en fonction du terme de recherche
  const filteredParticipants = participants.filter((participant) =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trier les participants par nombre de votes décroissant
  const sortedParticipants = filteredParticipants.sort((a, b) => b.votes - a.votes);

  // Si le chrono est terminé, ne garder que les trois premiers
  const displayedParticipants = countdownEnded ? sortedParticipants.slice(0, 3) : sortedParticipants;

  return (
    <motion.div
      className={styles.participantsContainer}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
    >
      {!countdownEnded && (
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      )}

      <div className={styles.participants}>
        {displayedParticipants.map((participant, index) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            votes={participant.votes}
            rank={countdownEnded ? index + 1 : null}
            countdownEnded={countdownEnded}
          />
        ))}
      </div>
    </motion.div>
  );
}
