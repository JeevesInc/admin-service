export const DATE_FORMAT = 'YYYY-MM-DD';
export const MONTH_DATE_YEAR_FORMAT = 'MM-DD-YYYY';
export const SUCCESSCODE = {
  STANDARD: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NOCONTENT: 204,
};
export const SERVERERROR = {
  CODE: 500,
  MESSAGE: 'ERROR',
};

export const PAGE404 = {
  CODE: 404,
  MESSAGE: 'PAGE_NOT_FOUND',
};

export const PAGE422 = {
  CODE: 422,
  MESSAGE: 'UNPROCESSIBLE_ENTITY',
};

export const ERROR400 = 400;
export const ERROR402 = 402;
export const ERROR404 = 404;
export const ERROR418 = 418;
export const ERROR429 = 429; // API Rate-Limiting - too many requests

export const UNAUTHORISED = {
  CODE: 401,
  MESSAGE: 'NOT_AUTHORIZED',
};

export const FORBIDDENACCESS = {
  CODE: 403,
  MESSAGE: 'FORBIDDENACCESS',
};

export const NOTACCEPTABLE = {
  CODE: 406,
  MESSAGE: 'NOT_ACCEPTABLE',
};

export const SERVICE_UNAVAILABLE = {
  CODE: 503,
  MESSAGE: 'NOT_AVAILABLE',
};

export const SUGGESTIONTYPES = {
  CARDS: 'cards',
  TEAM: 'team',
  TRANSACTIONS: 'transactions',
  DASHBOARD: 'dashboard',
};

export const BILLINGADDRESS = {
  ADMIN_STRIPEUS:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction. It must be a US address.',
  EMPLOYEE_STRIPEUS:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  BOOKKEEPER_STRIPEUS:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  ADMIN_STRIPEUK:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction. It must be a UK address.',
  EMPLOYEE_STRIPEUK:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  BOOKKEEPER_STRIPEUK:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  ADMIN_STRIPEEUR:
    'This is the address used in card creation and should be provided when merchants request a billing address for a transaction. It must be a European address.',
  EMPLOYEE_STRIPEEUR:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  BOOKKEEPER_STRIPEEUR:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  ADMIN_GALILEO:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction. It must be a US address.',
  EMPLOYEE_GALILEO:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  BOOKKEEPER_GALILEO:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  ADMIN_TUTUKA:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction. It must be a Mexican address.',
  EMPLOYEE_TUTUKA:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  BOOKKEEPER_TUTUKA:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  ADMIN_TUTUKA_BRAZIL:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction. It must be a Brazilian address.',
  EMPLOYEE_TUTUKA_BRAZIL:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  BOOKKEEPER_TUTUKA_BRAZIL:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  ADMIN_TUTUKA_COLOMBIA:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction. It must be a Colombian address.',
  EMPLOYEE_TUTUKA_COLOMBIA:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
  BOOKKEEPER_TUTUKA_COLOMBIA:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
};

export const MAILINGADDRESS = {
  ADMIN: 'This is the address where we will deliver your physical card.',
  EMPLOYEE: 'This is the address where we will deliver your physical card.',
  BOOKKEEPER:
    'This is the address associated with cards on your account and should be provided when merchants request a billing address for a transaction.',
};

export const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  LOCAL: 'local',
  TEST: 'test',
};

export const DOCUSIGN_REGISTERED_EVENTS = {
  ENVELOP_SENT:
    'envelope-sent' /** This event is sent when the email notification, with a link to the envelope, is sent to at least one recipient or when it is a recipients turn to sign during embedded signing. The envelope remains in this state until all recipients have viewed the envelope */,
  ENVELOP_DELIVERED:
    'envelope-delivered' /** This event is sent when all recipients have opened the envelope through the DocuSign signing website. This does not signify an email delivery of an envelope */,
  ENVELOP_COMPLETED:
    'envelope-completed' /** The envelope has been completed by all the recipients. */,
  ENVELOP_DECLINED:
    'envelope-declined' /** The envelope has been declined by one of the recipients. */,
  ENVELOP_DELETED:
    'envelope-deleted' /** This event is sent after an already-sent envelope is deleted within the web application */,
  RECIPIENT_SENT:
    'recipient-sent' /** This event is sent when an email notification is sent to the recipient signifying that it is their turn to sign an envelope. */,
  RECIPIENT_DELIVERED:
    'recipient-delivered' /** Sent when the recipient has viewed the document(s) in an envelope through the DocuSign signing web site. This does not signify an email delivery of an envelope */,
  RECIPIENT_COMPLETED:
    'recipient-completed' /** Sent when the recipient has completed their actions for the envelope, typically (but not always) by signing. */,
  RECIPIENT_DECLINED:
    'recipient-declined' /** Sent when the recipient declines to sign the document(s) in the envelope. */,
  RECIPIENT_FINISH_LATER:
    'recipient-finish-later' /** Sent when the recipient has opted sign later to sign the document(s) in the envelope. */,
};

export const CLS_NAMESPACE_NAME = 'jeeves-context';
export const CLS_JEEVES_CONTEXT = {
  USER_EMAIL: 'userEmail',
  USER_EMAIL_ENCRYPTED: 'userEmailEncrypted',
  COMPANY_ID: 'companyId',
  USER_ID: 'userId',
};

export const MONTHS_MASTER = {
  SPANISH: {
    January: 'enero',
    February: 'febrero',
    March: 'marzo',
    April: 'abril',
    May: 'mayo',
    June: 'junio',
    July: 'julio',
    August: 'agosto',
    September: 'septiembre',
    October: 'octubre',
    November: 'noviembre',
    December: 'diciembre',
  },
};

export const EXECUTIVE_ROLES = Object.freeze({
  CEO: 'CEO',
  CFO: 'CFO',
  COO: 'COO',
  CTO: 'CTO',
  GENERAL_COUNSEL: 'GENERAL_COUNSEL',
  PRESIDENT: 'PRESIDENT',
  OTHER: 'OTHER',
});

export const API_METHODS = {
  POST: 'POST',
  PUT: 'PUT',
};

export const WLU_AUTH_KEY_NAME = 'wlu-auth-key';

/* Quebec state code and name are used for banning Quebec for Marqeta. */
export const QUEBEC_STATE_CODE = 'qc';
export const QUEBEC_STATE_NAME = 'quebec';

export const LOC_LATE_FEE_TRANSACTION_SHEET_COLUMN = {
  ORG_ID: 'org_id',
  LOCAL_CURRENCY_AMOUNT: 'local_currency_amount',
  PLATFORM_CURRENCY_AMOUNT: 'platform_currency_amount',
  DESCRIPTION: 'description',
  TRANSACTION_DATETIME: 'date',
  LOCAL_CURRENCY: 'local_currency',
};

export const TRANSACTION_MONITORING_TYPES = {
  HIGH_ACTIVITY_TRANSACTION: 'HIGH_ACTIVITY_TRANSACTION',
  LOW_ACTIVITY_TRANSACTION: 'LOW_ACTIVITY_TRANSACTION',
  COMPLETED_TRANSACTIONS: 'COMPLETED_TRANSACTIONS',
  TRANSACTION_AMOUNT_VERIFICATION: 'TRANSACTION_AMOUNT_VERIFICATION',
  IOF_AMOUNT_VERIFICATION: 'IOF_AMOUNT_VERIFICATION',
  BASE_AMOUNT_EXCHANGE_RATE_VERIFICATION: 'BASE_AMOUNT_EXCHANGE_RATE_VERIFICATION',
  EXCHANGE_RATE_AND_CURRENCY_VERIFICATION: 'EXCHANGE_RATE_AND_CURRENCY_VERIFICATION',
  TRANSACTION_VS_STATEMENT_AMOUNT_VERIFICATION: 'TRANSACTION_VS_STATEMENT_AMOUNT_VERIFICATION',
  STRIPE_EVENTS_VERIFICATION: 'STRIPE_EVENTS_VERIFICATION',
  LOG_STRIPE_TRANSACTION_AMOUNT_MISMATCH: 'LOG_STRIPE_TRANSACTION_AMOUNT_MISMATCH',
  LOG_MERCHANT_CLEAN_DETAILS_ISSUE: 'LOG_MERCHANT_CLEAN_DETAILS_ISSUE',
};

export default Object.freeze({
  // should be a TS type instead vanilla JS object
  ENVIRONMENT: {
    PRODUCTION: 'production',
  },
});
