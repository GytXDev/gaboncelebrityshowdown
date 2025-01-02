// pages/api/payment.js

// Constantes globales pour les paiements
const PAYMENT_CLIENT_ID = "0d2ced90-5398-4f6f-a830-b72fe4caefd2";
const PAYMENT_CLIENT_SECRET = "85a8209452c1d5fbeefd6006b8d1105608bf0d61ba7d8d86c211811b752422d0";
const PAYMENT_WALLET = "661766093fbb7a1bd42da1b5";
const PAYMENT_PORTFOLIO = "661766093fbb7a1bd42da1b5";
const PAYMENT_DISBURSEMENT = "6617ce313fbb7a80ac2da1ff";
const PAYMENT_GATEWAY_URL = "https://gateway.singpay.ga/v1/74/paiement";
const PAYMENT_STATUS_URL = "https://gateway.singpay.ga/v1/transaction/api/status/";

/**
 * Vérifie si le statut reçu est final.
 * @param {string} message - Message de statut.
 * @returns {boolean} True si le statut est final.
 */
function isFinalStatus(message) {
    const finalStatuses = [
        "transaction has been successfully processed",
        "transaction a été effectuée avec succès",
        "votre transaction a été traitée avec succès",
        "transaction a été annulée avec succès",
        "solde insuffisant",
        "incorrect pin",
        "the pin you have entered is incorrect", // Ajouté
        "terminate", // Ajouté
    ];
    const lowerCaseMessage = message.toLowerCase();
    return finalStatuses.some((status) => lowerCaseMessage.includes(status));
}

/**
 * Génère une chaîne alphanumérique aléatoire.
 * @param {number} length - Longueur de la chaîne.
 * @returns {string} Chaîne générée.
 */
function generateRandomString(length = 6) {
    console.log(`Génération d'une chaîne aléatoire de longueur ${length}`);
    const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log(`Chaîne générée : ${result}`);
    return result;
}

/**
 * Mappe un message de statut à un type prédéfini.
 * @param {string} message - Message de statut.
 * @returns {string} Type de message mappé.
 */
function mapStatusMessage(message) {
    console.log(`Mapping du message de statut : ${message}`);
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("invalid pin length")) {
        return "Invalid PIN length";
    } else if (lowerMessage.includes("solde insuffisant")) {
        return "Solde insuffisant";
    } else if (lowerMessage.includes("incorrect pin")) {
        return "Incorrect PIN";
    } else if (
        lowerMessage.includes("transaction a ete effectue avec succes") ||
        lowerMessage.includes("your transaction has been successfully processed")
    ) {
        return "Transaction effectuée avec succès";
    } else if (lowerMessage.includes("transaction a ete annulee avec succes")) {
        return "Transaction annulée avec succès";
    } else if (lowerMessage.includes("impossible d'obtenir le statut de la transaction")) {
        return "Impossible d'obtenir le statut de la transaction après plusieurs tentatives";
    } else {
        return "Erreur inconnue";
    }
}

/**
 * Vérifie le statut de la transaction via plusieurs tentatives.
 * @param {string} transactionId - ID de la transaction.
 * @param {object} headers - En-têtes pour la requête.
 * @returns {Promise<string>} Message de statut final.
 */
async function checkTransactionStatus(transactionId, headers) {
    console.log(`Début de la vérification du statut pour la transaction ${transactionId}`);
    const statusUrl = `${PAYMENT_STATUS_URL}${transactionId}`;
    const maxAttempts = 5;
    const delay = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            console.log(`Tentative ${attempt + 1} sur ${maxAttempts}`);
            const statusResponse = await fetch(statusUrl, { method: "GET", headers });
            if (!statusResponse.ok) {
                const errorText = await statusResponse.text();
                console.log(`Erreur lors de la vérification : ${errorText}`);
                return `Erreur : ${errorText}`;
            }

            const statusResult = await statusResponse.json();
            console.log(`Réponse du statut :`, statusResult);

            const message = statusResult.status?.message || "";
            const transaction = statusResult.transaction || {};

            // Vérification explicite pour "result" ou "status"
            if (transaction.result === "PasswordError" || transaction.status === "Terminate") {
                console.log(`Erreur critique détectée : ${transaction.result || transaction.status}`);
                return message || "Erreur critique détectée.";
            }

            // Si un message est reçu et qu'il est final
            if (isFinalStatus(message)) {
                console.log(`Statut final confirmé : ${message}`);
                return message;
            }

            console.log(`Attente avant nouvelle tentative...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
            console.log(`Erreur lors de la tentative ${attempt + 1} :`, error);
            return "Erreur lors de la vérification du statut.";
        }
    }

    console.log("Statut non confirmé après plusieurs tentatives.");
    return "Impossible d'obtenir le statut.";
}

/**
 * Gestionnaire de la route API.
 * @param {object} req - Requête HTTP.
 * @param {object} res - Réponse HTTP.
 */
export default async function handler(req, res) {
    console.log("Requête reçue :", req.method, req.body);

    if (req.method !== "POST") {
        console.log(`Méthode non autorisée : ${req.method}`);
        return res.status(405).json({ status_message: "Méthode non autorisée." });
    }

    try {
        const { phoneNumber, amount } = req.body;

        if (!phoneNumber || !amount) {
            console.log("Paramètres requis manquants !");
            return res.status(400).json({ status_message: "Paramètres manquants." });
        }

        const reference = generateRandomString();
        console.log(`Données de paiement préparées avec référence : ${reference}`);

        const paymentData = {
            amount,
            reference,
            client_msisdn: phoneNumber,
            portfolio: PAYMENT_PORTFOLIO,
            disbursement: PAYMENT_DISBURSEMENT,
            isTransfer: true,
        };

        const headers = {
            accept: "*/*",
            "x-client-id": PAYMENT_CLIENT_ID,
            "x-client-secret": PAYMENT_CLIENT_SECRET,
            "x-wallet": PAYMENT_WALLET,
            "Content-Type": "application/json",
        };

        console.log("Envoi des données de paiement à l'API...");
        const paymentResponse = await fetch(PAYMENT_GATEWAY_URL, { method: "POST", headers, body: JSON.stringify(paymentData) });

        if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.log("Erreur dans la réponse de paiement :", errorText);
            return res.status(paymentResponse.status).json({ status_message: mapStatusMessage(errorText) });
        }

        const paymentResult = await paymentResponse.json();
        console.log("Résultat du paiement :", paymentResult);

        if (!paymentResult.transaction || !paymentResult.transaction.id) {
            console.log("Transaction ID manquant dans la réponse.");
            return res.status(500).json({ status_message: "Transaction invalide." });
        }

        const transactionId = paymentResult.transaction.id;
        console.log(`Transaction ID obtenue : ${transactionId}`);
        const statusMessage = await checkTransactionStatus(transactionId, headers);

        console.log("Statut final de la transaction :", statusMessage);
        return res.status(200).json({ status_message: mapStatusMessage(statusMessage) });

    } catch (error) {
        console.log("Erreur dans le traitement de l'API :", error);
        return res.status(500).json({ status_message: "Erreur interne." });
    }
}
