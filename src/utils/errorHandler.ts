export const ErrorType = {
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

export interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  public type: ErrorType;
  public status: number;
  public errors?: Record<string, string[]>;
  public timestamp?: string;
  public path?: string;

  constructor(
    message: string,
    type: ErrorType,
    status: number = 500,
    errors?: Record<string, string[]>,
    timestamp?: string,
    path?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.status = status;
    this.errors = errors;
    this.timestamp = timestamp;
    this.path = path;
  }
}

const getStatusSpecificMessage = (
  status: number,
  defaultMessage?: string
): string => {
  const statusMessages: Record<number, string> = {
    100: "Continue - The server has received the request headers",
    101: "Switching Protocols - The server is switching protocols",
    200: "OK - Request successful",
    201: "Created - Resource created successfully",
    202: "Accepted - Request accepted for processing",
    204: "No Content - Request successful but no content returned",
    300: "Multiple Choices - Multiple options available",
    301: "Moved Permanently - Resource has been moved",
    302: "Found - Resource temporarily moved",
    304: "Not Modified - Resource not modified",
    400: "Bad Request - Invalid request format or parameters",
    401: "Unauthorized - Authentication required or failed",
    402: "Payment Required - Payment required for access",
    403: "Forbidden - Access denied, insufficient permissions",
    404: "Not Found - Requested resource not found",
    405: "Method Not Allowed - HTTP method not allowed for this resource",
    406: "Not Acceptable - Request format not acceptable",
    407: "Proxy Authentication Required - Proxy authentication needed",
    408: "Request Timeout - Request took too long to process",
    409: "Conflict - Request conflicts with current state",
    410: "Gone - Resource no longer available",
    411: "Length Required - Content-Length header required",
    412: "Precondition Failed - Precondition in request failed",
    413: "Payload Too Large - Request payload too large",
    414: "URI Too Long - Request URI too long",
    415: "Unsupported Media Type - Media type not supported",
    416: "Range Not Satisfiable - Requested range not available",
    417: "Expectation Failed - Expectation in request failed",
    418: "I'm a teapot - Server refuses to brew coffee",
    422: "Unprocessable Entity - Request well-formed but contains semantic errors",
    423: "Locked - Resource is locked",
    424: "Failed Dependency - Request failed due to dependency failure",
    425: "Too Early - Request sent too early",
    426: "Upgrade Required - Protocol upgrade required",
    428: "Precondition Required - Precondition required",
    429: "Too Many Requests - Rate limit exceeded",
    431: "Request Header Fields Too Large - Request headers too large",
    451: "Unavailable For Legal Reasons - Resource unavailable for legal reasons",
    500: "Internal Server Error - Server encountered an unexpected condition",
    501: "Not Implemented - Server does not support the functionality",
    502: "Bad Gateway - Server acting as gateway received invalid response",
    503: "Service Unavailable - Server temporarily unavailable",
    504: "Gateway Timeout - Gateway did not receive timely response",
    505: "HTTP Version Not Supported - HTTP version not supported",
    506: "Variant Also Negotiates - Server has internal configuration error",
    507: "Insufficient Storage - Server cannot store representation",
    508: "Loop Detected - Server detected infinite loop",
    510: "Not Extended - Further extensions required",
    511: "Network Authentication Required - Network authentication required",
  };

  return statusMessages[status] || defaultMessage || `HTTP ${status} Error`;
};

export const handleApiError = (error: unknown): ApiError => {
  if (
    error &&
    typeof error === "object" &&
    "isAxiosError" in error &&
    error.isAxiosError
  ) {
    const axiosError = error as any;
    const { response, request, code, message } = axiosError;

    if (response) {
      const { status, data } = response;
      const errorData = data as ApiErrorResponse;

      switch (status) {
        case 400:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(400),
            ErrorType.VALIDATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 401:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(401),
            ErrorType.AUTHENTICATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 402:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(402),
            ErrorType.AUTHORIZATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 403:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(403),
            ErrorType.AUTHORIZATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 404:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(404),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 405:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(405),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 408:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(408),
            ErrorType.TIMEOUT_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 409:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(409),
            ErrorType.VALIDATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 410:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(410),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 413:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(413),
            ErrorType.VALIDATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 415:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(415),
            ErrorType.VALIDATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 422:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(422),
            ErrorType.VALIDATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 423:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(423),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 424:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(424),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 425:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(425),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 428:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(428),
            ErrorType.VALIDATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 429:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(429),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 431:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(431),
            ErrorType.VALIDATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 451:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(451),
            ErrorType.AUTHORIZATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 500:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(500),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 501:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(501),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 502:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(502),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 503:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(503),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 504:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(504),
            ErrorType.TIMEOUT_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 505:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(505),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 507:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(507),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 508:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(508),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 510:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(510),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        case 511:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(511),
            ErrorType.AUTHENTICATION_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
        default:
          return new ApiError(
            errorData.message || getStatusSpecificMessage(status),
            ErrorType.SERVER_ERROR,
            status,
            errorData.errors,
            errorData.timestamp,
            errorData.path
          );
      }
    }

    if (request) {
      if (code === "ECONNABORTED") {
        return new ApiError(
          "Request timeout. Please check your connection and try again.",
          ErrorType.TIMEOUT_ERROR,
          408
        );
      }
      return new ApiError(
        "Network error. Please check your internet connection.",
        ErrorType.NETWORK_ERROR,
        0
      );
    }

    return new ApiError(
      message || "Request failed",
      ErrorType.UNKNOWN_ERROR,
      0
    );
  }

  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, ErrorType.UNKNOWN_ERROR, 0);
  }

  return new ApiError(
    "An unexpected error occurred",
    ErrorType.UNKNOWN_ERROR,
    0
  );
};

export const getErrorMessage = (error: ApiError): string => {
  const getUserFriendlyMessage = (status: number): string => {
    const userMessages: Record<number, string> = {
      400: "Please check your input and try again. The request format is invalid.",
      401: "Authentication failed. Please check your credentials and try again.",
      402: "Payment required. Please contact support for assistance.",
      403: "Access denied. You do not have permission to perform this action.",
      404: "The requested resource was not found. Please check the URL or contact support.",
      405: "This action is not allowed. Please try a different method.",
      408: "Request timeout. Please try again or check your connection.",
      409: "Conflict detected. The resource may have been modified by another user.",
      410: "The requested resource is no longer available.",
      413: "The data you're trying to send is too large. Please reduce the size and try again.",
      415: "Unsupported file type. Please use a supported format.",
      422: "Validation failed. Please check your input and try again.",
      423: "The resource is currently locked. Please try again later.",
      424: "Request failed due to a dependency issue. Please try again.",
      425: "Request sent too early. Please wait a moment and try again.",
      428: "A precondition is required. Please try again.",
      429: "Too many requests. Please wait a moment before trying again.",
      431: "Request headers are too large. Please try again.",
      451: "This resource is unavailable due to legal restrictions.",
      500: "Internal server error. Please try again later or contact support.",
      501: "This feature is not implemented yet. Please contact support.",
      502: "Bad gateway. The server is temporarily unavailable.",
      503: "Service temporarily unavailable. Please try again later.",
      504: "Gateway timeout. The server is taking too long to respond.",
      505: "HTTP version not supported. Please contact support.",
      507: "Insufficient storage on server. Please contact support.",
      508: "Server detected an infinite loop. Please contact support.",
      510: "Server configuration error. Please contact support.",
      511: "Network authentication required. Please contact your administrator.",
    };

    return (
      userMessages[status] || "An unexpected error occurred. Please try again."
    );
  };

  const statusMessage = getUserFriendlyMessage(error.status);

  if (statusMessage !== "An unexpected error occurred. Please try again.") {
    return statusMessage;
  }

  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return "Unable to connect to the server. Please check your internet connection and try again.";
    case ErrorType.TIMEOUT_ERROR:
      return "The request is taking too long. Please try again.";
    case ErrorType.AUTHENTICATION_ERROR:
      return "Your session has expired. Please log in again.";
    case ErrorType.AUTHORIZATION_ERROR:
      return "You do not have permission to perform this action.";
    case ErrorType.VALIDATION_ERROR:
      return error.message || "Please check your input and try again.";
    case ErrorType.SERVER_ERROR:
      return error.status >= 500
        ? "Server error. Please try again later or contact support if the problem persists."
        : error.message || "An error occurred while processing your request.";
    default:
      return error.message || "An unexpected error occurred. Please try again.";
  }
};

export const isRetryableError = (error: ApiError): boolean => {
  return (
    error.type === ErrorType.NETWORK_ERROR ||
    error.type === ErrorType.TIMEOUT_ERROR ||
    (error.type === ErrorType.SERVER_ERROR && error.status >= 500)
  );
};

export const formatValidationErrors = (
  errors: Record<string, string[]>
): string[] => {
  const formattedErrors: string[] = [];

  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach((message) => {
      formattedErrors.push(`${field}: ${message}`);
    });
  });

  return formattedErrors;
};

export const getErrorDetails = (error: ApiError) => {
  return {
    status: error.status,
    type: error.type,
    message: error.message,
    userMessage: getErrorMessage(error),
    timestamp: error.timestamp,
    path: error.path,
    errors: error.errors,
    isRetryable: isRetryableError(error),
  };
};

export const getStatusCodeCategory = (status: number): string => {
  if (status >= 100 && status < 200) return "Informational";
  if (status >= 200 && status < 300) return "Success";
  if (status >= 300 && status < 400) return "Redirection";
  if (status >= 400 && status < 500) return "Client Error";
  if (status >= 500 && status < 600) return "Server Error";
  return "Unknown";
};
