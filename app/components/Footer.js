'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      className="bg-gray-800 text-white py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} GabonCelebrityShowdown. Tous droits réservés.
        </p>
        <p className="text-sm">
          Contactez-nous :{' '}
          <a
            href="mailto:contact@gaboncelebrityshowdown.com"
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            contact@gaboncelebrityshowdown.com
          </a>{' '}
          |{' '}
          <a
            href="mailto:support@gaboncelebrityshowdown.com"
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            support@gaboncelebrityshowdown.com
          </a>{' '}
          |{' '}
          <a
            href="mailto:inscripte@gaboncelebrityshowdown.com"
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            inscription@gaboncelebrityshowdown.com
          </a>
        </p>
        
        <p className="text-xs text-gray-400">
          Designed with ❤️ by GabonCelebrityShowdown
        </p>
      </div>
    </motion.footer>
  );
}
