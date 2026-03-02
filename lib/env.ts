// Environment variable validation utility

interface GoogleServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function validateGoogleCredentials(): GoogleServiceAccountKey {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set. " +
      "Please set it in your .env file with your Google service account credentials."
    );
  }

  try {
    const credentials = JSON.parse(key) as GoogleServiceAccountKey;

    const requiredFields = [
      'type', 'project_id', 'private_key', 'client_email'
    ];

    for (const field of requiredFields) {
      if (!credentials[field as keyof GoogleServiceAccountKey]) {
        throw new Error(
          `Google service account key is missing required field: ${field}`
        );
      }
    }

    return credentials;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON. " +
        "Please ensure the environment variable contains properly formatted JSON."
      );
    }
    throw error;
  }
}

function validateSpreadsheetId(): string {
  const id = process.env.SPREADSHEET_ID;

  if (!id) {
    throw new Error(
      "SPREADSHEET_ID environment variable is not set. " +
      "Please set it in your .env file with your Google Sheets spreadsheet ID."
    );
  }

  if (id.length < 20) {
    throw new Error(
      "SPREADSHEET_ID appears to be invalid. " +
      "It should be a long string from your Google Sheets URL."
    );
  }

  return id;
}

function validateSMTPConfig() {
  const required = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required SMTP environment variables: ${missing.join(", ")}. ` +
      "Please set them in your .env file for email functionality."
    );
  }

  const port = Number(required.SMTP_PORT);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(
      "SMTP_PORT must be a valid port number (1-65535). " +
      `Current value: ${required.SMTP_PORT}`
    );
  }

  return {
    host: required.SMTP_HOST!,
    port,
    user: required.SMTP_USER!,
    pass: required.SMTP_PASS!,
  };
}

// Validate all environment variables on module load (server-side only)
let googleCredentials: GoogleServiceAccountKey | null = null;
let spreadsheetId: string | null = null;
let smtpConfig: ReturnType<typeof validateSMTPConfig> | null = null;

export function getGoogleCredentials(): GoogleServiceAccountKey {
  if (!googleCredentials) {
    googleCredentials = validateGoogleCredentials();
  }
  return googleCredentials;
}

export function getSpreadsheetId(): string {
  if (!spreadsheetId) {
    spreadsheetId = validateSpreadsheetId();
  }
  return spreadsheetId;
}

export function getSMTPConfig() {
  if (!smtpConfig) {
    smtpConfig = validateSMTPConfig();
  }
  return smtpConfig;
}
