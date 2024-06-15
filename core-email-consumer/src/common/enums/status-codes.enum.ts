export enum StatusCodes {

    //-----  2xx (Successful):

    SUCCESS = 200,                          // The request has succeeded. The information returned with the response is dependent on the method used in the request
    CREATED = 201,                          // The request has been fulfilled, and a new resource has been created. The new resource is returned in the response.
    ACCEPTED = 202,                         // The request has been accepted for processing, but the processing has not been completed.
    NON_AUTHORITATIVE_INFORMATION = 203,    // The server successfully processed the request but is returning information that may be from another source
    NON_CONTENT = 204,                      // The server has successfully fulfilled the request, but there is no additional content to send in the response payload body
    RESET_CONTENT = 205,                    // The server has fulfilled the request, and the user agent should reset the document view which caused the request to be sent
    PARTIAL_CONTENT = 206,                  // The server has fulfilled the partial GET request for the resource
    MULTI_STATUS = 207,                     // The response body contains an XML message that follows the WebDAV protocol
    ALREADY_REPORTED = 208,                 // The members of a DAV binding have already been enumerated in a preceding part of the (multistatus) response, and are not being included again
    IM_USED = 226,                          // The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance

    //---------- 3xx (Redirection):

    MULTIPLE_CHOICES = 300,                 // The requested resource corresponds to any one of a set of representations, each with its own specific location
    MOVED_PERMANENTLY = 301,                // The requested resource has been assigned a new permanent URI and any future references to this resource should use one of the returned URIs.
    FOUND = 302,                            // The requested resource resides temporarily under a different URI.
    SEE_OTHER = 303,                        // The response to the request can be found under a different URI.
    NOT_MODIFIED = 304,                     // The requested resource has not been modified since the last time the client accessed it.
    USE_PROXY = 305,                        // The requested resource must be accessed through the proxy given by the Location field
    TEMPORARY_REDIRECT = 307,               // The requested resource resides temporarily under a different URI
    PERMANENT_REDIRECT = 308,               // The requested resource has been assigned a new permanent URI and any future references to this resource should use one of the returned URIs.

    //------------ 4xx (Client Error):

    BAD_REQUEST = 400,                      // The server could not understand the request due to invalid syntax.
    UNAUTHORIZED = 401,                     // The client must authenticate itself to get the requested response.
    PAYMENT_REQUIRED = 402,                 // This status code is not currently used, but it is reserved for future use.
    FORBIDDEN = 403,                        // The client does not have access rights to the content, i.e., they are unauthorized, so the server is refusing to give the requested response.
    NOT_FOUND = 404,                        // The server can not find the requested resource.
    METHOD_NOT_ALLOWED = 405,               // The method specified in the request is not allowed for the resource identified by the request URI.
    NOT_ACCEPTABLE = 406,                   // The requested resource is only capable of generating content not acceptable according to the Accept headers sent in the request.
    PROXY_AUTHENTICATION_REQUIRED = 407,    // The client must first authenticate itself with the proxy.
    REQUEST_TIMEOUT = 408,                  // The server timed out waiting for the request.
    CONFLICT = 409,                         // The request could not be completed due to a conflict with the current state of the resource.
    GONE = 410,                             // This status code indicates that the resource requested is no longer available and there is no forwarding address. It is considered a client error.
    LENGTH_REQUIRED = 411,                  // This status code indicates that the server refuses to accept the request without a valid Content-Length header field.
    PRECONDITION_FAILED = 412,              // This status code indicates that one or more conditions in the request header fields evaluated to false when tested on the server.
    PAYLOAD_TOO_LARGE = 413,                // This status code indicates that the request entity is larger than the server is willing or able to process.
    URI_TOO_LONG = 414,                     // This status code indicates that the URI provided in the request is too long for the server to process.
    UNSUPPORTED_MEDIA_TYPE = 415,           // This status code indicates that the server cannot handle the media type provided in the request.
    RANGE_NOT_SATISFIABLE = 416,            // This status code indicates that the requested range cannot be served because it is outside the bounds of the resource's data.
    EXPECTATION_FAILED = 417,               // This status code indicates that the expectation given in the request's Expect header field could not be met by at least one of the inbound servers.
    MISDIRECTED_REQUEST = 421,              // This status code indicates that the server is not able to produce a response to the request that can be served by the origin server.
    UNPROCESSABLE_ENTITY = 422,             // This status code indicates that the server understands the content type of the request entity, and the syntax of the request entity is correct but was unable to process the contained instructions.
    LOCKED = 423,                           // This status code indicates that the source or destination resource of a method is locked.
    FAILED_DEPENDENCY = 424,                // This status code indicates that the method could not be performed on the resource because the requested action depended on another action and that action failed.
    TOO_EARLY = 425,                        // This status code indicates that the server is unwilling to risk processing a request that might be replayed.
    UPGRADE_REQUIRED = 426,                 // This status code indicates that the server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.
    PRECONDITION_REQUIRED = 428,            // This status code indicates that the server requires the request to be conditional.
    TOO_MANY_REQUESTS = 429,                // This status code indicates that the user has sent too many requests in a given amount of time.
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,  // This status code indicates that the server is unwilling to process the request because its header fields are too large.
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,    // This status code indicates that the server is denying access to the resource as a consequence of a legal demand.

    // --------------- 5xx (Server Error):

    INTERNAL_SERVER_ERROR = 500,            // This status code indicates that the server encountered an unexpected condition that prevented it from fulfilling the request.
    NOT_IMPLEMENTED = 501,                  // This status code indicates that the server does not support the functionality required to fulfill the request
    BAD_GATEWAY = 502,                      // This status code indicates that the server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request
    SERVICE_UNAVAILABLE = 503,              // This status code indicates that the server is currently unable to handle the request due to a temporary overload or maintenance of the server
    GATEWAY_TIMEOUT = 504,                  // This status code indicates that the server, while acting as a gateway or proxy, did not receive a timely response from an upstream server it needed to access to complete the request.
    HTTP_VERSION_NOT_SUPPORTED = 505,       // This status code indicates that the server does not support, or refuses to support, the protocol version that was used in the request
    VARIANT_ALSO_NEGOTIATES = 506,          // This status code is used when the server has an internal configuration error and the chosen variant resource is configured to engage in transparent content negotiation itself, but the server is not able to do so.
    INSUFFICIENT_STORAGE = 507,             // This status code is used when the server is unable to store the representation needed to complete the request. This could be due to the server running out of storage space or because the client has exceeded their storage quota.
    LOOP_DETECTED = 508,                    // This status code is used when the server detects an infinite loop while processing the request.
    NOT_EXTENDED = 510,                     // This status code is used when a client request requires a specific extension that is not supported by the server. This code is typically used when the server does not support the version of the HTTP protocol used in the request
    NETWORK_AUTHENTICATION_REQUIRED = 511   // This status code is used when a client needs to authenticate to gain network access. This code is typically used when an HTTP proxy requires authentication before it can forward the request.
}
