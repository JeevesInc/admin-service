const _ = require('lodash');
const config = require('../api/config');
const {
  CARD_STATUS,
  CARD_SERVICE_TYPE,
  TUTUKA_STOP_REASON_LABEL,
  TUTUKA_CARD_SERVICE_TYPES,
  STRIPE_CARD_SERVICE_TYPES,
  MARQETA_CARD_SERVICE_TYPES,
} = require('../db/jeeves').constants;

const { ERROR400 } = require('../constants/common');
const l10n = require('jm-ez-l10n');

const {
  SPEND_LIMIT_PER_CARD_SERVICE_TYPE,
  COUNTRY_PER_CARD_SERVICE_TYPE,
  REGION_BY_CARD_SERVICE_TYPE,
  ALLOWED_SHIPPING_COUNTRIES,
} = require('../constants/commonConstant');
const { parseFloat: parseFt } = require('../helper/utils');
const { JeevesValidationError } = require('../constants/errors');
const arrayUtils = require('./array');

const getStopReasonLabel = (card) => {
  if (_.get(card, 'cardStatus') === CARD_STATUS.FREEZE) {
    if (card.cardServiceType === CARD_SERVICE_TYPE.TUTUKA && card.stopReason > 0) {
      const reasonKey = TUTUKA_STOP_REASON_LABEL[card.stopReason];
      return reasonKey ? l10n.t(reasonKey) : reasonKey;
    }
  }
};

/**
 * Returns true if physical card creation is blocked for given companyCardservice, else false
 * @param {Object} companyCardservice,
 * @returns {Boolean}
 */
const isPhysicalCardCreationBlocked = (companyCardservice) => {
  return (
    (companyCardservice === CARD_SERVICE_TYPE.TUTUKA_COLOMBIA &&
      !config.ENABLE_PHYSICAL_CARDS_FOR_TUTUKA_COLOMBIA) ||
    (companyCardservice === CARD_SERVICE_TYPE.MARQETA_CANADA &&
      !config.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_CANADA) ||
    (companyCardservice === CARD_SERVICE_TYPE.MARQETA_CANADA_USD &&
      !config.ENABLE_PHYSICAL_CARDS_FOR_MARQETA_CANADA_USD) ||
    (companyCardservice === CARD_SERVICE_TYPE.GALILEO && !config.ENABLE_PHYSICAL_CARDS_FOR_GALILEO)
  );
};

const isSelfFundingSourceCardCreationBlocked = (companyCardservice) => {
  return (
    companyCardservice === CARD_SERVICE_TYPE.TUTUKA ||
    companyCardservice === CARD_SERVICE_TYPE.TUTUKA_BRAZIL
  );
};

const validateSpendLimitForTutukaProcessors = (req, res, options) => {
  const { spendLimit, cardServiceType, email, raise } = options;
  const spendLimitBasedOnCountry = SPEND_LIMIT_PER_CARD_SERVICE_TYPE[cardServiceType];

  if (parseFt(spendLimit) > parseFt(spendLimitBasedOnCountry)) {
    const details = {
      LENGTH: spendLimitBasedOnCountry,
      EMAIL: '',
    };

    if (email) {
      details.EMAIL = email;
    }
    if (raise) {
      throw new JeevesValidationError('MXN_SPENDLIMIT_NOT_VALID', {
        params: details,
      });
    }
    return res.status(ERROR400).json({
      errors: {
        msg: req.t('MXN_SPENDLIMIT_NOT_VALID', details),
      },
      status: false,
    });
  } else if (parseFt(spendLimit) > parseFt(config.LATAM_MAX_SPEND_LIMIT)) {
    const details = {
      LENGTH: config.LATAM_MAX_SPEND_LIMIT,
      EMAIL: '',
    };

    if (email) {
      details.EMAIL = email;
    }
    if (raise) {
      throw new JeevesValidationError('NON_MXN_SPENDLIMIT_NOT_VALID', {
        params: details,
      });
    }
    return res.status(ERROR400).json({
      errors: {
        msg: req.t('NON_MXN_SPENDLIMIT_NOT_VALID', details),
      },
      status: false,
    });
  }
};

const isCardServiceTypeTutuka = (cardServiceType) =>
  TUTUKA_CARD_SERVICE_TYPES.includes(cardServiceType);

const isCardServiceTypeStripe = (cardServiceType) =>
  STRIPE_CARD_SERVICE_TYPES.includes(cardServiceType);

const isCardServiceTypeMarqeta = (cardServiceType) =>
  MARQETA_CARD_SERVICE_TYPES.includes(cardServiceType);

const isCardServiceTypeMarqetaUS = (cardServiceType) =>
  CARD_SERVICE_TYPE.MARQETA_US === cardServiceType;

const isCardServiceTypeMarqetaCanada = (cardServiceType) =>
  CARD_SERVICE_TYPE.MARQETA_CANADA === cardServiceType ||
  CARD_SERVICE_TYPE.MARQETA_CANADA_USD === cardServiceType;

const hasCardServiceTypeTutuka = (cardServiceTypes) => {
  return arrayUtils.intersectionExists(cardServiceTypes, TUTUKA_CARD_SERVICE_TYPES);
};

const hasCardServiceTypeStripe = (cardServiceTypes) => {
  return arrayUtils.intersectionExists(cardServiceTypes, STRIPE_CARD_SERVICE_TYPES);
};

const hasCardServiceTypeMarqeta = (cardServiceTypes) => {
  return arrayUtils.intersectionExists(cardServiceTypes, MARQETA_CARD_SERVICE_TYPES);
};

const hasCardServiceTypeGalileo = (cardServiceTypes) => {
  return arrayUtils.intersectionExists(cardServiceTypes, [CARD_SERVICE_TYPE.GALILEO]);
};

const isDomesticCountryByCardServiceTypes = (cardServiceTypes, countryCode) => {
  return (cardServiceTypes || []).every(
    (cardServiceType) => COUNTRY_PER_CARD_SERVICE_TYPE[cardServiceType] === countryCode,
  );
};

const getFirstRegionLabelByCardServiceTypes = (cardServiceTypes) => {
  return (cardServiceTypes || []).map((c) => REGION_BY_CARD_SERVICE_TYPE[c]).find((r) => !!r);
};

const isShippingCountryAllowed = (cardServiceType, shippingCountryCode) => {
  const allowedShippingCountries = ALLOWED_SHIPPING_COUNTRIES[cardServiceType];
  return !allowedShippingCountries || allowedShippingCountries.includes(shippingCountryCode);
};

export default {
  getStopReasonLabel,
  isPhysicalCardCreationBlocked,
  validateSpendLimitForTutukaProcessors,
  isSelfFundingSourceCardCreationBlocked,
  isCardServiceTypeTutuka,
  isCardServiceTypeStripe,
  isCardServiceTypeMarqeta,
  isCardServiceTypeMarqetaUS,
  isCardServiceTypeMarqetaCanada,
  hasCardServiceTypeTutuka,
  hasCardServiceTypeStripe,
  hasCardServiceTypeMarqeta,
  hasCardServiceTypeGalileo,
  isDomesticCountryByCardServiceTypes,
  getFirstRegionLabelByCardServiceTypes,
  isShippingCountryAllowed,
};
