export const REDIS_CACHE_KEY = {
    milliseconds: 600000,
    USER: {
        GET_USER_BY_EMAIL_AND_USERNAME: "get_user_by_email_and_username",
        ADD_USER_ACCESS_REFRESH_TOKEN: "add_user_access_refresh_token",
        FETCH_USER_PROFILE_DB_CACHE_KEY_PREFIX: "fetch_user_profile_db_cache",
        GET_USER_PROFILE_DB_CACHE_KEY_PREFIX: "get_user_profile_db_cache",
        ADD_CONSUMER_PROFILE_KEY_PREFIX: "user_profile",
        WEB_SOCKET_CLIENT_KEY_PREFIX: "web_socket_client",
    }
}
