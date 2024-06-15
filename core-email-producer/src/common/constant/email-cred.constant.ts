import 'dotenv/config';

export const EMAIL_ENVIRONMENT = {
    MSAUTH: {
        CLIENT_ID: process?.env?.CLIENT_ID,
        OBJECT_ID: process?.env?.OBJECT_ID,
        TENANT_ID: process?.env?.TENANT_ID,
        CLIENT_SECRET: process?.env?.CLIENT_SECRET,
        AUTHORIZATION_URL: process?.env?.AUTHORIZATION_URL,
        REDIRECT_URI: process?.env?.REDIRECT_URI,
        TOKEN_URL: process?.env?.TOKEN_URL,
        CALLBACK_URL: process?.env?.CALLBACK_URL,
        SCOPE: process?.env?.SCOPE,
        FETCH_EMAIL_API_URL: process?.env?.FETCH_EMAIL_API_URL
    }
};