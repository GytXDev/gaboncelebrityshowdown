// pages/api/payment.js

const PAYMENT_CLIENT_ID = "0d2ced90-5398-4f6f-a830-b72fe4caefd2";
const PAYMENT_CLIENT_SECRET = "85a8209452c1d5fbeefd6006b8d1105608bf0d61ba7d8d86c211811b752422d0";
const PAYMENT_WALLET = "661766093fbb7a1bd42da1b5";
const PAYMENT_PORTFOLIO = "661766093fbb7a1bd42da1b5";
const PAYMENT_DISBURSEMENT = "6617ce313fbb7a80ac2da1ff";
const PAYMENT_GATEWAY_URL = "https://gateway.singpay.ga/v1/74/paiement";
const PAYMENT_STATUS_URL = "https://gateway.singpay.ga/v1/transaction/api/status/";

const MessageType = {
    InvalidPinLength: "Invalid PIN length",
    InsufficientBalance: "Solde insuffisant",
    IncorrectPin: "Incorrect PIN",
    SuccessfulTransaction: "Transaction effectuée avec succès",
    CancelledTransaction: "Transaction annulée avec succès",
    UnableToGetTransactionStatus: "Impossible d'obtenir le statut de la transaction après plusieurs tentatives",
    UnknownError: "Erreur inconnue",
};

/**
 * Génère une chaîne alphanumérique aléatoire.
 * @param {number} length - La longueur de la chaîne générée.
 * @returns {string} La chaîne alphanumérique générée.
 */
function generateRandomString(length = 6) {
    const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Mappe un message de statut reçu de l'API de paiement à un type défini.
 * @param {string} message - Le message de statut reçu.
 * @returns {string} Le type de message mappé.
 */
function mapStatusMessage(message) {
    const lowerMessage = message.toLowerCase();
    console.log("Mapping status message:", lowerMessage); // Log pour débogage
    if (lowerMessage.includes("invalid pin length")) {
        return MessageType.InvalidPinLength;
    } else if (lowerMessage.includes("solde insuffisant")) {
        return MessageType.InsufficientBalance;
    } else if (lowerMessage.includes("incorrect pin")) {
        return MessageType.IncorrectPin;
    } else if (
        lowerMessage.includes("transaction a ete effectue avec succes") ||
        lowerMessage.includes("your transaction has been successfully processed")
    ) {
        return MessageType.SuccessfulTransaction;
    } else if (lowerMessage.includes("transaction a ete annulee avec succes")) {
        return MessageType.CancelledTransaction;
    } else if (lowerMessage.includes("impossible d'obtenir le statut de la transaction")) {
        return MessageType.UnableToGetTransactionStatus;
    } else {
        return MessageType.UnknownError;
    }
}

/**
 * Vérifie le statut de la transaction avec un maximum de tentatives.
 * @param {string} transactionId - L'ID de la transaction.
 * @param {object} headers - Les en-têtes à utiliser pour la requête.
 * @returns {Promise<string>} Le message de statut final.
 */
async function checkTransactionStatus(transactionId, headers) {
    const statusUrl = `${PAYMENT_STATUS_URL}${transactionId}`;
    const maxAttempts = 5;
    const delay = 2000; // 2 secondes

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            console.log(`Tentative ${attempt + 1} de vérification du statut pour la transaction: ${transactionId}`);
            const statusResponse = await fetch(statusUrl, {
                method: "GET",
                headers: headers,
            });

            if (!statusResponse.ok) {
                const errorText = await statusResponse.text();
                console.log(`Erreur lors de la vérification du statut: ${errorText}`);
                return `Erreur lors de la vérification du statut : ${errorText}`;
            }

            const statusResult = await statusResponse.json();
            if (statusResult.status && statusResult.status.message) {
                const message = statusResult.status.message;
                console.log(`Message de statut reçu: ${message}`);
                if (isFinalStatus(message)) {
                    console.log(`Statut final atteint: ${message}`);
                    return message;
                }
            }

            // Attendre avant la prochaine tentative
            console.log(`Attente de ${delay / 1000} secondes avant la prochaine tentative`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
            console.log(`Erreur lors de la tentative ${attempt + 1}:`, error);
            return "Erreur lors de la vérification du statut.";
        }
    }

    console.log("Impossible d'obtenir le statut de la transaction après plusieurs tentatives.");
    return "Impossible d'obtenir le statut de la transaction après plusieurs tentatives.";
}

/**
 * Détermine si le statut est final.
 * @param {string} message - Le message de statut.
 * @returns {boolean} Vrai si le statut est final, sinon faux.
 */
function isFinalStatus(message) {
    const finalStatuses = [
        "transaction has been successfully processed",
        "transaction a été effectuée avec succès",
        "votre transaction a été traitée avec succès",
        "transaction a été annulée avec succès",
        "solde insuffisant", // Ajouté
        "incorrect pin",     // Ajouté
    ];
    const lowerCaseMessage = message.toLowerCase();
    const isFinal = finalStatuses.some((status) => lowerCaseMessage.includes(status.toLowerCase()));
    return isFinal;
}

/**
 * Gestionnaire de la route API de paiement.
 * @param {object} req - La requête HTTP.
 * @param {object} res - La réponse HTTP.
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        console.log("Méthode non autorisée:", req.method);
        return res.status(405).json({ status_message: "Méthode non autorisée." });
    }

    try {
        const { phoneNumber, amount } = req.body;


        if (!phoneNumber || !amount) {
            console.log("Paramètres manquants");
            return res.status(400).json({ status_message: "Paramètres manquants." });
        }

        const reference = generateRandomString(6);
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


        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 40000); // 10 secondes

        let paymentResponse;
        try {
            paymentResponse = await fetch(PAYMENT_GATEWAY_URL, {
                method: "POST",
                headers,
                body: JSON.stringify(paymentData),
                signal: controller.signal,
            });
            clearTimeout(timeout);
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("La requête a expiré");
                return res.status(504).json({ status_message: "Délai d'attente de la requête dépassé." });
            }
            console.log("Erreur lors de la requête de paiement:", error);
            return res.status(500).json({ status_message: "Erreur lors de la requête de paiement." });
        }


        if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.log("Erreur lors du paiement:", errorText);
            return res.status(paymentResponse.status).json({ status_message: mapStatusMessage(errorText) });
        }

        const paymentResult = await paymentResponse.json();

        if (!paymentResult.transaction || !paymentResult.transaction.id) {
            console.log("Réponse de paiement invalide");
            return res.status(500).json({ status_message: "Réponse de paiement invalide." });
        }

        const transactionId = paymentResult.transaction.id;

        const statusMessage = await checkTransactionStatus(transactionId, headers);

        return res.status(200).json({
            status_message: mapStatusMessage(statusMessage),
        });
    } catch (error) {
        console.log("Erreur dans l'API de paiement :", error);
        return res.status(500).json({ status_message: "Une erreur est survenue." });
    }
}
