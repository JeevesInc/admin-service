const { check, body, query, oneOf } = require('express-validator');
const l10n = require('jm-ez-l10n');
const _ = require('lodash');
const {
  TWO_FACTOR_AUTH_STATUS,
  EXPORT_FILE_TYPE,
  ROLE,
  CARD_HOLDER_REGIONS,
  ROLE_ACCESS_OVERRIDE_TYPE,
} = require('../../../../db').constants;
const validator = require('../../../../helper/validator');
const adminValidator = {};

adminValidator.validateAdmin = () => {
  return [
    body('email', validator.customMessage('isRequired', 'email address')).exists().isString(),
    body('email', l10n.t('INVALID_EMAIL')).isEmail(),
    body('password', validator.customMessage('isRequired', 'password')).exists().isString(),
  ];
};

adminValidator.validateAddSubAdmin = () => {
  return [
    body('firstName', validator.customMessage('isRequired', 'first name')).exists().isString(),
    body('lastName', validator.customMessage('isRequired', 'last name')).exists().isString(),
    body('email', validator.customMessage('isRequired', 'email address')).exists().isString(),
    body('email', l10n.t('INVALID_EMAIL')).isEmail(),
    body('roleId', validator.customMessage('isRequired', 'roleId')).exists().isNumeric(),
  ];
};

adminValidator.validateUpdateModuleAccess = () => {
  return [
    body('modules', validator.customMessage('isRequired', 'modules')).exists(),
    body('modules', validator.customMessage('isArray', 'modules')).isArray(),

    /* last name */
    body('users[*].moduleName', validator.customMessage('isRequired', 'module name')).custom(
      (value) => validator.checkExists(value),
    ),
    body(
      'users[*].moduleAccess',
      validator.customMessage('isBoolean', 'module access'),
    ).isBoolean(),
    body('users[*].editAccess', validator.customMessage('isBoolean', 'edit access')).isBoolean(),
    body('users[*].viewAccess', validator.customMessage('isBoolean', 'view access')).isBoolean(),
    body(
      'users[*].deleteAccess',
      validator.customMessage('isBoolean', 'delete access'),
    ).isBoolean(),
    body(
      'users[*].insertAccess',
      validator.customMessage('isBoolean', 'insert access'),
    ).isBoolean(),
  ];
};

adminValidator.validateApproved2FARequest = () => {
  return [
    body('id', validator.customMessage('isRequired', 'id')).exists(),
    body('status', validator.customMessage('isRequired', 'status')).exists(),
    body('status', validator.customMessage('isIn', 'status')).isIn(
      _.values(TWO_FACTOR_AUTH_STATUS),
    ),
  ];
};

adminValidator.validateEmail = (field) => {
  return check(field).isEmail().withMessage();
};

adminValidator.validateEmpty = (field) => {
  return check(field).isString();
};

adminValidator.validateNumber = (field) => {
  return check(field).isNumeric();
};

adminValidator.validateChangePassword = () => {
  return [
    body('oldPassword', validator.customMessage('isRequired', 'oldPassword')).exists(),
    body('newPassword', validator.customMessage('isRequired', 'newPassword')).exists(),
  ];
};

adminValidator.validateSetPassword = () => {
  return [body('newPassword', validator.customMessage('isRequired', 'newPassword')).exists()];
};

adminValidator.validateUpdateSubAdmin = () => {
  return [
    body('roleId', validator.customMessage('isRequired', 'roleId')).exists().isNumeric(),
    body('roleAccessOverrides', validator.customMessage('isArray', 'roleAccessOverrides'))
      .optional()
      .isArray(),
    body(
      'roleAccessOverrides[*].moduleName',
      validator.customMessage('isRequired', 'moduleName'),
    ).exists(),
    body(
      'roleAccessOverrides[*].overrideType',
      validator.customMessage('isRequired', 'overrideType'),
    ).exists(),
    body(
      'roleAccessOverrides[*].overrideType',
      validator.customMessage('isIn', 'overrideType'),
    ).isIn(_.values(ROLE_ACCESS_OVERRIDE_TYPE)),
  ];
};

adminValidator.validateExportNonUSAddress = () => {
  return [
    query('type', validator.customMessage('isRequired', 'type')).exists(),
    query('type', validator.customMessage('isIn', 'type')).isIn(_.values(EXPORT_FILE_TYPE)),
  ];
};

adminValidator.validateCreditLimit = () => {
  return [
    body('advanceRate', validator.customMessage('isRequired', 'advance rate')).exists().isNumeric(),
    body('creditLimitCap', validator.customMessage('isRequired', 'cradit limit cap'))
      .exists()
      .isNumeric(),
    body('goodStandingBalance', validator.customMessage('isRequired', 'good standing balance'))
      .exists()
      .isNumeric(),
    body('creditCoverageRate', validator.customMessage('isRequired', 'credit coverage rate'))
      .exists()
      .isNumeric(),
    body('region', validator.customMessage('isRequired', 'region')).exists(),
  ];
};

adminValidator.validateSearchAdminUser = () => {
  return [body('filter', validator.customMessage('isRequired', 'filter')).exists()];
};

adminValidator.validateInviteUsers = () => {
  return [
    body('companyId', validator.customMessage('isRequired', 'companyId')).exists(),
    body('users', validator.customMessage('isRequired', 'users')).exists(),
    body('users', validator.customMessage('isArray', 'users')).isArray(),

    /* first name */
    body('users[*].firstName', validator.customMessage('isRequired', 'first name')).custom(
      (value) => validator.checkExists(value),
    ),
    body('users[*].firstName', validator.customMessage('isString', 'first name')).isString(),
    body('users[*].firstName', validator.customMessage('isMatch', 'first name')).matches(
      /^[a-zA-Z -]+$/,
    ),
    body('users[*].firstName', validator.customMessage('isMin', 'first name', 1)).isLength({
      min: 1,
    }),
    body('users[*].firstName', validator.customMessage('isMax', 'first name', 30)).isLength({
      max: 30,
    }),

    /* last name */
    body('users[*].lastName', validator.customMessage('isRequired', 'last name')).custom((value) =>
      validator.checkExists(value),
    ),
    body('users[*].lastName', validator.customMessage('isString', 'last name')).isString(),
    body('users[*].lastName', validator.customMessage('isMatch', 'last name')).matches(
      /^[a-zA-Z -]+$/,
    ),
    body('users[*].lastName', validator.customMessage('isMin', 'last name', 1)).isLength({
      min: 1,
    }),
    body('users[*].lastName', validator.customMessage('isMax', 'last name', 30)).isLength({
      max: 30,
    }),

    // email
    body('users[*].email', validator.customMessage('isEmail', 'email')).isEmail(),
    body('users[*].spendLimit', validator.customMessage('isNegative', 'spend limit')).custom(
      (value) => validator.checkNegativeValue(value),
    ),
  ];
};

adminValidator.validateRole = () => {
  return [
    body('id', validator.customMessage('isRequired', 'user id')).exists().notEmpty(),
    body('role', validator.customMessage('isRequired', 'role')).exists().notEmpty(),
    body('role', validator.customMessage('isIn', 'role')).isIn([
      ROLE.BOOKKEEPER,
      ROLE.ADMIN,
      ROLE.EMPLOYEE,
    ]),
    body('email', l10n.t('INVALID_EMAIL')).optional().isEmail(),
  ];
};

adminValidator.validateEditInviteUsers = () => {
  return [
    /* first name */
    body('firstName', validator.customMessage('isRequired', 'first name')).exists().notEmpty(),
    body('firstName', validator.customMessage('isString', 'first name')).isString(),
    body('firstName', validator.customMessage('isMatch', 'first name')).matches(/^[a-zA-Z -]+$/),
    body('firstName', validator.customMessage('isMin', 'first name', 1)).isLength({ min: 1 }),
    body('firstName', validator.customMessage('isMax', 'first name', 30)).isLength({ max: 30 }),
    /* last name */
    body('lastName', validator.customMessage('isRequired', 'last name')).exists().notEmpty(),
    body('lastName', validator.customMessage('isString', 'last name')).isString(),
    body('lastName', validator.customMessage('isMatch', 'last name')).matches(/^[a-zA-Z -]+$/),
    body('lastName', validator.customMessage('isMin', 'last name', 1)).isLength({ min: 1 }),
    body('lastName', validator.customMessage('isMax', 'last name', 30)).isLength({ max: 30 }),
    body('email', validator.customMessage('isRequired', 'email')).exists().notEmpty(),
    body('inviteId', validator.customMessage('isRequired', 'invitation Id')).exists().notEmpty(),
  ];
};

adminValidator.validateresendMailInviteUsers = () => {
  return [body('id', validator.customMessage('isRequired', 'id')).exists().notEmpty()];
};

adminValidator.validateBlockMerchant = () => {
  return [
    body('transactionId', validator.customMessage('isRequired', 'transaction Id'))
      .exists()
      .isNumeric()
      .notEmpty(),
    body('platform', validator.customMessage('isString', 'platform')).isString(),
    body('platform', validator.customMessage('isIn', 'platform')).isIn(
      _.values(CARD_HOLDER_REGIONS),
    ),
  ];
};

// validate stripe card details
adminValidator.validateUserDetailsForStripeUpdate = () => {
  return [
    body('userId', validator.customMessage('isRequired', 'userId')).exists().notEmpty(),
    body('cardHolderId', validator.customMessage('isRequired', 'cardHolderId')).exists().notEmpty(),
    body('email', validator.customMessage('isRequired', 'email')).exists().notEmpty(),
  ];
};

// validate makeUserLegalRepresentative
adminValidator.makeUserLegalRepresentative = () => {
  return [
    body('userId', validator.customMessage('isRequired', 'userId')).exists().notEmpty().isNumeric(),
    body('companyId', validator.customMessage('isRequired', 'companyId'))
      .exists()
      .notEmpty()
      .isNumeric(),
  ];
};

adminValidator.validateCardUser = () => {
  return [
    body('userId', validator.customMessage('isRequired', 'user id')).optional(),
    body('cardIds', validator.customMessage('isMax', 'card id', 200))
      .optional()
      .isLength({ max: 200 })
      .isArray(),
  ];
};

adminValidator.validateResetMobileLogin = () => {
  return oneOf([
    body('userIds', validator.customMessage('isRequired', 'Array of userId, maximum size 200'))
      .exists()
      .notEmpty()
      .isArray({ min: 0, max: 200 }),
    body(
      'companyIds',
      validator.customMessage('isRequired', 'Array of companyId, maximum size 200'),
    )
      .exists()
      .notEmpty()
      .isArray({ min: 0, max: 200 }),
  ]);
};

module.exports = adminValidator;
