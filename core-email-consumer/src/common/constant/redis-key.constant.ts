export const REDIS_CACHE_KEY = {
    milliseconds: 600000,
    EMAIL: {
        GET_USER_EMAIL_BY_ID: "get_user_email_id_",
        GET_WEB_SOCKET_EMAIL_CLIENT_KEY_PREFIX: "get_web_socket_email_client"
    },
    USER: {
        GET_USER_BY_EMAIL_AND_USERNAME: "get_user_by_email_and_username",
        ADD_USER_ACCESS_REFRESH_TOKEN: "add_user_access_refresh_token",
        ADD_CONSUMER_PROFILE_KEY_PREFIX: "user_profile",

    }
}
