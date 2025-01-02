// app/page.js
'use client';

import { useState } from 'react';
import Header from './components/Header';
import Countdown from './components/Countdown';
import Participants from './components/Participants';
import Footer from './components/Footer';
import Head from 'next/head';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function Home() {
  const [countdownEnded, setCountdownEnded] = useState(false);
  const { width, height } = useWindowSize();

  const handleCountdownEnd = () => {
    setCountdownEnded(true);
  };

  return (
    <>
      <Head>
        <title>Gabon Celebrity Showdown</title>
        <meta name="description" content="Célébrez les célébrités gabonaises et votez pour vos favorites!" />
      </Head>
      <Header />


      {!countdownEnded ? (
        <Countdown onCountdownEnd={handleCountdownEnd} />
      ) : (
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Félicitations aux Gabon Celebrity Showdown</h2>
          <h3 className="text-xl text-gray-800">Heureuse année 2025!</h3>
          <Confetti width={width} height={height} />
        </div>
      )}
      <Participants countdownEnded={countdownEnded} />
      {/* Section d'Introduction */}
      <section className="bg-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Classement</h2>
            <p className="text-gray-700 mb-2">Les votes détermineront le classement des célébrités :</p>
            <ul className="list-none text-gray-600 space-y-2">
              <li> 🏆 1er : GabonCelebrityShowdown de l&lsquo;année 2025</li>
              <li> 🥈 2ème : Médaille d&apos;argent</li>
              <li> 🥉 3ème : Médaille de bronze</li>
            </ul>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Annonce des Résultats</h2>
            <p className="text-gray-700">Les résultats seront révélés le 7 janvier 2025</p>
          </div>
        </div>
      </section>

      {/* Section Contexte */}
      <section className="bg-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Qu&apos;est-ce que Gabon Celebrity Showdown ?</h2>
            <p className="text-gray-700">
              Gabon Celebrity Showdown est une plateforme dédiée à la célébration des talents et figures publiques gabonaises. Votez pour vos célébrités préférées et vivez une expérience unique qui met en lumière celles qui inspirent notre nation. Les résultats seront annoncés lors d&apos;un événement festif, et à la fin, il n&apos;en restera que trois. Ce projet vise à renforcer l&apos;engagement du public et à valoriser la richesse culturelle du Gabon. Amusons Nous
            </p>
          </div>
          <div className="md:w-1/4 flex justify-center">
            <img
              src="/logo-website.svg"
              alt="Célébrités Gabonaises"
              className="rounded-lg shadow-lg max-w-xs h-auto"
            />
          </div>

        </div>
      </section>
      <Footer />
    </>
  );
}
