// server/config/aiServices.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TextAnalysisClient, AzureKeyCredential } = require("@azure/ai-language-text");
const { DocumentAnalysisClient, AzureKeyCredential: DocKeyCredential } = require("@azure/ai-form-recognizer");
const { BlobServiceClient } = require('@azure/storage-blob');
const logger = require('../utils/logger'); 
const dotenv = require('dotenv');

dotenv.config();

let modelPrimary; 
let modelBackup;
let languageClient;
let documentClient;
let blobServiceClient;

async function initializeAIServices() {
    logger.info("--- Initializing AI & Cloud Services ---");

    try {
        // 1. Google AI (Dual Brains)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // --- FIX: Removed 'generationConfig' because Gemma-3 does not support it ---
        // Primary: The Heavy Lifter
        modelPrimary = genAI.getGenerativeModel({ 
            model: "gemma-3-27b-it", // I recommend using this model for JSON support
            // If you MUST use "gemma-3-27b-it", change the string above, 
            // but keep the generationConfig REMOVED.
        });
        
        // Backup: The Efficient Runner
        modelBackup = genAI.getGenerativeModel({ 
            model: "gemma-3-12b-it" 
        });
        
        logger.info("✅ Google AI (Primary & Backup) Ready.");

        // 2. Azure AI Language
        if (process.env.AZURE_LANGUAGE_ENDPOINT && process.env.AZURE_LANGUAGE_KEY) {
            languageClient = new TextAnalysisClient(
                process.env.AZURE_LANGUAGE_ENDPOINT, 
                new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY)
            );
            logger.info("✅ Azure AI Language Ready.");
        } else {
            logger.warn("⚠️ Azure Language Credentials missing.");
        }

        // 3. Azure Document Intelligence
        if (process.env.AZURE_DOCUMENT_ENDPOINT && process.env.AZURE_DOCUMENT_KEY) {
            documentClient = new DocumentAnalysisClient(
                process.env.AZURE_DOCUMENT_ENDPOINT, 
                new DocKeyCredential(process.env.AZURE_DOCUMENT_KEY)
            );
            logger.info("✅ Azure Document Intelligence Ready.");
        } else {
            logger.warn("⚠️ Azure Document Intelligence Credentials missing.");
        }

        // 4. Azure Blob Storage
        if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
            blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
            logger.info("✅ Azure Blob Storage Ready.");
        } else {
            logger.warn("⚠️ Azure Storage Connection String missing.");
        }

    } catch (err) {
        logger.error("❌ Failed to initialize Services:", { error: err.message });
    }
}

// Export the initialized clients
module.exports = {
    initializeAIServices,
    getPrimaryModel: () => modelPrimary,
    getBackupModel: () => modelBackup,
    getLanguageClient: () => languageClient,
    getDocumentClient: () => documentClient,
    getBlobServiceClient: () => blobServiceClient
};