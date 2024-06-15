
export interface ErrorResponse {
    statusCode: number;
    message: string[] | string;
    error: string;
}

export interface EncryptJWTToken {
    error: boolean;
    encryptToken: string,
    errorMessage?: string,
    statusCode?: number
}

export interface EncryptApiResponse {
    data: {
        encryptedData: string,
        error?: string
    }
}

export interface InterServiceAxiosResponse {
    error: boolean,
    result?: any,
    message?: string
}