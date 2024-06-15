interface ErrorResponse {
    statusCode: number;
    message: string[] | string;
    error: string;
}

interface EncryptJWTToken {
    error: boolean;
    encryptToken: string,
    errorMessage?: string,
    statusCode?: number
}

interface EncryptApiResponse {
    data: {
        encryptedData: string,
        error?: string
    }

}