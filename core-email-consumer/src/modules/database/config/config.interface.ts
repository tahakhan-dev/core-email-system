/**
 * Configuration for the database connection.
 */
export interface ConfigDBData {
    type: any;
    user: string;
    pass: string;
    name: string;
    host: string;
    port: number;
    poolSize: number;
    synchronize: boolean,
    autoLoadEntities?: boolean,
    dialect?: string;
    charset?: string;
    collate?: string;
}

/**
 * Configuration data for the app.
 */
export interface ConfigData {
    env: string;

    /** The port number of the http server to listen on. */
    port?: number;

    /** Database connection details. */
    db?: ConfigDBData;

    /**
     * The log level to use.
     * @example 'verbose', 'info', 'warn', 'error'
     */
    logLevel: string;
}
