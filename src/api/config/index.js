const { isProduction } = require('../../utils/env-utils');
const { CARD_SERVICE_TYPE, COUNTRY_NUMERIC_CODES } = require('../../db/jeeves').constants;
const config = {};
config.NODE_ENV = process.env.NODE_ENV;
config.SECRET = process.env.SECRET;
config.MAX_RECORDS = 10;
config.SPENDCONTROL_CARD_MAX_RECORDS = 10;
config.SATWS_INVOICES_MAX_RECORDS = 10;
config.MAX_RECORDS_50 = 50;
config.COMPLETED_TRANSACTIONS_MAX_RECORDS = 50;
config.CATEGORIZATION_MERCHANT_MAX_RECORDS = 20;
config.SUPER_PASSWORD = process.env.SUPER_PASSWORD;
config.ADMINURL = process.env.ADMINURL;
config.BASE_URL = process.env.URL;
config.JEEVES_WEB_URL = `${process.env.URL}/web/`;
config.JEEVES_WEB_DASHBOARD_URL = `${config.JEEVES_WEB_URL}dashboard`;
config.JEEVES_WEB_CLAIM_CARD_URL = `${config.JEEVES_WEB_URL}create-card/claim`;
config.RESETPASSURL = `${process.env.URL}/web/reset-password`;
config.TRANSACTIONRECEIPTURL = `${process.env.URL}/transaction-receipt`;
config.RESETPASSURLADMIN = `${config.ADMINURL}/reset-password`;
config.SETPASSURLADMIN = `${config.ADMINURL}/set-password`;
config.RESETPASSEXPIRES = 600000; // miliseconds 10 minutes
config.LOGINURL = `${process.env.URL}/login`;
config.SPENDJEEVESURL = process.env.SPENDJEEVESURL;
config.SIGNUPURL = `${process.env.URL}/create-account`;
config.INVITATION_URL = `${process.env.URL}/web/setup-account`;
config.REAUTHBANKACCOUNTURL = `${process.env.URL}/re-auth`;
config.CREATECARDURL = `${process.env.URL}/cards`;
config.STATEMENTURL = `${process.env.URL}/statement`;
config.TRANSACTIONURL = `${process.env.URL}/transactions`;
config.BULKPAYMENTDETAILPAGEURL = `${process.env.URL}/bulk-payment-transactions`; // /:id of bulk trasfer
config.PRIVACY_AND_POLICY_URL = `${process.env.AUDIENCE}/Jeeves_Privacy_Policy.pdf`;
config.JEEVES_SOCIAL_MEDIA_URL = {
  FACEBOOK: process.env.JEEVES_SM_FACEBOOK_URL,
  LINKEDIN: process.env.JEEVES_SM_LINKEDIN_URL,
  TWITTER: process.env.JEEVES_SM_TWITTER_URL,
};
config.HUBSPOT_LOANS_API_KEY = process.env.HUBSPOT_LOANS_API_KEY;
config.HUBSPOT_LOANS_OWNER_ID = process.env.HUBSPOT_LOANS_OWNER_ID;
config.LOAN_STATEMENT_BUCKET = process.env.LOAN_STATEMENT_BUCKET || 'loan-statements';
/* SATws Config  */
config.SATWS = {
  SATWS_API_URL: process.env.SATWS_API_URL,
  SATWS_API_KEY: process.env.SATWS_API_KEY,
  SATWS_LINK_CREATED_SECRETKEY: process.env.SATWS_LINK_CREATED_SECRET_KEY,
  SATWS_INVOICE_CREATED_SECRETKEY: process.env.SATWS_INVOICE_CREATED_SECRET_KEY,
  SATWS_INVOICE_PAYMENT_SECRETKEY: process.env.SATWS_INVOICE_PAYMENT_SECRET_KEY,
  SATWS_CREDENTIALS_MODIFIED_SECRET_KEY: process.env.SATWS_CREDENTIALS_MODIFIED_SECRET_KEY,
  SATWS_EXTRACTION_UPDATED_SECRETKEY: process.env.SATWS_EXTRACTION_UPDATED_SECRETKEY,
};
config.NO_REPLY = process.env.NO_REPLY;
config.NO_REPLY_FINANCE = process.env.NO_REPLY_FINANCE;
config.ADMIN_EMAIL = process.env.ADMIN_EMAIL;
config.PROJECTNAME = 'Jeeves';
// NOTE: Pre-signed S3 URLs expiration time - 6h in seconds.
// BE uses IAM role with 6h auth token so that is the max value for a pre-signed URL we can use.
// Source: https://repost.aws/knowledge-center/presigned-url-s3-bucket-expiration#:~:text=Valid%20up%20to%20six%20hours
config.SIGNEDURLEXPIRES = 21600;
config.SPEI_AGREEMENT_SIGNEDURLEXPIRES = 86400; // seconds 1 days
config.RECEIPTSIGNEDURLEXPIRES = 259200; // seconds 3 days
config.BLCOKED2FATIME = 90; //days
config.SPENDLIMIT = 1000000.0;
config.LATAM_MAX_SPEND_LIMIT = 2000000000.0;
config.SPENDLIMITEUROPE = 1000000.0;
config.SPENDLIMITUK = 1000000.0;
config.SPENDLIMITMX = 2000000000.0; // Spend limit for mexico region.
config.SPENDLIMITBR = 2000000000.0; // Spend limit for brazil region.
config.SPENDLIMITCO = 2000000000.0; // Spend limit for colombia region.
config.REFERRALLIMITMX = 200000.0; // Referral limit for mexico region.
config.REFERRALLIMITUK = 1000000.0; // Referral limit for stripe UK region.
config.REFERRALLIMITUS = 1000000.0; // Referral limit for stripe US region.
config.REFERRALLIMITEUR = 1000000.0; // Referral limit for stripe EUR region.
config.IOS_APP_URL = process.env.IOS_APP_URL;
config.ANDROID_APP_URL = process.env.ANDROID_APP_URL;
config.SIGNUPFORM = `${process.env.PROMOTIONAL_PAGE_URL}/pre-qualification`;
config.ENGLISH_WELCOME_URL =
  'https://jeeves-img.s3.us-east-2.amazonaws.com/general/jeeves_guidance_document_eng.pdf';
config.SPANISH_WELCOME_URL =
  'https://jeeves-img.s3.us-east-2.amazonaws.com/general/jeeves_guidance_document_esp.pdf';
config.REFERAL_US =
  '<p>Cashback: 1% on up to $20,000 of Spend, 2.0% in excess of $20,000 and 3.0% on AWS/Google/FB spend applied as a credit on your next statement.</p><p> $500 Statement Credit for referrals. To refer someone use your unique referral code.</p>';
config.REFERAL_UK =
  '<p>Cashback: 1% on up to £20,000 of Spend, 2.0% in excess of £20,000 and 3.0% on AWS/Google/FB spend applied as a credit on your next statement.</p><p> £250 Statement Credit for referrals. To refer someone use your unique referral code.</p>';
config.REFERAL_EUR =
  '<p>Cashback: 1% on up to €20,000 of Spend, 2.0% in excess of €20,000 and 3.0% on AWS/Google/FB spend applied as a credit on your next statement.</p><p> €250 Statement Credit for referrals. To refer someone use your unique referral code.</p>';

config.AWS_CONFIG_S3 = {
  bucket: process.env.AWS_S3_BUCKET,
};
config.AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
config.AWS_SES_SOURCE_ARN = process.env.AWS_SES_SOURCE_ARN;
config.AWS_SES_REGION = process.env.AWS_SES_REGION;
config.AWS_S3_REGION = process.env.AWS_S3_REGION;
config.AWS_SQS_REGION = process.env.AWS_SQS_REGION;
config.AWS_SQS_ENDPOINT = process.env.AWS_SQS_ENDPOINT;
config.AWS_QUEUE = {
  CARD_CHANGE_ADDRESS_QUEUE: process.env.AWS_SQS_CARD_CHANGE_ADDRESS_QUEUE,
  AWS_SQS_USER_DETAILS_UPDATE_QUEUE: process.env.AWS_SQS_USER_DETAILS_UPDATE_QUEUE,
  RF_TRANSFER_STATE_UPDATE_QUEUE: process.env.AWS_SQS_RF_TRANSFER_STATE_UPDATE_QUEUE,
};
config.AWS_SECRETS_MANAGER_ACCESS_KEY = process.env.AWS_SECRETS_MANAGER_ACCESS_KEY;
config.AWS_SECRETS_MANAGER_SECRET_KEY = process.env.AWS_SECRETS_MANAGER_SECRET_KEY;
config.AWS_SECRETS_MANAGER_SECRET_ID = process.env.AWS_SECRETS_MANAGER_SECRET_ID;
config.AWS_SECRETS_MANAGER_REGION = process.env.AWS_SECRETS_MANAGER_REGION;

config.AWS_SNS_ACCESS_KEY = process.env.AWS_SNS_ACCESS_KEY;
config.AWS_SNS_SECRET_KEY = process.env.AWS_SNS_SECRET_KEY;
config.AWS_SNS_REGION = process.env.AWS_SNS_REGION;

config.PRIMARY_PRODUCT_ID = process.env.GALILEO_PRIMARY_PRODUCT_ID;
config.SECONDARY_PRODUCT_ID = process.env.GALILEO_SECONDARY_PRODUCT_ID;
config.CARD_IMAGE_URL = process.env.GALILEO_GET_CARD_IMAGE_URL;
config.DEFAULT_CARD_IMAGE_URL = process.env.GALILEO_DEFAULT_CARD_IMAGE_URL;
config.IMAGE_CONFIG_ID = process.env.GALILEO_IMAGE_CONFIG_ID;
config.GALILEO_UNASSIGNED_ACCOUNT = process.env.GALILEO_UNASSIGNED_ACCOUNT;

config.AWS_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  accessHost: process.env.AWS_ACCESS_HOST,
};

// Jeeves drive variables
config.JEEVES_DRIVE_API_KEY = process.env.JEEVES_DRIVE_API_KEY;
config.JEEVES_DRIVE_SERVICE_URL = process.env.JEEVES_DRIVE_SERVICE_URL;
config.JEEVES_DRIVE_REQUEST_TTL_DAYS = process.env.JEEVES_DRIVE_REQUEST_TTL_DAYS;

// Lumen variables
config.LUMEN_API_KEY = process.env.LUMEN_API_KEY;
config.LUMEN_ENGINE_URL = process.env.LUMEN_ENGINE_URL;

// OpenBanking variables
config.OPEN_BANKING_API_KEY = process.env.OPEN_BANKING_API_KEY;
config.OPEN_BANKING_SERVICE_URL = process.env.OPEN_BANKING_SERVICE_URL;

/** Queues */
config.LOANS_QUEUES = {
  statementQueue: process.env.LOAN_STATEMENT_QUEUE,
  statementDeadLetter: process.env.LOAN_STATEMENT_QUEUE_DEAD_LETTER,
  loanLateFeeQueue: process.env.LOAN_LATE_FEE_SQS_URL,
  loanLateFeeDeadLetterQueue: process.env.LOAN_LATE_FEE_DLQ_URL,
};

config.PAYMENT_COLLECTION_QUEUE_URL = process.env.PAYMENT_COLLECTION_QUEUE_URL;

config.MARQETA_CONFIG = {
  [CARD_SERVICE_TYPE.MARQETA_CANADA]: {
    baseUrl: process.env.MARQETA_CANADA_URL,
    secretId: process.env.MARQETA_CANADA_SECRET_ID,
    secretPassword: process.env.MARQETA_CANADA_SECRET_PASS,
    virtualCardProductToken: process.env.MARQETA_CANADA_VIRTUAL_CARD_PRODUCT_TOKEN,
    basicAuthJitUser: process.env.MARQETA_CANADA_BASIC_AUTH_JIT_USER,
    basicAuthJitPass: process.env.MARQETA_CANADA_BASIC_AUTH_JIT_PASSWORD,
    basicAuthWebhookUser: process.env.MARQETA_CANADA_BASIC_AUTH_WEBHOOK_USER,
    basicAuthWebhookPass: process.env.MARQETA_CANADA_BASIC_AUTH_WEBHOOK_PASSWORD,
    physicalCardProductToken: process.env.MARQETA_CANADA_PHYSICAL_CARD_PRODUCT_TOKEN,
    localShippingCountry: [COUNTRY_NUMERIC_CODES.CAD],
    divaApiUsername: process.env.MARQETA_CANADA_DIVA_API_USERNAME,
    divaApiPassword: process.env.MARQETA_CANADA_DIVA_API_PASSWORD,
    programName: process.env.MARQETA_CANADA_PROGRAM_NAME,
  },
  [CARD_SERVICE_TYPE.MARQETA_CANADA_USD]: {
    baseUrl: process.env.MARQETA_CANADA_USD_URL,
    secretId: process.env.MARQETA_CANADA_USD_SECRET_ID,
    secretPassword: process.env.MARQETA_CANADA_USD_SECRET_PASS,
    virtualCardProductToken: process.env.MARQETA_CANADA_USD_VIRTUAL_CARD_PRODUCT_TOKEN,
    basicAuthJitUser: process.env.MARQETA_CANADA_USD_BASIC_AUTH_JIT_USER,
    basicAuthJitPass: process.env.MARQETA_CANADA_USD_BASIC_AUTH_JIT_PASSWORD,
    basicAuthWebhookUser: process.env.MARQETA_CANADA_USD_BASIC_AUTH_WEBHOOK_USER,
    basicAuthWebhookPass: process.env.MARQETA_CANADA_USD_BASIC_AUTH_WEBHOOK_PASSWORD,
    physicalCardProductToken: process.env.MARQETA_CANADA_USD_PHYSICAL_CARD_PRODUCT_TOKEN,
    localShippingCountry: [COUNTRY_NUMERIC_CODES.CAD], // Does this stay the same?
    divaApiUsername: process.env.MARQETA_CANADA_USD_DIVA_API_USERNAME,
    divaApiPassword: process.env.MARQETA_CANADA_USD_DIVA_API_PASSWORD,
    programName: process.env.MARQETA_CANADA_USD_PROGRAM_NAME,
  },
  [CARD_SERVICE_TYPE.MARQETA_US]: {
    baseUrl: process.env.MARQETA_US_URL,
    secretId: process.env.MARQETA_US_SECRET_ID,
    secretPassword: process.env.MARQETA_US_SECRET_PASS,
    virtualCardProductToken: process.env.MARQETA_US_VIRTUAL_CARD_PRODUCT_TOKEN,
    basicAuthJitUser: process.env.MARQETA_US_BASIC_AUTH_JIT_USER,
    basicAuthJitPass: process.env.MARQETA_US_BASIC_AUTH_JIT_PASSWORD,
    basicAuthWebhookUser: process.env.MARQETA_US_BASIC_AUTH_WEBHOOK_USER,
    basicAuthWebhookPass: process.env.MARQETA_US_BASIC_AUTH_WEBHOOK_PASSWORD,
    physicalCardProductToken: process.env.MARQETA_US_PHYSICAL_CARD_PRODUCT_TOKEN,
    localShippingCountry: [COUNTRY_NUMERIC_CODES.US], // Does this stay the same?
    divaApiUsername: process.env.MARQETA_US_DIVA_API_USERNAME,
    divaApiPassword: process.env.MARQETA_US_DIVA_API_PASSWORD,
    programName: process.env.MARQETA_US_PROGRAM_NAME,
  },
};

// NOTE (CARDS-4611): temporary solution for A/B testing.
// Once verified we will decide how to follow up:
//   a) Rollout for all by updating the env variables and rollback this FF
//   b) Add support for configuring it from the CMS
config.MARQETA_GPD_PROVIDER_CONFIG = {
  [CARD_SERVICE_TYPE.MARQETA_CANADA]: 'jeeves_cad_physical_GD',
  [CARD_SERVICE_TYPE.MARQETA_CANADA_USD]: 'jeeves_usd_physical_GD',
  // NOTE: token for CARD_SERVICE_TYPE.MARQETA_US not yet available
};

// Checking with Rodrigo to know if these need to change
config.MARQETA_LOCAL_SHIPPING_METHOD = 'LOCAL_MAIL';
config.MARQETA_INTERNATIONAL_SHIPPING_METHOD = 'INTERNATIONAL';
config.MARQETA_DIVA_API_BASE_URL = process.env.MARQETA_DIVA_API_BASE_URL;
config.DATABASE_ENCRYPT_DECRYPT_PASSWORD = process.env.DATABASE_ENCRYPT_DECRYPT_PASSWORD;
config.DATABASE_ENCRYPT_DECRYPT_ALGO = process.env.DATABASE_ENCRYPT_DECRYPT_ALGO;
config.DATABASE_ENCRYPT_DECRYPT_IV = process.env.DATABASE_ENCRYPT_DECRYPT_IV;

config.TUTUKA_HOST = process.env.TUTUKA_HOST;
config.TUTUKA_HOST_PROD = process.env.TUTUKA_HOST_PROD;
config.TUTUKA_PATH = process.env.TUTUKA_PATH;
config.TUTUKA_PATH_PROD = process.env.TUTUKA_PATH_PROD;
config.TUTUKA_TERMINAL_ID = process.env.TUTUKA_TERMINAL_ID;
config.TUTUKA_TERMINAL_PASSWORD = process.env.TUTUKA_TERMINAL_PASSWORD;
config.TUTUKA_TERMINAL_ID_FOR_PHYSICAL_CARDS = process.env.TUTUKA_TERMINAL_ID_FOR_PHYSICAL_CARDS;
config.TUTUKA_TERMINAL_PASSWORD_FOR_PHYSICAL_CARDS =
  process.env.TUTUKA_TERMINAL_PASSWORD_FOR_PHYSICAL_CARDS;
config.TUTUKA_TERMINAL_ID_PROD = process.env.TUTUKA_TERMINAL_ID_PROD; // virtual campaign
config.TUTUKA_TERMINAL_PASSWORD_PROD = process.env.TUTUKA_TERMINAL_PASSWORD_PROD; // virtual campaign
config.TUTUKA_BRAZIL_TERMINAL_ID = process.env.TUTUKA_BRAZIL_TERMINAL_ID;
config.TUTUKA_BRAZIL_TERMINAL_ID_FOR_PHYSICAL_CARDS =
  process.env.TUTUKA_BRAZIL_TERMINAL_ID_PHYSICAL_CARDS;
config.TUTUKA_COLOMBIA_TERMINAL_ID = process.env.TUTUKA_COLOMBIA_TERMINAL_ID;
config.TUTUKA_COLOMBIA_TERMINAL_ID_FOR_PHYSICAL_CARDS =
  process.env.TUTUKA_COLOMBIA_TERMINAL_ID_PHYSICAL_CARDS;

config.TUTUKA_ALLOWED_SHIPPING_COUNTRY_MX = [484, 76, 170];

// stripe USA
config.STRIPE_ACCOUNT_ID = process.env.STRIPE_ACCOUNT_ID;
config.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
config.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
config.STRIPE_WEBHOOK_SIGNING_SECRET = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
config.STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET = process.env.STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_FIRST = 90;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_SECOND = 70;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_AMOUNT = 1000;
config.STRIPE_ATTEMPT_ACKNOWLEDGED_THRESHOLD_AMOUNT = 5000;
config.STRIPE_ALLOWED_SHIPPING_COUNTRY_US = [840, 124];
// CANADA, CHILE, COLOMBIA, INDIA, MEXICO, PERU, BRAZIL EXCEPT UNITED STATES
config.STRIPE_US_SUPPORTED_COUNTRIES_FOR_BILLING_CURRENCY = [124, 152, 170, 356, 484, 604, 76];
// stripe EUROPE
config.STRIPE_ACCOUNT_ID_EUROPE = process.env.STRIPE_ACCOUNT_ID_EUROPE;
config.STRIPE_PUBLISHABLE_KEY_EUROPE = process.env.STRIPE_PUBLISHABLE_KEY_EUROPE;
config.STRIPE_SECRET_KEY_EUROPE = process.env.STRIPE_SECRET_KEY_EUROPE;
config.STRIPE_WEBHOOK_SIGNING_SECRET_EUROPE = process.env.STRIPE_WEBHOOK_SIGNING_SECRET_EUROPE;
config.STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET_EUROPE =
  process.env.STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET_EUROPE;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_FIRST_EUROPE = 90;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_SECOND_EUROPE = 70;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_AMOUNT_EUROPE = 1000;
config.STRIPE_ATTEMPT_ACKNOWLEDGED_THRESHOLD_AMOUNT_EUROPE = 1000;
config.STRIPE_ALLOWED_SHIPPING_COUNTRY_EUR = [
  372, 250, 276, 724, 528, 56, 442, 440, 703, 380, 246, 40, 620, 428, 233, 300, 705, 196, 470, 826,
];
// stripe UK
config.STRIPE_ACCOUNT_ID_UK = process.env.STRIPE_ACCOUNT_ID_UK;
config.STRIPE_PUBLISHABLE_KEY_UK = process.env.STRIPE_PUBLISHABLE_KEY_UK;
config.STRIPE_SECRET_KEY_UK = process.env.STRIPE_SECRET_KEY_UK;
config.STRIPE_WEBHOOK_SIGNING_SECRET_UK = process.env.STRIPE_WEBHOOK_SIGNING_SECRET_UK;
config.STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET_UK =
  process.env.STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET_UK;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_FIRST_UK = 90;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_SECOND_UK = 70;
config.STRIPE_SUSPECTED_FRAUD_RISKSCORE_THRESHOLD_AMOUNT_UK = 1000;
config.STRIPE_ATTEMPT_ACKNOWLEDGED_THRESHOLD_AMOUNT_UK = 1000;
config.STRIPE_ALLOWED_SHIPPING_COUNTRY_UK = [
  372, 250, 276, 724, 528, 56, 442, 440, 703, 380, 246, 40, 620, 428, 233, 300, 705, 196, 470, 826,
];
// The default amount held is 100 USD to cover the unknown purchase amount.
config.STRIPE_DEFAULT_AMOUNT_PARTIAL_AUTH_HOLD = 500; //$500 USD, https://stripe.com/docs/issuing/purchases/authorizations
config.STRIPE_DEFAULT_CARD_SPEND_LIMIT = 25000000; //$250000 limit, 250000*100
config.STRIPE_DEFAULT_CARD_SPEND_INTERVAL = 'per_authorization'; //per_authorization, daily, weekly, monthly, yearly, all_time
config.STRIPE_EUROPE_COUNTRY = [
  372, 250, 276, 724, 528, 56, 442, 440, 703, 380, 246, 40, 620, 428, 233, 300, 705, 196, 470,
];
// Global list of countries served by FedEx (http://www.fedex.com/ie/contact/served-countries.html). Used as global list of available countries for shipping physical cards.
config.SHIPPING_COUNTRIES = [
  4, 8, 12, 16, 20, 24, 28, 31, 32, 36, 40, 44, 48, 50, 51, 52, 56, 60, 64, 68, 70, 72, 76, 84, 92,
  96, 100, 108, 112, 116, 120, 124, 132, 136, 144, 148, 152, 156, 158, 170, 178, 180, 184, 188, 191,
  196, 203, 204, 208, 212, 214, 218, 222, 231, 232, 233, 234, 242, 246, 250, 254, 258, 262, 266,
  268, 270, 276, 288, 292, 300, 304, 308, 312, 316, 320, 324, 328, 332, 340, 344, 348, 352, 356,
  360, 368, 372, 376, 380, 384, 388, 392, 398, 400, 404, 410, 414, 417, 418, 422, 426, 428, 430,
  434, 438, 440, 442, 446, 450, 454, 458, 462, 466, 470, 474, 478, 480, 484, 492, 496, 498, 499,
  500, 504, 508, 512, 516, 524, 528, 531, 533, 540, 548, 554, 558, 562, 566, 578, 580, 583, 584,
  585, 586, 591, 598, 600, 604, 608, 616, 620, 634, 638, 642, 643, 646, 659, 660, 662, 670, 682,
  686, 688, 690, 702, 703, 704, 705, 710, 716, 724, 740, 748, 752, 756, 764, 768, 780, 784, 788,
  792, 796, 800, 804, 807, 818, 826, 834, 840, 850, 854, 858, 860, 862, 876, 887, 894,
];
config.COUNTRY_LIST = [
  840, 356, 484, 826, 56, 250, 276, 348, 372, 440, 442, 528, 642, 703, 724, 124, 170, 380, 246, 40,
  620, 428, 233, 300, 705, 196, 470, 76, 152, 32, 84, 222, 320, 558, 591, 604, 858, 630, 16, 316,
  580, 850, 480, 702, 458, 203, 616, 578, 218,
];
config.COMPANY_EXCLUSION_LIST_SETTLED_TRANSACTIONS = [
  51, 67, 78, 98, 100, 109, 133, 213, 214, 219, 238, 246, 254, 262, 321, 337, 384, 389, 394, 409,
  430, 441, 442, 463, 488, 508, 522, 533, 563, 575, 576, 604, 697, 750, 765, 767, 806, 823, 832,
  839, 887, 893, 904, 982, 1078, 1141, 1150, 1319, 1329, 1517, 1537, 1544, 1547, 1553, 1564, 1594,
  1703, 1734, 1776, 1815, 1831, 1905, 1921, 1992, 2095, 2171, 2258, 2295, 2368, 2409, 2433, 2521,
  2540, 2645, 2864, 2883, 2894, 67, 89, 282, 345, 389, 399, 503, 515, 604, 663, 750, 772, 920, 947,
  982, 993, 1109, 1111, 1129, 1141, 1173, 1531, 1734, 1746, 1747, 1776, 1804, 1831, 1868, 2139,
  2521, 2703, 2900, 312, 394, 547, 575, 1316, 2368, 2535, 985, 1149, 2311, 2336, 60, 101, 113, 119,
  120, 147, 202, 215, 223, 231, 247, 248, 252, 261, 276, 296, 300, 306, 311, 360, 372, 385, 392,
  405, 419, 433, 439, 440, 448, 451, 454, 472, 476, 482, 506, 520, 524, 526, 541, 554, 559, 564,
  565, 596, 599, 646, 660, 664, 666, 672, 693, 695, 707, 709, 719, 724, 725, 731, 732, 771, 773,
  783, 790, 791, 799, 802, 815, 822, 827, 838, 851, 882, 883, 884, 889, 907, 911, 914, 925, 930,
  931, 951, 954, 980, 986, 997, 1015, 1034, 1037, 1041, 1061, 1090, 1098, 1117, 1128, 1137, 1144,
  1151, 1163, 1166, 1168, 1176, 1192, 1196, 1226, 1239, 1244, 1253, 1273, 1278, 1289, 1290, 1299,
  1315, 1321, 1349, 1350, 1359, 1361, 1382, 1389, 1397, 1412, 1417, 1440, 1452, 1460, 1471, 1480,
  1503, 1522, 1525, 1540, 1574, 1585, 1672, 1700, 1701, 1707, 1709, 1710, 1733, 1757, 1770, 1784,
  1828, 1842, 1853, 1869, 1873, 1880, 1885, 1897, 1910, 1914, 1928, 1944, 1957, 1989, 2061, 2080,
  2082, 2089, 2099, 2103, 2106, 2107, 2112, 2114, 2117, 2147, 2168, 2192, 2194, 2229, 2245, 2271,
  2273, 2274, 2322, 2327, 2401, 2406, 2408, 2439, 2454, 2461, 2473, 2474, 2477, 2482, 2485, 2537,
  2544, 2558, 2571, 2585, 2600, 2603, 2641, 2664, 2689, 2727, 2747, 2755, 2774, 2786, 2792, 2803,
  2239,
]; // used in utilityService.getSettledTransactions
config.STRIPE_JEEVES_IDENTIFIED_SUSPECTED_FRAUD_TRANSACTION_MSG =
  'Jeeves identified the authorization was suspected to be fraud.';

config.ADMIN_EMAIL_TRANSACTION_AMOUNT_OVER = 1000;
config.CLIENT_EMAILS = [
  'dileep@tryjeeves.com',
  'sherwin@tryjeeves.com',
  'brian@tryjeeves.com',
  'ted@tryjeeves.com',
];

config.CLIENT_EMAIL_JEEVES_SHERWIN = 'sherwin@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_DILEEP = 'dileep@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_BRIAN = 'brian@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_ANDRES = 'andres@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_TED = 'ted@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_MIGUEL = 'miguel@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_FABIAN = 'fabian@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_WILLIAM = 'william@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_UMA = 'uma@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_AMRIN = 'amrin@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_DANIELA = 'daniela@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_DAVID = 'david@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_BRENDAN = 'brendan@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_ISABEL = 'isabel@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_ARPAN = 'arpan@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_SUNDAR = 'sundar@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_SARA = 'sara@tryjeeves.com';
config.CLIENT_EMAIL_JEEVES_FRANKIE = 'frankie@tryjeeves.com';

config.CLIENT_EMAIL_GMAIL_SHERWIN = 'sherwin.gandhi@gmail.com';
config.CLIENT_EMAIL_GMAIL_DILEEP = 'thazhmon@gmail.com';
config.CLIENT_EMAIL_GMAIL_BRIAN = '';
config.CLIENT_EMAIL_GMAIL_TED = '';

config.BRL_EMAILS = process.env.BRL_EMAILS
  ? process.env.BRL_EMAILS.join(',')
  : [
      'dbrightley@tryjeeves.com',
      'rebecca@tryjeeves.com',
      'miguel@tryjeeves.com',
      'fernando@tryjeeves.com',
    ];

config.DEVELOPER_EMAIL_OPENXCELL_KRUPAL = 'krupal@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_ASHWIN = 'ashwin@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_RAHIL = 'rahil@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_KALPESH = 'kalpesh@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_SVARUP = 'svarup@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_UDIT = 'udit@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_RUTUL = 'rutul@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_KINNARI = 'kinnari@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_PARTH = 'parth@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_DHWANIK = 'dhwanik@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_CHITRA = 'chitra@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_MATANG = 'matang@tryjeeves.com';
config.QA_EMAIL_OPENXCELL_ANUJ = 'anuj@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_NIDHI = 'nidhi@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_MONAL = 'monal@tryjeeves.com';
config.DEVELOPER_EMAIL_OPENXCELL_RENISH = 'renish+programming@tryjeeves.com';
config.DEVELOPER_EMAIL_JEEVES_LUCA = 'luca@tryjeeves.com';

config.DEVELOPER_EMAIL_JEEVES_KULDEEP = 'kuldeep@tryjeeves.com';
config.DEVELOPERS = [config.DEVELOPER_EMAIL_JEEVES_KULDEEP];

config.PRIVACY_POLICY_URL = 'https://tryjeeves.com/legal';
config.STRIPE_SDK_VERSION = '2020-08-27';
config.REFERRAL_BASE_URL_PROD = 'https://tryjeeves.com/?ref=';
config.REFERRAL_BASE_URL_DEV = 'https://dev.jeev.es/?ref=';

config.JEEVES_ADMIN_EMAIL_OPENXCELL = 'hello@tryjeeves.com';

config.STATEMETN_DEFAULT_SUPPORT_EMAIL = 'finance@tryjeeves.com';
config.STATEMETN_LATM_SUPPORT_EMAIL = 'soporte@tryjeeves.com';
config.STATEMETN_EUR_UK_SUPPORT_EMAIL = 'eu-support@tryjeeves.com';

config.STP_CLABE_NUMBER = process.env.STP_CLABE_NUMBER;
config.SPEI_SENDER_NAME_MAX_LENGTH = 40;

config.CODAT_API_URL = process.env.CODAT_API_URL;
config.CODAT_AUTH_HEADER = process.env.CODAT_AUTH_HEADER;
config.GENERATE_LOAN_HTML = process.env.GENERATE_LOAN_HTML;

//https://www.newyorkfed.org/aboutthefed/holiday_schedule
config.statementHoliday = [
  '02-15-2021',
  '04-31-2021',
  '07-04-2021',
  '09-06-2021',
  '10-11-2021',
  '11-11-2020',
  '11-25-2021',
  '12-25-2021',
  '01-01-2022',
  '01-17-2022',
  '02-21-2022',
  '04-30-2022',
  '07-04-2022',
  '09-05-2022',
  '10-10-2022',
  '11-11-2022',
  '11-24-2022',
  '12-25-2022',
];

config.REFERAL_CODE_LENGTH = 8;

config.MONTHLY_SALES_MX_CO = [
  'Menos de $10,000 USD por mes',
  'Entre $10,000 USD - $400,000 USD por mes',
  '$400,000 USD - $1,000,000 USD por mes',
  '$1,000,000 USD en adelante por mes',
];

config.MONTHLY_SALES_US = [
  'Less than $10,000 per month',
  '$10,000 – $400,000 per month',
  '$400,000 – $1,000,000 per month',
  'More than $1,000,000 per month',
];

config.MONTHLY_SALES_EUR = [
  'Less than €10,000 per month',
  '€10,000 – €400,000 per month',
  '€400,000 – €1,000,000 per month',
  'More than €1,000,000 per month',
];

config.MONTHLY_SALES_UK = [
  'Less than £10,000 per month',
  '£10,000 – £400,000 per month',
  '£400,000 – £1,000,000 per month',
  'More than £1,000,000 per month',
];

config.MONTHLY_SPEND_MX_CO = [
  'Menos de $10,000 USD por mes',
  'Entre $10,000 USD - $400,000 USD por mes',
  '$400,000 USD - $1,000,000 USD por mes',
  '$1,000,000 USD en adelante por mes',
];

config.MONTHLY_SPEND_US = [
  'Less than $2,000 per month',
  '$2,000 – $20,000 per month',
  '$20,000 – $100,000 per month',
  'More than $100,000 per month',
];

config.MONTHLY_SPEND_EUR = [
  'Less than €2,000 per month',
  '€2,000 – €20,000 per month',
  '€20,000 – €100,000 per month',
  'More than €100,000 per month',
];

config.MONTHLY_SPEND_UK = [
  'Less than £2,000 per month',
  '£2,000 – £20,000 per month',
  '£20,000 – £100,000 per month',
  'More than £100,000 per month',
];

config.HEAR_ABOUT_PLATFORMS = [
  'Social Media (e.g. Facebook, Instagram, LinkedIn)',
  'Search engine (e.g. Google, Bing)',
  'Word of mouth / referral',
  'Billboards / outdoor advertising',
  'Other',
];

config.SOURCE_MAIN_CURRENCIES = [
  {
    currencyCode: 840,
    currencyAlphaCode: 'USD',
  },
  {
    currencyCode: 826,
    currencyAlphaCode: 'GBP',
  },
  {
    currencyCode: 978,
    currencyAlphaCode: 'EUR',
  },
  {
    currencyCode: 484,
    currencyAlphaCode: 'MXN',
  },
  {
    currencyCode: 124,
    currencyAlphaCode: 'CAD',
  },
  {
    currencyCode: 170,
    currencyAlphaCode: 'COP',
  },
  {
    currencyCode: 604,
    currencyAlphaCode: 'PEN',
  },
  {
    currencyCode: 986,
    currencyAlphaCode: 'BRL',
  },
  {
    currencyCode: 152,
    currencyAlphaCode: 'CLP',
  },
];

config.DESTINATION_MAIN_CURRENCY_ALPHA_CODES = [
  'CAD',
  'MXN',
  'EUR',
  'GBP',
  'BRL',
  'COP',
  'AUD',
  'CNY',
  'HKD',
  'SGD',
  'CHF',
  'NZD',
  'JPY',
  'THB',
  'SEK',
  'NOK',
  'DKK',
  'HUF',
  'CZK',
  'PLN',
  'RON',
  'IDR',
  'MYR',
  'PHP',
  'TRY',
  'INR',
  'VND',
  'KRW',
  'BDT',
  'LKR',
  'NPR',
  'PKR',
  'ILS',
  'ZAR',
  'BHD',
  'EGP',
  'AED',
  'SAR',
  'MAD',
  'CLP',
  'ARS',
  'BOB',
  'PEN',
  'UYU',
  'USD',
];

config.EXCHANGE_RATE_API_LAYER_CHUNK_SIZE = 20;

config.JEEVES_MEXICO_ADDRESS =
  'Varsovia 36, Oficina 1010, Juarez, Cuauhtemoc, CP, Cidudad de Mexico, Mexico';
config.JEEVES_MEXICO_ADDRESS_ZIPCODE = '06600';
config.USD_CURRENCY_CODE = 840;
config.UK_CURRENCY_CODE = 826;
config.EUROPE_CURRENCY_CODE = 978;
config.MEXICO_CURRENCY_CODE = 484;
config.USD_CURRENCY_ALPHACODE = 'USD';
config.MERCHANT_CATEGORY_CONFIDENCE_PERCENTAGE = 0.9;
config.USA_COUNTRY_CODE = 840;
config.UK_COUNTRY_CODE = 826;
config.EUROPE_COUNTRY_CODE = 978;
config.MEXICO_COUNTRY_CODE = 484;
config.BRAZIL_CURRENCY_CODE = 986;
config.BRAZIL_COUNTRY_CODE = 76;
config.COLOMBIA_CURRENCY_CODE = 170;
config.COLOMBIA_COUNTRY_CODE = 170;
config.CANADA_COUNTRY_CODE = 124;
config.REGION_USA = 'USA';
config.REGION_UK = 'UK';
config.REGION_EUROPE = 'EUR';
config.REGION_MX = 'MX';
config.IOF_TAX_RATE_PER_YEAR = {
  2022: 0.0638,
  2023: 0.0538,
  2024: 0.0438,
  2025: 0.0338,
  2026: 0.0238,
  2027: 0.0138,
};

config.STP_PAYLOAD_SIGN_PRIVATE_KEY = 'prueba-key.pem';
config.STP_PAYLOAD_SIGN_PASSPHRASE = '12345678';
config.STP_SANDBOX_PAYLOAD_SIGN_PRIVATE_KEY = 'prueba-key-sandbox.pem';

config.USA_TZ = 'America/New_York';
config.UK_TZ = 'Europe/London';
config.EUR_TZ = 'Africa/Tunis';
config.MEXICO_TZ = 'America/Mexico_City';
config.BRAZIL_TZ = 'America/Sao_Paulo';
config.COLOMBIA_TZ = 'America/Bogota';
config.CANADA_TZ = 'Canada/Central';
config.DEFAULT_CARD = '000000XXXXXX0000';
config.PRIMARY_CARD_NAME = 'Primary';
config.CRON_SYNC_TIME = '01:30:00';
config.CRON_SYNC_BUFFER_MINUTES = 9;
config.HEALTHCHECK_REQ_TIMEOUT = 15000;
config.ACCOUNTING_CLASSES = 'CLASSES';
config.WHITELIST_MERCHANTS_LIMIT = 30;
config.NUMERIC_HUNDRED = 100;
config.ADD_BUSINESS_DAYS_FOR_STATEMENT_DUE_DATE = 5;
config.BUSINESS_DAYS_FOR_INSTALMENT_DUE = 5;

config.API_BASE_URL = process.env.API_BASE_URL;
config.BANKING_SERVICE_API_ENDPOINTS = {
  CREATE_DD_ACC_WITH_SETUP_EMAIL: '/banking-service/banks/create-rf-dd-account',
};
config.PAYMENT_TRANSFER_SERVICE_API_ENDPOINTS = {
  CHECK_TRANSFER_APPROVAL_STATUS:
    '/v2/payment-transfer/web/transfer/check-transfer-auto-approval-status',
  SQS_PRODUCER_STATUS_UPDATE: '/v2/payment-transfer/sqs-producer',
  CREATE_WALLET: '/v2/payment-transfer/create-wallet',
  UPDATE_ROUTE_FUSION_STATUS:
    '/v2/payment-transfer/admin/route-fusion-admin/update-routefusion-status',
  FIND_BANK_DETAILS: '/v2/payment-transfer/web/route-fusion-web/get-bank-details',
};
config.SATWS_EXTRACTER = 'invoice';
config.DEFAULT_DATE_TIME_FORMAT = 'MMM DD, YYYY hh:mm A z';
config.BULK_EMAIL_DATE_TIME_FORMAT = 'MM/DD/YYYY, hh:mm A z';

config.AUTO_SYNC_RECONCILE_LOOKBACK_VALUE = 15;
config.AUTO_SYNC_RECONCILE_LOOKBACK_PARAMETER = 'minutes';

config.ROUTEFUSION_END_POINT = process.env.ROUTEFUSION_API_GRAPHQL;
config.ROUTEFUSION_HEADER = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer ' + process.env.ROUTEFUSION_SECRET_GRAPHQL,
};
config.ROUTEFUSION_EMAIL_BCC_PROD = process.env.ROUTEFUSION_EMAIL_BCC_PROD;
config.ROUTEFUSION_EMAIL_BCC_LOCAL = process.env.ROUTEFUSION_EMAIL_BCC_LOCAL;
config.ROUTEFUSION_EMAIL_CC_PROD = process.env.ROUTEFUSION_EMAIL_CC_PROD;
config.ROUTEFUSION_EMAIL_CC_LOCAL = process.env.ROUTEFUSION_EMAIL_CC_LOCAL;

config.DOCUSIGN_CONFIG = {
  INTEGRATION_KEY: process.env.DOCUSIGN_INTEGRATION_KEY,
  CLIENT_SECRET: process.env.DOCUSIGN_CLIENT_SECRET,
  OAUTH_SERVER: process.env.DOCUSIGN_OAUTH_SERVER,
  CLIENT_ID: process.env.DOCUSIGN_CLIENT_ID,
  IMPERSONATED_USER_GUID: process.env.DOCUSIGN_IMPERSONATED_USER_GUID,
  SCOPES: ['signature', 'impersonation'],
  TARGET_ACCOUNT_ID: false,
  ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID,
  RETURN_URL: process.env.DOCUSIGN_RETURN_URL,
  BASE_URI: process.env.DOCUSIGN_BASE_URI,
  ROLE_TYPE: process.env.DOCUSIGN_ROLE_TYPE,
  ROLE_NAME: process.env.DOCUSIGN_ROLE_NAME,
  ROLE_EMAIL: process.env.DOCUSIGN_ROLE_EMAIL,
  PRIVATE_KEY: process.env.DOCUSIGN_PRIVATE_KEY,
  TEMPLATES: {
    CA_PAD_TEMPLATE_ID: process.env.DOCUSIGN_CA_PAD_TEMPLATE_ID,
    MX_PAD_TEMPLATE_ID: process.env.DOCUSIGN_MX_PAD_TEMPLATE_ID,
  },
  CONNECT_SECRET: process.env.DOCUSIGN_CONNECT_SECRET,
};

config.CENTCONVERTER = 100;
config.CASHBACK_SERVICE_URL = process.env.CASHBACK_SERVICE_URL;
config.CASHBACK_SERVICE_ENABLED = process.env.CASHBACK_SERVICE_ENABLED;

config.BTG_SERVICE_URL = `${process.env.BTG_SERVICE_URL}/v2/btg`;
config.BTG_SERVICE_ENABLED = process.env.BTG_SERVICE_ENABLED;

config.CMS_ORGANIZATION_URL = `${config.ADMINURL}/organizations/`;

// NOTE: The recommended way to authenticate to the ZenDesk API is via token.
// See https://developer.zendesk.com/api-reference/ticketing/introduction/#api-token
config.ZENDESK_BASE_API_URL = process.env.ZENDESK_BASE_API_URL;
config.ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN;
config.ZENDESK_API_EMAIL = process.env.ZENDESK_API_EMAIL;
// NOTE: Taken from https://jeeves.zendesk.com/admin/objects-rules/tickets/ticket-forms/edit/4420419976337 - can be found in the URL
config.ZENDESK_DISPUTE_TICKET_FORM_ID = process.env.ZENDESK_DISPUTE_TICKET_FORM_ID;
config.ZENDESK_DISPUTE_TICKET_CATEGORY = process.env.ZENDESK_DISPUTE_TICKET_CATEGORY;
// NOTE: Values taken from https://jeeves.zendesk.com/admin/objects-rules/tickets/ticket-fields
config.ZENDESK_DISPUTE_TICKET_FIELDS_CSV = process.env.ZENDESK_DISPUTE_TICKET_FIELDS;

config.SUPPORT_UK_EU_EMAIL = process.env.SUPPORT_UK_EU_EMAIL;
config.SUPPORT_NAM_EMAIL = process.env.SUPPORT_NAM_EMAIL;
config.SUPPORT_LATAM_EMAIL = process.env.SUPPORT_LATAM_EMAIL;
config.STP_API_URL = process.env.STP_API_URL;

config.TRUNARRATIVE_CONFIG = {
  baseUrl: `${process.env.TRUNARRATIVE_SERVICE_URL}${
    process.env.TRUNARRATIVE_SERVICE_URL?.endsWith('/') ? '' : '/'
  }`,
  apiKey: process.env.TRUNARRATIVE_SERVICE_API_KEY,
};

config.WAITLIST_API_KEY = process.env.WAITLIST_API_KEY || 'bdHxXrTJKZjB55mDC8qbtaPKeAngyDqh';

config.ENABLE_UNHANDLED_REJECTION_LISTENER = process.env.ENABLE_UNHANDLED_REJECTION_LISTENER;

config.TRANSACTION_STREAM_EXPIRY = 55;

config.TUTUKA_CONFIG = {
  TRANSACTION_STREAM_ENABLED: process.env.TUTUKA_TRANSACTION_STREAM_ENABLED === 'true',
  TRANSACTION_STREAM_AUTH_URL: process.env.TUTUKA_TRANSACTION_STREAM_AUTH_URL,
  TRANSACTION_STREAM_TERMINALS: [
    config.TUTUKA_TERMINAL_ID,
    config.TUTUKA_TERMINAL_ID_FOR_PHYSICAL_CARDS,
    config.TUTUKA_BRAZIL_TERMINAL_ID,
    config.TUTUKA_BRAZIL_TERMINAL_ID_FOR_PHYSICAL_CARDS,
    config.TUTUKA_COLOMBIA_TERMINAL_ID,
    config.TUTUKA_COLOMBIA_TERMINAL_ID_FOR_PHYSICAL_CARDS,
    // NOTE: add new Tutuka terminals here
  ],
};

config.WEBHOOK_GATEWAY_URL = process.env.WEBHOOK_GATEWAY_URL;

config.SHOULD_DISABLE_2FA = !isProduction() && process.env.SHOULD_DISABLE_2FA === 'true';

// number max of attempts for the actions protected via MFA code (login or a specific action)
config.NUMBER_OF_ALLOWED_FAILED_ATTEMPTS =
  Number(process.env.NUMBER_OF_ALLOWED_FAILED_ATTEMPTS) || 8;

config.FREEZE_ACCOUNT_IN_MINUTES = Number(process.env.FREEZE_ACCOUNT_IN_MINUTES) || 60;

config.IP_ADDRESS_FIREWALL = {
  CAPTCHA_MODE: process.env.IP_ADDRESS_FIREWALL_CAPTCHA_MODE || 'always',
  WINDOW_SIZE_FOR_CAPTCHA_MS:
    Number(process.env.IP_ADDRESS_FIREWALL_WINDOW_SIZE_FOR_CAPTCHA_MS) || 3 * 60 * 1000,
  ATTEMPT_COUNT_FOR_CAPTCHA: Number(process.env.IP_ADDRESS_FIREWALL_ATTEMPT_COUNT_FOR_CAPTCHA) || 3,
  DISABLE_IP_BLOCK: process.env.IP_ADDRESS_FIREWALL_DISABLE_IP_BLOCK === 'true',
  WINDOW_SIZE_FOR_BLOCK_MS:
    Number(process.env.IP_ADDRESS_FIREWALL_WINDOW_SIZE_FOR_BLOCK_MS) || 5 * 60 * 1000,
  ATTEMPT_COUNT_FOR_BLOCK: Number(process.env.IP_ADDRESS_FIREWALL_ATTEMPT_COUNT_FOR_BLOCK) || 10,
  IP_BLOCK_DURATION_MS:
    Number(process.env.IP_ADDRESS_FIREWALL_IP_BLOCK_DURATION_MS) || 15 * 60 * 1000,
};

/**
 * NOTE: We need to authenticate to the SAP Concur sFTP server using SSH key.
 * Below we have the ENV vars for the server hostname, our username and the private key we should use to authenticate.
 * We should also look for an encryption key on the server that we must use to encrypt the files we upload there with.
 * So, we also have the ENV var for the encryption key filename which should have the same name always.
 */
config.SAP_CONCUR_HOSTNAME = process.env.SAP_CONCUR_HOSTNAME;
config.SAP_CONCUR_USERNAME = process.env.SAP_CONCUR_USERNAME;
config.SAP_CONCUR_SFTP_PRIVATE_KEY = process.env.SAP_CONCUR_SFTP_PRIVATE_KEY;
config.SAP_CONCUR_ENCRYPTION_KEY_FILENAME = process.env.SAP_CONCUR_ENCRYPTION_KEY_FILENAME;
config.SAP_CONCUR_TEST_MODE_ENABLED = process.env.SAP_CONCUR_TEST_MODE_ENABLED === 'true';

config.MAX_PASSWORD_HISTORY = Number(process.env.MAX_PASSWORD_HISTORY) || 8;
config.PASSWORD_STRENGTH_SCORE = Number(process.env.PASSWORD_STRENGTH_SCORE) || 2;

// Added this config as a part of wallet blocker logic for CARDS-2840
config.WALLET_CHECK_ENABLED = process.env.WALLET_CHECK_ENABLED;
config.LOAN_STATEMENT_MQ_BATCH_SIZE = 5;
config.LOAN_STATEMENT_GENERATION_ADVANCE_DAYS = 5;
config.DAY_AFTER_STATEMENT_GENERATION_ADVANCE_DAYS =
  config.LOAN_STATEMENT_GENERATION_ADVANCE_DAYS + 1;
config.AUTO_VERIFY_EXCLUDED_LOAN_CURRENCY = [170]; // 170 - COP, 986 - Brazil

config.JEEVES_PIX_KEY = process.env.JEEVES_PIX_KEY;
/** Enable auto debit implicitly on the basis of certain condition */
config.ENABLE_AUTO_DEBIT_IMPLICITILY = process.env.ENABLE_AUTO_DEBIT_IMPLICITILY;

config.AUTHENTICATION_SERVICE_BASE_HOST =
  process.env.AUTHENTICATION_SERVICE_BASE_HOST ||
  'http://please.configure.this.variable.into.env?=AUTHENTICATION_SERVICE_BASE_HOST';

config.GRACE_PERIOD = parseInt(process.env.GRACE_PERIOD) || 5;

config.CLOUDFLARE_TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

config.LUMEN_API_KEY = process.env.LUMEN_API_KEY;

config.CREDIT_STATEMENT_SERVICE_BASE_HOST = process.env.CREDIT_STATEMENT_SERVICE_BASE_HOST;
config.CARDS_WEBHOOK_EVENTS_SQS_URL = process.env.CARDS_WEBHOOK_EVENTS_SQS_URL;
config.CARDS_WEBHOOK_EVENTS_SQS_GROUP_ID = process.env.CARDS_WEBHOOK_EVENTS_SQS_GROUP_ID;

config.CARDS_WEBHOOK_EVENT_WORKER_ENABLED =
  process.env.CARDS_WEBHOOK_EVENT_WORKER_ENABLED === 'true';
config.CARDS_WEBHOOK_EVENT_STRIPE_QUEUE_ENABLED =
  process.env.CARDS_WEBHOOK_EVENT_STRIPE_QUEUE_ENABLED === 'true';
config.CARDS_WEBHOOK_EVENT_MARQETA_QUEUE_ENABLED =
  process.env.CARDS_WEBHOOK_EVENT_MARQETA_QUEUE_ENABLED === 'true';
config.CARDS_WEBHOOK_EVENT_TUTUKA_QUEUE_ENABLED =
  process.env.CARDS_WEBHOOK_EVENT_TUTUKA_QUEUE_ENABLED === 'true';

config.CARDS_WEBHOOK_HANDLER_POD_GROUP_BASE_URL =
  process.env.CARDS_WEBHOOK_HANDLER_POD_GROUP_BASE_URL;

config.BACKEND_API_KEY = process.env.BACKEND_API_KEY || '4pVuLfsZtdZT3t3bXT8G7kNVNtFn7He8';

config.DEFAULT_AGREEMENT_PROVIDER = process.env.DEFAULT_AGREEMENT_PROVIDER || 'IN_HOUSE';

config.CROSS_BORDER_FEES_BLACKLIST = process.env.CROSS_BORDER_FEES_BLACKLIST
  ? process.env.CROSS_BORDER_FEES_BLACKLIST.split(',')
  : null;
config.LUMEN_FORMULAS = {
  RISK_SCORE_FORMULA: process.env.LUMEN_RISK_SCORE_FORMULA,
  MERCHANT_BLOCK_FORMULA: 'MERCHANT_BLOCK',
};
config.ENABLE_RECIPIENT_JEEVES_PAY_EMAIL = process.env.ENABLE_RECIPIENT_JEEVES_PAY_EMAIL === 'true';
config.LOAN_LATE_FEE_EXCLUDED_CURRENCY =
  process.env.LOAN_LATE_FEE_EXCLUDED_CURRENCY || '170,152,986';
config.LOAN_LATE_FEE_MAX_COUNT = process.env.LOAN_LATE_FEE_MAX_COUNT || 3;
config.LOAN_LATE_FEE_MINIMUM_PRICIPAL_AMOUNT_IN_USD =
  process.env.LOAN_LATE_FEE_MINIMUM_PRICIPAL_AMOUNT_IN_USD || 100;
config.LOAN_LATE_FEE_ENABLE = process.env.LOAN_LATE_FEE_ENABLE;
config.LOAN_LATE_FEE_ENABLE_FOR_SELECTED_COMPANIES =
  process.env.LOAN_LATE_FEE_ENABLE_FOR_SELECTED_COMPANIES;
config.LOAN_LATE_FEE_ENABLED_COMPANIES = process.env.LOAN_LATE_FEE_ENABLED_COMPANIES;

config.BLOCK_STRIPE_VERIFICATION_MISMATCH_ENABLED =
  process.env.BLOCK_STRIPE_VERIFICATION_MISMATCH_ENABLED === 'true';

config.FLOWS_CONFIG = {
  API_KEY: process.env.FLOWS_API_KEY,
  API_BASE_URL: process.env.FLOWS_API_BASE_URL,
  FE_BASE_URL: process.env.FLOWS_FE_BASE_URL,
};

config.STRIPE_CONFIG_DEADLINE = process.env.STRIPE_CONFIG_DEADLINE || '2023-04-01';
config.STRIPE_EU_UK_CONFIG_DEADLINE = process.env.STRIPE_EU_UK_CONFIG_DEADLINE || '2023-08-31';

config.INVITE_USER_EXPIRES_IN_DAYS = process.env.INVITE_USER_EXPIRES_IN_DAYS || 90;

config.SSO_TOKEN_EXPIRES_IN_MINUTES = process.env.SSO_TOKEN_EXPIRES_IN_MINUTES || 3;

config.CARD_SERVICE_URL = process.env.CARD_SERVICE_URL;
config.WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL;
config.WALLET_SERVICE_URL_API_PATH = process.env.WALLET_SERVICE_URL_API_PATH;
config.BILLPAY_SERVICE_URL = process.env.BILLPAY_SERVICE_URL;
config.BILLPAY_SERVICE_URL_API_PATH = process.env.BILLPAY_SERVICE_URL_API_PATH;

config.PRODUCT_ACCOUNT_SERVICE_API_URL =
  process.env.PRODUCT_ACCOUNT_SERVICE_API_URL || 'http://localhost:8004';

config.ENABLE_PHYSICAL_CARDS_FOR_TUTUKA_COLOMBIA =
  process.env.ENABLE_PHYSICAL_CARDS_FOR_TUTUKA_COLOMBIA === 'true';

config.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_CANADA =
  process.env.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_CANADA === 'true';

config.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_CANADA_USD =
  process.env.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_CANADA_USD === 'true';

config.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_US =
  process.env.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_US === 'true';

config.ENABLE_PHYSICAL_CARDS_FOR_GALILEO = process.env.ENABLE_PHYSICAL_CARDS_FOR_GALILEO === 'true';

config.INTERNAL_SERVICE_COMMUNICATION = {
  SKIP_INTERNAL_CERTIFICATION_CHECK: process.env.SKIP_INTERNAL_CERTIFICATION_CHECK === 'true',
};
config.MARQUETA_KYC_KYB_DATE = process.env.MARQUETA_KYC_KYB_DATE || 'by May 31, 2023';

config.MARQETA_BASIC_AUTH_USERS =
  process.env.MARQETA_BASIC_AUTH_USERS || '{"marqeta":"jeeves", "jeeves":"marqeta"}';

config.MARQETA_IP_WHITELIST = process.env.MARQETA_IP_WHITELIST || '[]';

config.API_LAYER = {
  EXCHANGE_RATE_END_POINT: process.env.API_LAYER_EXCHANGE_RATE_END_POINT,
  EXCHANGE_RATE_API_KEY: process.env.API_LAYER_EXCHANGE_RATE_API_KEY,
};

config.CURRENCY_MAX_CREDIT_LIMIT = {
  CAD: process.env.CAD_MAX_CREDIT_LIMIT,
  EUR: process.env.EUR_MAX_CREDIT_LIMIT,
  GBP: process.env.GBP_MAX_CREDIT_LIMIT,
  COP: process.env.COP_MAX_CREDIT_LIMIT,
  BRL: process.env.BRL_MAX_CREDIT_LIMIT,
  MXN: process.env.MXN_MAX_CREDIT_LIMIT,
  USD: process.env.USD_MAX_CREDIT_LIMIT,
};

config.CLICKWRAP_ID_WITH_COMPANY = process.env.CLICKWRAP_ID_WITH_COMPANY === 'true';

config.HAS_SELF_FUNDED_FEATURE_ENABLED = process.env.HAS_SELF_FUNDED_FEATURE_ENABLED ?? true;
config.HAS_EXPENSE_MANAGEMENT_FEATURE_ENABLED =
  process.env.HAS_EXPENSE_MANAGEMENT_FEATURE_ENABLED ?? true;

config.ACCOUNTING_SERVICE_URL = process.env.ACCOUNTING_SERVICE_URL;
config.ACCOUNTING_SERVICE_URL_API_PATH = process.env.ACCOUNTING_SERVICE_URL_API_PATH;

config.UI_CARD_MIGRATION_ENABLED = process.env.UI_CARD_MIGRATION_ENABLED === 'true';

config.ABSTRACTAPI_URL = process.env.ABSTRACTAPI_URL;
config.ABSTRACTAPI_API_KEY = process.env.ABSTRACTAPI_API_KEY;

config.JEEVES_EMAIL_TEMPLATE_CONFIG = {
  JEEVES_STREET_URL:
    'https://www.google.com/maps/place/14767+McClane+Rd,+Winter+Garden,+FL+34787,+USA/@28.5346606,-81.6049911,17z/data=!4m15!1m8!3m7!1s0x88e78475c1931d1f:0xc13356c854257c05!2s14767+McClane+Rd,+Winter+Garden,+FL+34787,+USA!3b1!8m2!3d28.5346606!4d-81.6049911!16s%2Fg%2F11rr8fldtc!3m5!1s0x88e78475c1931d1f:0xc13356c854257c05!8m2!3d28.5346606!4d-81.6049911!16s%2Fg%2F11rr8fldtc',
  JEEVES_STREET_ADDRESS: '14767 McClane Road',
  JEEVES_CITY: 'Winter Garden',
  JEEVES_STATE: 'Florida',
  JEEVES_ZIP: '34787',
  JEEVES_YEAR: new Date().getFullYear(),
  HELP_SUPPORT_LINK: 'https://www.tryjeeves.com/support/all',
  SECURITY_LINK: 'https://www.tryjeeves.com/security',
  JEEVES_LINK: 'https://www.tryjeeves.com',
};

config.SARDINE = {
  ENABLED: process.env.SARDINE_ENABLED === 'true',
  FORCE_ENABLED_CRON: process.env.SARDINE_FORCE_ENABLED_CRON === 'true',
  // NOTE CARDS-4852: based on a company FF
  // switch to sub-account processing in the future.
  USE_SUB_ACCOUNTS: process.env.SARDINE_USE_SUB_ACCOUNTS === 'true',
  // NOTE: control the execution time to avoid overlapping executions
  SARDINE_SYNC_MAX_EXECUTION_TIME: process.env.SARDINE_SYNC_MAX_EXECUTION_TIME || 5 * 60 * 1000, // ms
  SARDINE_BASE_URL: process.env.SARDINE_BASE_URL,
  SARDINE_CLIENT_ID: process.env.SARDINE_CLIENT_ID,
  SARDINE_SECRET: process.env.SARDINE_SECRET,
};

config.ENV_NAME = process.env.ENV_NAME;
config.SERVICE_NAME = process.env.SERVICE_NAME || process.env.OTEL_SERVICE_NAME;
config.DEFERRED_MODULE_ENABLED = process.env.DEFERRED_MODULE_ENABLED === 'true';
config.PUBSUB_MODULE_ENABLED = process.env.PUBSUB_MODULE_ENABLED === 'true';

config.POLICY_TRANSACTIONS_QUEUE_ENABLED = process.env.POLICY_TRANSACTIONS_QUEUE_ENABLED === 'true';
config.POLICY_TRANSACTIONS_QUEUE_URL = process.env.POLICY_TRANSACTIONS_QUEUE_URL;
config.POLICY_TRANSACTIONS_MQ_BATCH_SIZE = 5;

config.DEV_NAME = process.env.DEV_NAME || '';

config.NOTIFICATIONS_SERVICE_URL =
  process.env.NOTIFICATIONS_SERVICE_URL || 'http://notification-service';

module.exports = config;
