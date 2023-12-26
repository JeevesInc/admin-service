const fs = require('fs');
const { Parser } = require('json2csv');
const json2xls = require('json2xls');
const moment = require('moment');
const _ = require('lodash');
const {
  models: {
    states: statesModel,
    cities: citiesModel,
    country_lookup: countryLookupModel,
    merchants: merchantModel,
    blocked_two_factor_auth_devices: blockedTwoFactorAuthDevicesModel,
    users: usersModel,
  },
} = global;

const {
  randNumber,
  replaceAccents,
  compare,
  hash,
  capitalizeFirstLetter,
  fileDownloadUTCDateTimeToETFormat,
} = require('../../utils');
const {
  LoginRequest,
  LoginResponse,
  jwtUtils,
  RefreshContext,
  RefreshTokenRequest,
  TotpValidationRequest,
} = require('@jeevesinc/jeeves-auth');
const errorHandler = require('../../../../config/errorHandler');
const stripe = require('../../../stripe/stripe');
const stripeEurope = require('../../../stripeEurope/stripe');
const stripeUk = require('../../../stripeUk/stripe');
const galileo = require('../../../galileo/galileo');
const adminService = require('../admin/adminService');
const stripeService = require('../../../stripe/stripeService');
const transactionService = require('../transaction/transactionService');

const userService = require('../../web/user/userService');
const awsUtils = require('../../../../helper/awsUtils');
const {
  SERVERERROR,
  SUCCESSCODE,
  UNAUTHORISED,
  ERROR400,
  ERROR404,
  DATE_FORMAT,
} = require('../../../../constants/common');
const {
  TWO_FACTOR_AUTH_STATUS,
  ADDRESS_SETTINGS_KEYS,
  ADDRESS_REQUEST_STATUS,
  COMPANY_ADDRESS_TYPES,
  EXPORT_FILE_TYPE,
  CARD_SERVICE_TYPE,
  STRIPE_CARDHOLDER_STATUS,
  CARD_HOLDER_REGIONS,
  CRON_ITEM_TYPES,
  CARD_MAIN_STATUS,
  ADMIN_SETTINGS_KEYS,
  STATUS,
  ROLE,
  USER_DETAILS_ADDRESS_TYPES,
  EMBOSSMENT_PROCESS_TYPE,
  CARD_SHIPMENT_APPROVAL_STATUS,
  CARD_TYPES,
  WAITLIST_STATUS,
  STRIPE_STATUS,
  REPLACE_CARD_REQUEST_REASON,
  EMAIL_TYPE,
  TUTUKA_CARD_SERVICE_TYPES,
  MULTIFACTOR_ACTION_CODE_ACTION_TYPE,
} = require('../../../../db').constants;
const companyService = require('../company/companyService');
const cardService = require('../card/cardService');
const cardServiceWeb = require('../../web/card/cardService');
const cardCommonService = require('../../services/cardService');
const adminController = {};

const { DOWNLOAD } = require('../../../../constants/fileUpload');
const { parseFloat } = require('../../../../helper/utils');
const config = require('./config');
const cronService = require('../../../cron/cronService');
const utilsHelper = require('../../../../helper/utils');
const {
  isPhysicalCardCreationBlocked,
  hasCardServiceTypeTutuka,
  hasCardServiceTypeMarqeta,
  hasCardServiceTypeStripe,
  isCardServiceTypeMarqeta,
} = require('../../../../helper/cardUtils');
const {
  JEEVES_ADMIN,
  CARD_SERVICE_TYPE_BY_STRIPE_REGION,
} = require('../../../../constants/commonConstant');
const emailService = require('../../../email/emailService');
const constants = require('../../../../db').constants;
const { formattedDate } = require('../../../../helper/date');
const { logger } = require('../../../../config/logger');
const commonCompanyService = require('../../../common/service/company_service');
const commonService = require('../../web/common/commonService');
const auth = require('../../../../helper/auth');
const multifactorActionAdminService = require('../../../multifactorActionAdmin/multifactorActionAdminService');
const commonUserService = require('../../../common/service/userService');
const userCardService = require('../../web/user/userCardService');
const tutukaLocal = require('../../../tutuka/localAPIs/tutukaLocal');
const { JeevesValidationError } = require('../../../../constants/errors');
const stripeCardholderService = require('../../services/stripe/stripeCardholderService');
const stripeFacadeService = require('../../../../services/stripeFacadeService');

// login
adminController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const auditData = commonService.createAuditDataPayload(req);

    logger.info(`admin login email[${email}] >>> ${JSON.stringify(auditData)}`);

    const loginRequest = LoginRequest.builder()
      .withEmail(email)
      .withPassword(password)
      .withAuditData(auditData)
      .build();

    const axiosResponse = await auth.callAuthenticationService('/login-admin', loginRequest);

    const loginResponse = LoginResponse.builder().fromPayload(axiosResponse.data).build();

    if (!loginResponse) {
      throw new Error('loginResponse is void');
    }

    if (loginResponse.isSuccess) {
      if (loginResponse.requiresTwoFactorVerify) {
        logger.info(
          `creation of multifactor token for adminId ${loginResponse.userId} for action ${MULTIFACTOR_ACTION_CODE_ACTION_TYPE.ADMIN_LOGIN}`,
        );

        await multifactorActionAdminService.createMultifactorTokenForOperation(
          loginResponse.userId,
          MULTIFACTOR_ACTION_CODE_ACTION_TYPE.ADMIN_LOGIN,
        );

        return res.status(SUCCESSCODE.STANDARD).json({
          msg: req.t('SUCCESS'),
          data: {
            requiresTwoFactorVerify: true,
            adminId: loginResponse.userId,
          },
          status: true,
        });
      } else {
        const adminData = await adminService.getAdminDetailByIdOrEmail(email);
        adminData.secretToken = loginResponse.token;
        adminData.refreshToken = loginResponse.refreshToken;
        delete adminData.password;
        delete adminData.roleAccessOverrides;
        return res.status(SUCCESSCODE.STANDARD).json({
          msg: req.t('LOGIN_SUCCESS'),
          data: adminData,
          status: true,
        });
      }
    }

    return res.status(UNAUTHORISED.CODE).json({
      errors: { msg: req.t('EMAIL_PASSWORD_MISMATCH') },
      status: false,
    });
  } catch (e) {
    logger.error(`Error at admin login ${e} >>> ${e.stack}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
}; //login

adminController.verifyLogin = async (req, res) => {
  try {
    const { otp, adminId } = req.body;

    const auditData = commonService.createAuditDataPayload(req);

    const totpValidationRequest = TotpValidationRequest.builder()
      .withAuditData(auditData)
      .withOtp(otp)
      .withUserId(adminId)
      .build();

    const axiosResponse = await auth.callAuthenticationService(
      '/verify-login-admin',
      totpValidationRequest,
    );

    const loginResponse = LoginResponse.builder().fromPayload(axiosResponse.data).build();

    if (!loginResponse) {
      throw new Error('loginResponse is void');
    }

    if (loginResponse.isSuccess) {
      const adminData = await adminService.getAdminDetailByIdOrEmail(adminId);
      adminData.secretToken = loginResponse.token;
      adminData.refreshToken = loginResponse.refreshToken;
      delete adminData.password;
      delete adminData.roleAccessOverrides;
      await multifactorActionAdminService.invalidateAllActiveMFACodeRequestsForAdmin(
        adminId,
        MULTIFACTOR_ACTION_CODE_ACTION_TYPE.ADMIN_LOGIN,
      );
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('LOGIN_SUCCESS'),
        data: adminData,
        status: true,
      });
    } else {
      const code = loginResponse?.message;

      let msg = req.t(code);
      if (msg instanceof Error) {
        msg = req.t(SERVERERROR.MESSAGE);
      }

      logger.info(`verify login admin failed adminId[${adminId}]  code[${code}] msg[${msg}]`);
      return res.status(loginResponse.errorCode || SERVERERROR.CODE).json({
        errors: { msg },
        status: false,
      });
    }
  } catch (error) {
    logger.error(`Error at adminController.verifyLogin: ${error} >> ${error.stack}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// refresh
adminController.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwtUtils.verify(refreshToken, logger);

    if (decoded) {
      const context = RefreshContext.builder().fromJWTPayload(decoded).build();

      const tokenRequest = RefreshTokenRequest.builder()
        .withEmail(context.email)
        .withSessionId(context.sessionId)
        .build();

      const axiosResponse = await auth.callAuthenticationService('/refresh-admin', tokenRequest);

      const refreshResponse = LoginResponse.builder().fromPayload(axiosResponse.data).build();

      if (refreshResponse?.token) {
        return res.status(SUCCESSCODE.STANDARD).json({
          msg: req.t('SUCCESS'),
          data: { secretToken: refreshResponse.token },
          status: true,
        });
      }
    }
  } catch (e) {
    logger.warn(`Problem during refresh admin ${e} >>> ${e.stack}`);
  }
  return res.status(UNAUTHORISED.CODE).json({
    errors: { msg: req.t(UNAUTHORISED.MESSAGE) },
    status: false,
  });
};

// logout
adminController.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwtUtils.verify(refreshToken, logger);

    if (decoded) {
      const context = RefreshContext.builder().fromJWTPayload(decoded).build();

      const tokenRequest = RefreshTokenRequest.builder()
        .withEmail(context.email)
        .withSessionId(context.sessionId)
        .build();

      const axiosResponse = await auth.callAuthenticationService('/logout', tokenRequest);

      LoginResponse.builder().fromPayload(axiosResponse.data).build();

      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        status: true,
      });
    }
  } catch (e) {
    logger.warn(`Problem during logout ${e} >>> ${e.stack}`);
  }
  return res.status(ERROR400).json({
    errors: { msg: req.t('ERROR') },
    status: false,
  });
};

adminController.forgotPassword = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'forgotPassword',
  });
  try {
    const { email } = req.body;
    const admin = await adminService.getAdminByEmail(email);
    if (!_.empty(admin)) {
      const forgotPasswordToken = randNumber();
      const updateQuery = { where: { email: email } };
      const updateData = {
        resetPasswordToken: forgotPasswordToken,
        resetPasswordExpiresIn: Date.now() + config.RESETPASSEXPIRES,
      };
      await adminService.updateAdmin(updateData, updateQuery);
      // send reset password link
      const emailbody = {
        firstName: admin.firstName,
        link: config.RESETPASSURLADMIN + '/' + forgotPasswordToken,
        email: admin.email,
      };
      // awsUtils.sendEmail('FORGOT_PASSWORD', emailbody, (err, isEmailSent) => {
      emailService.sendEmail(
        constants.EMAIL_TYPE.FORGOT_PASSWORD,
        emailbody,
        (err, isEmailSent) => {
          if (isEmailSent) {
            return res.status(SUCCESSCODE.STANDARD).json({
              msg: req.t('FORGOT_MESSAGE'),
              status: true,
            });
          } else {
            return res.status(SERVERERROR.CODE).json({
              errors: { msg: req.t(SERVERERROR.MESSAGE) },
              status: false,
            });
          }
        },
      );
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at forgotPassword ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// reset password
adminController.resetPassword = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'resetPassword',
  });
  try {
    const {
      params: { token },
      body: { newPassword: password },
    } = req;
    const admin = await adminService.getAdmin({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresIn: {
          [Op.gt]: Date.now().toString(),
        },
      },
    });
    if (!admin) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('RESET_PASSWORD_TOKEN_EXPIRED') },
        status: false,
      });
    } else {
      const hashPassword = hash(password);
      const updateQuery = { where: { id: admin.id } };
      const updateData = {
        password: hashPassword,
        resetPasswordToken: null,
        resetPasswordExpiresIn: null,
      };
      await adminService.updateAdmin(updateData, updateQuery);
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('PASSWORD_RESET'),
        status: true,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at resetPassword ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*
    @url POST /v2/admin/change-password
    @description to change password of admin
*/
adminController.changePassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword },
    authAdmin: { id: adminId },
  } = req;
  try {
    logger.info(`changePassword admin [${adminId}]`);
    const whereClause = { where: { id: adminId } };
    const admin = await adminService.getAdmin(whereClause);
    const passwordHash = admin.password;
    if (oldPassword === newPassword) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('ERR_NEW_PASSWORD_SAME_AS_OLD') },
        status: false,
      });
    }
    if (compare(oldPassword, passwordHash)) {
      const hashPassword = hash(newPassword);
      const updateData = { password: hashPassword };
      await adminService.updateAdmin(updateData, whereClause);
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('PASSWORD_CHANGED'),
        status: true,
      });
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t('ERR_INVALID_CURRENT_PASSWORD') },
        status: false,
      });
    }
  } catch (error) {
    logger.error(`Error at admin changePassword adminId[${adminId}] ${error} >>> ${error.stack}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// get 2FA configure requests
adminController.get2FAConfigureRequests = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'get2FAConfigureRequests',
  });
  try {
    const {
      body: { page, filter, role, status },
      countryFilter,
    } = req;
    const limit = config.MAX_RECORDS;
    let skip = 0;
    if (page && page > 0) {
      skip = +page * limit;
    }
    const configurations = await adminService.get2FAConfigureRequests(
      countryFilter,
      +skip,
      +limit,
      filter,
      role,
      status,
    );

    const response = {
      requests: configurations ? configurations.requests : [],
      total: configurations ? configurations.total : 0,
      pages: 1,
      pageSize: limit,
    };
    if (configurations && configurations.total > 0) {
      response.pages = Math.ceil(configurations.total / limit);
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at get2FAConfigureRequests ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// approved 2FA configure request
adminController.approved2FAConfigureRequest = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'approved2FAConfigureRequest',
  });
  try {
    const { id, userId } = req.body;
    const user = await adminService.findOneUser({
      where: { id: userId },
      attributes: ['id', 'firstName', 'email'],
    });
    if (user) {
      await adminService.updateUser(
        { isTwoFactorAuth: false, blockedTwoFactorAuth: null },
        { where: { id: userId } },
      );
      await adminService.update2FAConfigurations(
        { status: TWO_FACTOR_AUTH_STATUS.APPROVED },
        { where: { id: id } },
      );
      // send approved 2FA configure request
      const emailbody = {
        firstName: user.firstName,
        link: config.LOGINURL,
        email: user.email,
      };
      // awsUtils.sendEmail('APPROVED_TWO_FACTOR_AUTHENTICATION_RE_CONFIGURATION_REQUEST', emailbody, (err, isEmailSent) => {
      emailService.sendEmail(
        constants.EMAIL_TYPE.APPROVED_TWO_FACTOR_AUTHENTICATION_RE_CONFIGURATION_REQUEST,
        emailbody,
        (err, isEmailSent) => {
          if (err) {
            console.log('Email could not be sent', err);
          }
          if (isEmailSent) {
            console.log('Email sent successfully', isEmailSent);
          }
          return true;
        },
      );
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('USER_2FA_RECONFIGURATION_REQUEST_APPROVED'),
        status: true,
      });
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t('NO_RECORDS_FOUND') },
        status: false,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at approved2FAConfigureRequest ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

adminController.reconfigure2FARequest = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'reconfigure2FARequest',
  });
  try {
    const { userIdOrEmail } = req.body;

    const user = await adminService.findOneUser({
      where: {
        [Op.or]: [{ id: userIdOrEmail }, { email: userIdOrEmail }],
      },
      attributes: ['id', 'firstName', 'email'],
    });

    if (!user) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('NO_RECORDS_FOUND') },
        status: false,
      });
    }

    await adminService.updateUser(
      { isTwoFactorAuth: false, blockedTwoFactorAuth: null },
      { where: { id: user.id } },
    );

    // [ONB-573] cleanup all registered devices
    await blockedTwoFactorAuthDevicesModel.destroy({
      where: { userId: user.id },
    });

    await userService.create2FAConfigurationRequest({
      userId: user.id,
      status: TWO_FACTOR_AUTH_STATUS.APPROVED,
    });

    // send approved 2FA configure request
    const emailbody = {
      firstName: user.firstName,
      link: config.LOGINURL,
      email: user.email,
    };
    emailService.sendEmail(
      constants.EMAIL_TYPE.APPROVED_TWO_FACTOR_AUTHENTICATION_RE_CONFIGURATION_REQUEST,
      emailbody,
    );
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('USER_2FA_RECONFIGURED'),
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at reconfigure2FARequest ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// get admin settings
adminController.getAdminSettings = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getAdminSettings',
  });
  try {
    const response = await adminService.getAdminSettings();
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getAdminSettings ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// edit admin setting
adminController.editAdminSettings = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'editAdminSettings',
  });
  try {
    const requestData = req.body;
    let tempObj = {
      TOUPUP_AMOUNT_MUST_BE_GREATER: false,
      inValidAmount: false,
      inValidAmountDefaultSpreadRate: false,
    };
    let isUpdated = {};
    const config = [
      'STRIPE_US_TOP_UP_AMOUNT',
      'STRIPE_US_THRESHOLD_AMOUNT',
      'STRIPE_UK_TOP_UP_AMOUNT',
      'STRIPE_UK_THRESHOLD_AMOUNT',
      'STRIPE_EUR_TOP_UP_AMOUNT',
      'STRIPE_EUR_THRESHOLD_AMOUNT',
    ];

    // Get admin settings for settingKey.
    const raw = true;
    const configurations = await adminService.getAdminSettings(raw);

    // Validations for top-up & threshold amount.
    // Top-up amounts & threshold amounts must be numeric & greater than 0. And top-up amount must be greater than threshold amount.
    checkConfigurations: for (let i = 0; i < configurations.length; i++) {
      const value = configurations[i];
      const currentIndex = requestData.findIndex((data) => data.id === value.id);
      if (config.includes(value.settingKey) && currentIndex >= 0) {
        if (
          isNaN(requestData[currentIndex].value) ||
          parseFloat(requestData[currentIndex].value) <= 0
        ) {
          tempObj['inValidAmount'] = true;
          tempObj.param = value.settingKey;
          break checkConfigurations;
        }

        switch (value.settingKey) {
          case 'STRIPE_US_TOP_UP_AMOUNT': {
            const index = configurations.findIndex(
              (data) => data.settingKey === 'STRIPE_US_THRESHOLD_AMOUNT',
            );
            const thresHoldAmountIndex = requestData.findIndex(
              (data) => data.id === configurations[index].id,
            );
            if (requestData[currentIndex].value < requestData[thresHoldAmountIndex].value) {
              tempObj['TOUPUP_AMOUNT_MUST_BE_GREATER'] = true;
            }
            break;
          }

          case 'STRIPE_UK_TOP_UP_AMOUNT': {
            const index = configurations.findIndex(
              (data) => data.settingKey === 'STRIPE_UK_THRESHOLD_AMOUNT',
            );
            requestData.findIndex((data) => data.id === configurations[index].id);
            /*if (requestData[currentIndex].value < requestData[thresHoldAmountIndex].value) {
                                tempObj["TOUPUP_AMOUNT_MUST_BE_GREATER"] = true;
                            }*/
            break;
          }

          case 'STRIPE_EUR_TOP_UP_AMOUNT': {
            const index = configurations.findIndex(
              (data) => data.settingKey === 'STRIPE_EUR_THRESHOLD_AMOUNT',
            );
            requestData.findIndex((data) => data.id === configurations[index].id);
            /*if (requestData[currentIndex].value < requestData[thresHoldAmountIndex].value) {
                                tempObj["TOUPUP_AMOUNT_MUST_BE_GREATER"] = true;
                            }*/
            break;
          }
          default:
            break;
        }

        if (tempObj['TOUPUP_AMOUNT_MUST_BE_GREATER']) {
          break checkConfigurations;
        }
      } else {
        if (value.settingKey == 'DEFAULT_SPREAD_RATE') {
          if (
            _.empty(requestData[currentIndex].value) ||
            isNaN(requestData[currentIndex].value) ||
            parseFloat(requestData[currentIndex].value) < 0 ||
            parseFloat(requestData[currentIndex].value) > 100
          ) {
            tempObj['inValidAmountDefaultSpreadRate'] = true;
            break;
          } else {
            requestData[currentIndex].value = parseFloat(requestData[currentIndex].value);
          }
        }
      }
    }

    if (tempObj.TOUPUP_AMOUNT_MUST_BE_GREATER || tempObj.inValidAmount) {
      const key = tempObj.inValidAmount
        ? 'TOPUP_AMOUNT_AND_THRESHOLD_AMOUNT_NUMERIC'
        : 'TOUPUP_AMOUNT_MUST_BE_GREATER';
      return res.status(ERROR400).json({
        errors: { msg: req.t(key) },
        status: false,
      });
    } else if (tempObj.inValidAmountDefaultSpreadRate) {
      return res.status(SERVERERROR.CODE).json({
        errors: { msg: req.t('INVALID_SPREAD_RATES_VALUE') },
        status: false,
      });
    }

    delete tempObj.inValidAmount;
    delete tempObj.TOUPUP_AMOUNT_MUST_BE_GREATER;
    delete tempObj.inValidAmountDefaultSpreadRate;

    for (var key in requestData) {
      tempObj = requestData[key];
      isUpdated = await adminService.updateAdminSettings(
        { settingValue: tempObj.value },
        { where: { id: tempObj.id } },
      );
    }

    if (isUpdated) {
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t('NO_RECORDS_FOUND') },
        status: false,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at editAdminSettings ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// get specific admin setting
adminController.getSpecificAdminSetting = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getSpecificAdminSetting',
  });
  try {
    const { settingKey } = req.body;

    if (_.empty(settingKey)) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('FIELD_REQUIRED', { FIELD: 'settingKey' }) },
        status: false,
      });
    }

    const response = await companyService.findOneAdminSetting({
      where: {
        settingKey: settingKey,
      },
      attributes: ['id', 'settingKey', 'settingValue', 'settingDescription'],
    });
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data:
        response && response.dataValues && Object.hasOwn(response.dataValues, 'settingValue')
          ? response
          : [],
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getSpecificAdminSetting ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// change version
adminController.editVersion = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'editVersion',
  });
  try {
    const { minimumVersion, stableVersion, id } = req.body;
    const isUpdated = adminService.updateVersion(minimumVersion, stableVersion, id);
    if (isUpdated) {
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t('NO_RECORDS_FOUND') },
        status: false,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at editVersion ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get versions */
adminController.getVersions = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getVersions',
  });
  try {
    const response = await adminService.getAllVersion();
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getVersions ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get jeeves and jeeves card shipment address */
adminController.getAddress = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getAddress',
  });
  try {
    const response = await adminService.getAddress({
      where: {
        name: {
          [Op.in]: [
            ADDRESS_SETTINGS_KEYS.JEEVES_ADDRESS,
            ADDRESS_SETTINGS_KEYS.JEEVES_CARD_SHIPMENT_ADDRESS,
            ADDRESS_SETTINGS_KEYS.JEEVES_ADDRESS_UK,
            ADDRESS_SETTINGS_KEYS.JEEVES_CARD_SHIPMENT_ADDRESS_UK,
            ADDRESS_SETTINGS_KEYS.JEEVES_ADDRESS_EUROPE,
            ADDRESS_SETTINGS_KEYS.JEEVES_CARD_SHIPMENT_ADDRESS_EUROPE,
          ],
        },
      },
      include: [
        {
          model: statesModel,
          attributes: ['id', 'countryID', 'stateName', 'stateCode'],
        },
        { model: citiesModel, attributes: ['id', 'cityName'] },
        {
          model: countryLookupModel,
          attributes: ['numericCode', 'alpha2Code', 'name'],
        },
      ],
    });
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at getAddress ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* update jeeves address */
adminController.updateAddress = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'updateAddress',
  });
  try {
    const {
      body: { addressType, address1, address2, zipcode, countryCode },
      stateId,
      cityId,
    } = req;
    const updateData = {
      address1: replaceAccents(address1),
      address2: replaceAccents(address2),
      stateId: stateId,
      cityId: cityId,
      zipcode: zipcode,
      countryCode: countryCode,
    };

    const isValidAddressType = [
      ADDRESS_SETTINGS_KEYS.JEEVES_ADDRESS,
      ADDRESS_SETTINGS_KEYS.JEEVES_CARD_SHIPMENT_ADDRESS,
      ADDRESS_SETTINGS_KEYS.JEEVES_ADDRESS_UK,
      ADDRESS_SETTINGS_KEYS.JEEVES_CARD_SHIPMENT_ADDRESS_UK,
      ADDRESS_SETTINGS_KEYS.JEEVES_ADDRESS_EUROPE,
      ADDRESS_SETTINGS_KEYS.JEEVES_CARD_SHIPMENT_ADDRESS_EUROPE,
    ].includes(addressType);
    if (isValidAddressType) {
      await adminService.updateAddress(updateData, {
        where: {
          name: addressType,
        },
      });
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t(SERVERERROR.MESSAGE) },
        status: false,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at updateAddress ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get address change requests */
adminController.getAddressChangeRequests = async (req, res) => {
  logger.info('getAddressChangeRequests');
  try {
    const {
      body: { page, sortBy, sortDirection, search },
      countryFilter,
    } = req;
    const limit = config.MAX_RECORDS;
    let skip = 0;
    if (page && page > 0) {
      skip = +page * limit;
    }
    const data = await adminService.getAddressChangeRequests(
      search,
      +skip,
      +limit,
      countryFilter,
      sortBy,
      sortDirection,
    );
    const response = {
      addressRequestData: data ? data.data : [],
      total: data ? data.total : 0,
      pages: 1,
      pageSize: limit,
    };
    if (data && data.total > 0) {
      response.pages = Math.ceil(data.total / limit);
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.error(`Error at getAddressChangeRequests ${error}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* send email to admin for update address */
async function sendEmailToAdminForUpdateAddress(
  physicalCard,
  addressChangeRequestDetails,
  updateAccountRes,
) {
  logger.log({
    level: 'info',
    message: 'sendEmailToAdminForUpdateAddress()',
  });
  try {
    // send email to admin
    const emailbody = {
      email: config.ADMIN_EMAIL,
      PRN: physicalCard ? physicalCard.PRN : '',
      organization:
        addressChangeRequestDetails && addressChangeRequestDetails.company
          ? addressChangeRequestDetails.company.name
          : '',
      userId: addressChangeRequestDetails.user.id,
      firstName: addressChangeRequestDetails.user.firstName,
      userEmail: addressChangeRequestDetails.user.email,
      address1: addressChangeRequestDetails.address1,
      address2: addressChangeRequestDetails.address2 ? addressChangeRequestDetails.address2 : '-',
      city: addressChangeRequestDetails.city ? addressChangeRequestDetails.city.cityName : '',
      state: addressChangeRequestDetails.state ? addressChangeRequestDetails.state.stateName : '',
      zipcode: addressChangeRequestDetails.zipcode ? addressChangeRequestDetails.zipcode : '',
    };

    if (updateAccountRes && updateAccountRes.customer_profile) {
      /* added galileo address */
      emailbody.galileoFirstName = updateAccountRes.customer_profile.first_name
        ? updateAccountRes.customer_profile.first_name
        : '';
      emailbody.galileoAddress1 = updateAccountRes.customer_profile.address_1
        ? updateAccountRes.customer_profile.address_1
        : '';
      emailbody.galileoAddress2 = updateAccountRes.customer_profile.address_2
        ? updateAccountRes.customer_profile.address_2
        : '';
      emailbody.galileoCity = updateAccountRes.customer_profile.city
        ? updateAccountRes.customer_profile.city
        : '';
      emailbody.galileoState = updateAccountRes.customer_profile.state
        ? updateAccountRes.customer_profile.state
        : '';
      emailbody.galileoZipcode = updateAccountRes.customer_profile.postal_code
        ? updateAccountRes.customer_profile.postal_code
        : '';
      emailbody.galileoCountryCode = updateAccountRes.customer_profile.country_code
        ? updateAccountRes.customer_profile.country_code
        : '';
      /* added galileo shipment address */
      emailbody.galileoShipmentAddress1 = updateAccountRes.customer_profile.ship_to_address
        .address_1
        ? updateAccountRes.customer_profile.ship_to_address.address_1
        : '';
      emailbody.galileoShipmentAddress2 = updateAccountRes.customer_profile.ship_to_address
        .address_2
        ? updateAccountRes.customer_profile.ship_to_address.address_2
        : '';
      emailbody.galileoShipmentCity = updateAccountRes.customer_profile.ship_to_address.city
        ? updateAccountRes.customer_profile.ship_to_address.city
        : '';
      emailbody.galileoShipmentState = updateAccountRes.customer_profile.ship_to_address.state
        ? updateAccountRes.customer_profile.ship_to_address.state
        : '';
      emailbody.galileoShipmentZipcode = updateAccountRes.customer_profile.ship_to_address
        .postal_code
        ? updateAccountRes.customer_profile.ship_to_address.postal_code
        : '';
      emailbody.galileoShipmentCountryCode = updateAccountRes.customer_profile.ship_to_address
        .country_code
        ? updateAccountRes.customer_profile.ship_to_address.country_code
        : '';
    }

    // awsUtils.sendEmail('UPDATE_MAILING_ADDRESS', emailbody, (err, isEmailSent) => {
    emailService.sendEmail(
      constants.EMAIL_TYPE.UPDATE_MAILING_ADDRESS,
      emailbody,
      (err, isEmailSent) => {
        if (isEmailSent) {
          console.log('Email sent successfully', isEmailSent);
        }
      },
    );
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at sendEmailToAdminForUpdateAddress() ' + error,
    });
    return {
      status: false,
    };
  }
}

/* send email to admin for update stripe profile address */
async function sendEmailToAdminForUpdateStripeProfileAddress(
  addressChangeRequestDetails,
  updateAccountRes,
) {
  logger.log({
    level: 'info',
    message: 'sendEmailToAdminForUpdateStripeProfileAddress()',
  });
  try {
    // send email to admin
    const emailbody = {
      email: config.ADMIN_EMAIL,
      organization:
        addressChangeRequestDetails && addressChangeRequestDetails.company
          ? addressChangeRequestDetails.company.name
          : '',
      userId: addressChangeRequestDetails.user.id,
      firstName: addressChangeRequestDetails.user.firstName,
      userEmail: addressChangeRequestDetails.user.email,
      address1: addressChangeRequestDetails.address1,
      address2: addressChangeRequestDetails.address2 ? addressChangeRequestDetails.address2 : '-',
      city: addressChangeRequestDetails.city ? addressChangeRequestDetails.city.cityName : '',
      state: addressChangeRequestDetails.state ? addressChangeRequestDetails.state.stateName : '',
      zipcode: addressChangeRequestDetails.zipcode ? addressChangeRequestDetails.zipcode : '',
    };

    if (updateAccountRes && updateAccountRes.billing && updateAccountRes.billing.address) {
      /* added stripe address */
      emailbody.stripeAddress1 = updateAccountRes.billing.address.line1
        ? updateAccountRes.billing.address.line1
        : '';
      emailbody.stripeAddress2 = updateAccountRes.billing.address.line2
        ? updateAccountRes.billing.address.line2
        : '';
      emailbody.stripeCity = updateAccountRes.billing.address.city
        ? updateAccountRes.billing.address.city
        : '';
      emailbody.stripeState = updateAccountRes.billing.address.state
        ? updateAccountRes.billing.address.state
        : '';
      emailbody.stripeZipcode = updateAccountRes.billing.address.postal_code
        ? updateAccountRes.billing.address.postal_code
        : '';
      emailbody.stripeCountryCode = updateAccountRes.billing.address.country
        ? updateAccountRes.billing.address.country
        : '';
    }

    // awsUtils.sendEmail('UPDATE_STRIPE_PROFILE_ADDRESS', emailbody, (err, isEmailSent) => {
    emailService.sendEmail(
      constants.EMAIL_TYPE.UPDATE_STRIPE_PROFILE_ADDRESS,
      emailbody,
      (err, isEmailSent) => {
        if (isEmailSent) {
          console.log('Email sent successfully', isEmailSent);
        }
      },
    );
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at sendEmailToAdminForUpdateStripeProfileAddress() ' + error,
    });
    return {
      status: false,
    };
  }
}

/* update user account address, update card holder address for stripe, update all card address for galileo */
async function updateUserDetailsAndCardAddress(addressChangeRequestDetails) {
  logger.log({
    level: 'info',
    message: 'updateUserDetailsAndCardAddress()',
  });
  try {
    const usersRes = await adminService.findUsersWithUserDetailsById(
      addressChangeRequestDetails.companyId,
      addressChangeRequestDetails.user.id,
      addressChangeRequestDetails.user.role,
    );
    for (const element of usersRes) {
      /* update user address according to request */
      await adminService.updateUserDetails(
        {
          address1: addressChangeRequestDetails.address1,
          address2: addressChangeRequestDetails.address2,
          stateId: addressChangeRequestDetails.state.id,
          cityId: addressChangeRequestDetails.city.id,
          zipcode: addressChangeRequestDetails.zipcode,
          countryCode: addressChangeRequestDetails.countryCode,
        },
        {
          where: {
            id: element.user_details[0].id,
          },
        },
      );

      const stripeCardholders = element.userCardHolders || [];
      for (const userCardholder of stripeCardholders) {
        /* update cardholder address on stripe */
        if (
          userCardholder?.cardHolderId &&
          userCardholder.cardHolderStatus === STRIPE_CARDHOLDER_STATUS.ACTIVE
        ) {
          /* update card holder address */
          const cardholderUpdateData = {
            billing: {
              address: {
                line1: addressChangeRequestDetails.address1,
                city:
                  addressChangeRequestDetails.city && addressChangeRequestDetails.city.cityName
                    ? addressChangeRequestDetails.city.cityName
                    : null,
                state:
                  addressChangeRequestDetails.state && addressChangeRequestDetails.state.stateCode
                    ? addressChangeRequestDetails.state.stateCode
                    : null,
                postal_code: addressChangeRequestDetails.zipcode
                  ? addressChangeRequestDetails.zipcode
                  : null,
                country:
                  addressChangeRequestDetails.country_lookup &&
                  addressChangeRequestDetails.country_lookup.alpha2Code
                    ? await adminService.getValidCountryCode(
                        addressChangeRequestDetails.country_lookup.alpha2Code,
                      )
                    : null,
              },
            },
          };
          if (
            addressChangeRequestDetails.address2 &&
            addressChangeRequestDetails.address2.trim() != ''
          ) {
            cardholderUpdateData.billing.address.line2 = addressChangeRequestDetails.address2;
          }
          if (userCardholder.cardServiceTypes === CARD_HOLDER_REGIONS.US) {
            await stripe.updateCardholderData(cardholderUpdateData, userCardholder.cardHolderId);
          } else if (userCardholder.cardServiceTypes === CARD_HOLDER_REGIONS.UK) {
            await stripeUk.updateCardholderData(cardholderUpdateData, userCardholder.cardHolderId);
          } else if (userCardholder.cardServiceTypes === CARD_HOLDER_REGIONS.EUR) {
            await stripeEurope.updateCardholderData(
              cardholderUpdateData,
              userCardholder.cardHolderId,
            );
          }
        }
      }

      /* update cards address on galileo */
      const cards = await cardService.getCardsByUserId(element.id);
      if (cards && cards.length > 0) {
        let sqsUserDetail = {};
        for (const card of cards) {
          if (card && card.cardServiceType === CARD_SERVICE_TYPE.GALILEO) {
            sqsUserDetail = {
              PRN: card.PRN,
              firstName: element.firstName ? element.firstName : null,
              lastName: element.lastName ? element.lastName : null,
              address1: addressChangeRequestDetails.address1,
              city:
                addressChangeRequestDetails.city && addressChangeRequestDetails.city.cityName
                  ? addressChangeRequestDetails.city.cityName
                  : null,
              state:
                addressChangeRequestDetails.state && addressChangeRequestDetails.state.stateCode
                  ? addressChangeRequestDetails.state.stateCode
                  : null,
              postalCode: addressChangeRequestDetails.zipcode
                ? addressChangeRequestDetails.zipcode
                : null,
              countryCode: addressChangeRequestDetails.countryCode
                ? addressChangeRequestDetails.countryCode
                : null,
              userId: element.id.toString(),
            };

            // suppose address2 not found then update as hyphen
            if (
              !addressChangeRequestDetails.address2 ||
              addressChangeRequestDetails.address2 === '' ||
              addressChangeRequestDetails.address2.trim() === ''
            ) {
              sqsUserDetail.address2 = '-';
            } else {
              sqsUserDetail.address2 = addressChangeRequestDetails.address2;
            }
            // send queue message
            awsUtils.sendMessageToSqs(sqsUserDetail, (error, isMessageSent) => {
              if (error) {
                console.log('Queue message could not be sent', error);
              }
              if (isMessageSent) {
                console.log('Queue message sent successfully', isMessageSent);
              }
            });
          }
        }
      }
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at updateUserDetailsAndCardAddress() ' + error,
    });
    return {
      status: false,
    };
  }
}

/*
    @url GET /v2/admin/non-us-address
    @description to get users with non US, UK and EUR address list
*/
adminController.getNonUsUkEurAddressList = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getNonUsUkEurAddressList',
  });
  try {
    const {
      query: { page, sortBy, sortDirection, ...filterParams },
      countryFilter,
    } = req;
    const limit = config.MAX_RECORDS;
    let skip = 0;
    if (page && page > 0) {
      skip = +page * limit;
    }
    const data = await adminService.getNonUsUkEurAddressList(
      filterParams,
      +skip,
      +limit,
      countryFilter,
      sortBy,
      sortDirection,
    );
    const response = {
      usersNonUSAddressData: data ? data.data : [],
      total: data ? data.total : 0,
      pages: 1,
      pageSize: limit,
    };
    if (data && data.total > 0) {
      response.pages = Math.ceil(data.total / limit);
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at getNonUsUkEurAddressList ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*
    @url GET /v2/admin/export-non-us-address
    @description to export users with non US, UK and EUR address list
*/
adminController.exportNonUsUkEurAddressList = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'exportNonUsUkEurAddressList',
  });
  try {
    const {
      query: { type, ...filterParams },
      countryFilter,
    } = req;
    const fields = [
      'Organization Id',
      'Reference Id',
      'Organization Name',
      'Card Service Type',
      'User Id',
      'User Name',
      'Email',
      'Phone Number',
      'User Role',
      'First Name',
      'Last Name',
      'Address 1',
      'Address 2',
      'City',
      'State',
      'Country',
      'Zip Code',
      'Created At',
    ];
    const data = await adminService.getNonUsUkEurAddressList(filterParams, countryFilter);
    const nonUSAddressData = data.data;
    if (nonUSAddressData.length <= 0) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('NO_RECORDS_FOUND') },
        status: false,
      });
    }
    const exportData = [];
    if (type === EXPORT_FILE_TYPE.CSV || type === EXPORT_FILE_TYPE.EXCEL) {
      nonUSAddressData.forEach((element) => {
        exportData.push({
          'Organization Id': element.companyId || '',
          'Reference Id': element.referenceId || '',
          'Organization Name': element.companyName || '',
          'Card Service Type': element.cardServiceType || '',
          'User Id': element.userId || '',
          'User Name': `${element.userFirstName || ''} ${element.userLastName || ''}`,
          Email: element.userEmail || '',
          'Phone Number': element.userPhoneNumber || '',
          'User Role': element.role ? capitalizeFirstLetter(element.role) : '',
          'First Name': element.shipToUserFirstName || '',
          'Last Name': element.shipToUserLastName || '',
          'Address 1': element.shipToAddress1 || '',
          'Address 2': element.shipToAddress2 || '',
          City: element.shipToCity || '',
          State: element.shipToState || '',
          Country: element.shipToCountry || '',
          'Zip Code': element.shipToZipCode || '',
          'Created At': element.createdAt
            ? `${fileDownloadUTCDateTimeToETFormat(element.createdAt)} ET`
            : '',
        });
      });
    }
    if (type === EXPORT_FILE_TYPE.CSV) {
      const json2csvParser = new Parser({ fields: fields });
      const csv = json2csvParser.parse(exportData);
      const originalFilename = `Users_with_non_US_UK_EUR_address_${Date.now()}.csv`;
      const key = `${DOWNLOAD}${originalFilename}`;
      const uploaded = await awsUtils.uploadExportFile(csv, key);
      return res.status(SUCCESSCODE.STANDARD).json({
        data: { url: uploaded.url },
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else if (type === EXPORT_FILE_TYPE.EXCEL) {
      const originalFilename = `Users_with_non_US_UK_EUR_address_${Date.now()}.xlsx`;
      const xls = json2xls(exportData, {
        fields: fields,
      });
      const key = `${DOWNLOAD}${originalFilename}`;
      fs.writeFileSync(originalFilename, xls, 'binary');
      const fileContent = fs.readFileSync(originalFilename);
      const uploaded = await awsUtils.uploadExportFile(fileContent, key);
      fs.unlink(originalFilename, function (err) {
        if (err) {
          logger.log({
            level: 'error',
            message: `Error in uplink file: ${err?.stack || err}`,
          });
        }
        return res.status(SUCCESSCODE.STANDARD).json({
          data: { url: uploaded.url },
          msg: req.t('SUCCESS'),
          status: true,
        });
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at exportNonUsUkEurAddressList ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get missing events */
adminController.getMissingEvents = async (req, res) => {
  logger.info('getMissingEvents');
  try {
    const {
      body: { page, search, sortBy, sortDirection, ...filterParams },
      countryFilter,
    } = req;
    const limit = config.MAX_RECORDS;
    let skip = 0;
    if (page && page > 0) {
      skip = +page * limit;
    }
    const events = await adminService.getMissingEvents(
      +skip,
      +limit,
      search,
      filterParams,
      countryFilter,
      sortBy,
      sortDirection,
    );
    const response = {
      ...events,
      pages: 1,
      pageSize: limit,
    };
    if (events && events.total > 0) {
      response.pages = Math.ceil(events.total / limit);
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      data: response,
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.error(`Error at getMissingEvents ${error}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* approved address change request */
adminController.approvedAddressChangeRequest = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'approvedAddressChangeRequest',
  });
  try {
    const {
      body: { id: addressChangeRequestId },
      addressChangeRequestDetails,
    } = req;
    const company = addressChangeRequestDetails.company;

    const allCompanyCardServiceTypes = commonCompanyService.getCompanyCardServiceTypes(
      addressChangeRequestDetails.company.companyCardServices,
    );

    if (!_.empty(addressChangeRequestDetails.address1)) {
      addressChangeRequestDetails.address1 = replaceAccents(addressChangeRequestDetails.address1);
    }
    if (!_.empty(addressChangeRequestDetails.address2)) {
      addressChangeRequestDetails.address2 = replaceAccents(addressChangeRequestDetails.address2);
    }

    let domesticAddressForCompany = false;
    if (
      company.geoCountryCode === addressChangeRequestDetails.countryCode ||
      (config.STRIPE_EUROPE_COUNTRY.includes(company.geoCountryCode) &&
        config.STRIPE_EUROPE_COUNTRY.includes(addressChangeRequestDetails.countryCode))
    ) {
      domesticAddressForCompany = true;
    }

    if (domesticAddressForCompany === true) {
      let reqUpdateAccount = {};

      if (hasCardServiceTypeStripe(allCompanyCardServiceTypes)) {
        reqUpdateAccount = {
          billing: {
            address: {},
          },
        };
        // update address 1 in stripe
        reqUpdateAccount.billing.address.line1 = addressChangeRequestDetails.address1;
        // update address 2 in stripe
        if (
          !addressChangeRequestDetails.address2 ||
          addressChangeRequestDetails.address2 === '' ||
          addressChangeRequestDetails.address2.trim() === ''
        ) {
          reqUpdateAccount.billing.address.line2 = '-';
        } else {
          reqUpdateAccount.billing.address.line2 = addressChangeRequestDetails.address2;
        }
        // update city in stripe
        if (addressChangeRequestDetails.city && addressChangeRequestDetails.city.cityName) {
          reqUpdateAccount.billing.address.city = addressChangeRequestDetails.city.cityName;
        }
        // update state code in stripe
        if (addressChangeRequestDetails.state && addressChangeRequestDetails.state.stateCode) {
          reqUpdateAccount.billing.address.state = addressChangeRequestDetails.state.stateCode;
        }
        // update postal code in stripe
        if (addressChangeRequestDetails.zipcode) {
          reqUpdateAccount.billing.address.postal_code = addressChangeRequestDetails.zipcode;
        }
        // update countryCode in stripe
        if (
          addressChangeRequestDetails.country_lookup &&
          addressChangeRequestDetails.country_lookup.alpha2Code
        ) {
          reqUpdateAccount.billing.address.country = await adminService.getValidCountryCode(
            addressChangeRequestDetails.country_lookup.alpha2Code,
          );
        }

        const stripeCardholders = addressChangeRequestDetails.user.userCardHolders || [];
        for (const userCardholder of stripeCardholders) {
          if (
            userCardholder?.cardHolderId &&
            userCardholder.cardHolderStatus === STRIPE_CARDHOLDER_STATUS.ACTIVE
          ) {
            // update card holder address
            let updateAccountRes;
            if (userCardholder.cardServiceTypes === CARD_HOLDER_REGIONS.US) {
              updateAccountRes = await stripe.updateCardholderData(
                reqUpdateAccount,
                userCardholder.cardHolderId,
              );
            } else if (userCardholder.cardServiceTypes === CARD_HOLDER_REGIONS.UK) {
              updateAccountRes = await stripeUk.updateCardholderData(
                reqUpdateAccount,
                userCardholder.cardHolderId,
              );
            } else if (userCardholder.cardServiceTypes === CARD_HOLDER_REGIONS.EUR) {
              updateAccountRes = await stripeEurope.updateCardholderData(
                reqUpdateAccount,
                userCardholder.cardHolderId,
              );
            }

            // send email to admin for updated address
            if (updateAccountRes && updateAccountRes.success && updateAccountRes.data) {
              sendEmailToAdminForUpdateStripeProfileAddress(
                addressChangeRequestDetails,
                updateAccountRes.data,
              );
            }
          }
        }
      }

      /* update user details address, stripe card holder address, galileo card address via lamda function */
      updateUserDetailsAndCardAddress(addressChangeRequestDetails);
    }

    /* update company address of particular organization */
    const updateCompanyAddressData = {
      businessAddress: addressChangeRequestDetails.address1,
      unitNumber: addressChangeRequestDetails.address2,
      stateId: addressChangeRequestDetails.state.id,
      cityId: addressChangeRequestDetails.city.id,
      zipcode: addressChangeRequestDetails.zipcode,
      countryCode: addressChangeRequestDetails.countryCode,
    };
    if (!_.empty(addressChangeRequestDetails.county)) {
      updateCompanyAddressData.county = addressChangeRequestDetails.county;
    }

    await companyService.updateCompanyAddress(updateCompanyAddressData, {
      where: {
        companyId: addressChangeRequestDetails.companyId,
        addressType:
          domesticAddressForCompany === true
            ? COMPANY_ADDRESS_TYPES.COMPANY
            : COMPANY_ADDRESS_TYPES.INTERNATIONAL,
      },
    });

    /* update address request */
    await adminService.updateAddressChangeRequest(
      {
        status: ADDRESS_REQUEST_STATUS.APPROVED,
      },
      {
        where: {
          id: addressChangeRequestId,
        },
      },
    );
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at approvedAddressChangeRequest: ${error?.stack || error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get users requests */
adminController.getAllUsers = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getAllUsers',
  });
  try {
    const {
      body: { page, search, sortBy, sortDirection, ...filterParams },
      countryFilter,
    } = req;
    const limit = config.MAX_RECORDS;
    let skip = 0;
    if (page && page > 0) {
      skip = +page * limit;
    }
    let data = [];
    if (filterParams && filterParams.userStatus == 'invited') {
      data = await adminService.getAllInvitedUsers(
        +skip,
        +limit,
        search,
        filterParams,
        countryFilter,
        sortBy,
        sortDirection,
      );
    } else {
      data = await adminService.getAllUsers(
        +skip,
        +limit,
        search,
        filterParams,
        countryFilter,
        sortBy,
        sortDirection,
      );
      if (filterParams.userStatus && filterParams.userStatus == STATUS.DELETED) {
        const settingsData = await adminService.findOneAdminSetting({
          where: {
            settingKey: ADMIN_SETTINGS_KEYS.USER_ACCOUNT_RECOVERY_INTERVAL,
          },
          attributes: ['settingValue'],
        });
        if (settingsData && Object.hasOwn(settingsData.dataValues, 'settingValue')) {
          const days = parseInt(settingsData.dataValues.settingValue);
          const currentDate = moment(new Date()).subtract(days, 'days');
          for (const i in data.data) {
            if (
              data.data[i].deletedAt &&
              data.data[i].deletedAt != null &&
              !data.data[i].isDeletedForce
            ) {
              const deletedDate = moment(new Date(data.data[i].deletedAt));
              if (deletedDate < currentDate) {
                data.data[i].dataValues.isReactivate = false;
              } else {
                data.data[i].dataValues.isReactivate = true;
              }
            } else {
              data.data[i].dataValues.isReactivate = false;
            }
          }
        } else {
          data.data.map((user) => {
            user.dataValues.isReactivate = false;
            return user;
          });
        }
      } else if (filterParams.userStatus && filterParams.userStatus == STATUS.ACTIVE) {
        for (const i in data.data) {
          // add flag for last admin check
          if (data.data[i].role == ROLE.ADMIN && data.data[i].companyId) {
            const users = await adminService.getUsersByQuery({
              where: {
                companyId: data.data[i].companyId,
                role: ROLE.ADMIN,
              },
              attributes: ['id'],
            });
            if (users && users.length == 1) {
              data.data[i].dataValues.isLastAdmin = true;
            } else {
              data.data[i].dataValues.isLastAdmin = false;
            }
          } else {
            data.data[i].dataValues.isLastAdmin = false;
          }
        }
      }
    }

    const response = {
      users: data ? data.data : [],
      total: data ? data.total : 0,
      pages: 1,
      pageSize: limit,
    };
    if (data && data.total > 0) {
      response.pages = Math.ceil(data.total / limit);
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getAllUsers ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Only active user can be deleted from cms
 * @param {*} req
 * @param {*} res
 */
adminController.deleteUser = errorHandler.errorHandlerWrapped(async (req, res) => {
  logger.info(`deleteUser for user id ${req.body.id}`);
  await cardServiceWeb.deleteUserAndCards(req.body.id);
  return res.status(SUCCESSCODE.STANDARD).json({
    msg: req.t('USER_DELETED'),
    status: true,
  });
});

/**
 * @description Only user will delete which deleted and can able to reactivate it.
 * @param {*} req
 * @param {*} res
 */
adminController.deleteForceUser = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'deleteForceUser',
  });
  try {
    const {
      body: { id },
    } = req;
    const forceDeleteUserData = await adminService.getUser({
      where: { id: id },
      attributes: ['id', 'status'],
      paranoid: false,
    });
    if (forceDeleteUserData.status !== STATUS.DELETED) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('ERR_FORCE_DELETE_USER_ONLY_DELETED') },
        status: false,
      });
    }
    await adminService.updateUser(
      { isDeletedForce: true },
      {
        where: { id: id },
        paranoid: false,
      },
    );
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at deleteForceUser ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Deleted user can reactivate in some configure days
 * @param {*} req
 * @param {*} res
 */
adminController.reactivateUser = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'reactivateUser',
  });
  try {
    const {
      body: { id },
    } = req;

    const retrieveQuery = {
      where: { id: id },
      returning: true,
      paranoid: false,
    };

    const reactivateUserData = await commonUserService.getUserOnCompany(id, false);
    // Validate deleted and can retrive or not.
    if (
      !reactivateUserData ||
      !reactivateUserData.deletedAt ||
      reactivateUserData.deletedAt == null ||
      reactivateUserData.isDeletedForce
    ) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('USER_REACTIVATE_FAILED') },
        status: false,
      });
    }
    const allCompanyCardServiceTypes = await userService.getAllCompanyCardServiceTypes(
      reactivateUserData.companyId,
    );
    // check company status
    if (
      reactivateUserData &&
      reactivateUserData.company &&
      reactivateUserData.company.status &&
      reactivateUserData.company.status === STATUS.INACTIVE
    ) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('REACTIVATE_FAILED_ORGANISATION_INACTIVATE') },
        status: false,
      });
    }
    const data = await adminService.findOneAdminSetting({
      where: {
        settingKey: ADMIN_SETTINGS_KEYS.USER_ACCOUNT_RECOVERY_INTERVAL,
      },
      attributes: ['settingValue'],
    });
    if (data && Object.hasOwn(data.dataValues, 'settingValue')) {
      const days = parseInt(data.dataValues.settingValue);
      const currentDate = moment(new Date()).subtract(days, 'days');
      const deletedDate = moment(new Date(reactivateUserData.deletedAt));
      if (deletedDate < currentDate) {
        return res.status(ERROR400).json({
          errors: { msg: req.t('USER_REACTIVATE_FAILED') },
          status: false,
        });
      }
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t('USER_REACTIVATE_FAILED') },
        status: false,
      });
    }

    if (
      hasCardServiceTypeStripe(allCompanyCardServiceTypes) &&
      reactivateUserData.role !== ROLE.BOOKKEEPER
    ) {
      // on stripe and is not a bookkeeper, so even if we have a cardholder attached we are not reactivating it
      await stripeCardholderService.updateUserCardHolderStatus(id, STRIPE_CARDHOLDER_STATUS.ACTIVE);
    }

    if (hasCardServiceTypeMarqeta(allCompanyCardServiceTypes)) {
      const marqetaCardServiceTypes = allCompanyCardServiceTypes.filter(isCardServiceTypeMarqeta);
      for (const cardServiceType of marqetaCardServiceTypes) {
        await userCardService.reactivateMarqetaUser(reactivateUserData, cardServiceType);
      }
    }

    const update = { deletedAt: null, status: STATUS.ACTIVE };
    const reactivated = await adminService.updateUser(update, retrieveQuery);
    if (reactivated) {
      await adminService.updateUserDetail(
        { deletedAt: null },
        { where: { userId: id }, paranoid: false },
      );
      if (reactivateUserData.email) {
        await adminService.updateWaitListUser(
          { status: WAITLIST_STATUS.REGISTERED, deletedAt: null },
          { where: { email: reactivateUserData.email }, paranoid: false },
        );
        await adminService.updateInviteUser(
          { status: STATUS.ACTIVE, deletedAt: null },
          { where: { email: reactivateUserData.email }, paranoid: false },
        );
      }

      if (reactivateUserData.role !== ROLE.BOOKKEEPER) {
        const cards = await cardService.findCards({
          where: { userId: id },
          attributes: [
            'id',
            'galileoCardId',
            'PRN',
            'tutukaCardId',
            'stripeCardId',
            'cardServiceType',
          ],
          paranoid: false,
        });
        for (const card of cards) {
          let status = '';
          if (card.cardServiceType === CARD_SERVICE_TYPE.GALILEO) {
            const cronItem = await cronService.getItem({
              where: {
                referenceId: card.galileoCardId,
                cronTypes: CRON_ITEM_TYPES.CUSTOM,
              },
              attributes: ['initialStatus'],
            });
            if (cronItem) {
              status = cronItem.initialStatus;
              await cronService.deleteItem({
                where: {
                  referenceId: card.galileoCardId,
                  cronTypes: CRON_ITEM_TYPES.CUSTOM,
                },
              });
            }
          } else if (TUTUKA_CARD_SERVICE_TYPES.includes(card.cardServiceType)) {
            const cronItem = await cronService.getItem({
              where: {
                cardId: card.id,
                referenceId: card.tutukaCardId,
                cronTypes: CRON_ITEM_TYPES.CUSTOM,
              },
              attributes: ['initialStatus'],
            });
            if (cronItem) {
              status = cronItem.initialStatus;
              await cronService.deleteItem({
                where: {
                  cardId: card.id,
                  referenceId: card.tutukaCardId,
                  cronTypes: CRON_ITEM_TYPES.CUSTOM,
                },
              });
            }
          } else if (
            card.cardServiceType === CARD_SERVICE_TYPE.STRIPEUS ||
            card.cardServiceType === CARD_SERVICE_TYPE.STRIPEUK ||
            card.cardServiceType === CARD_SERVICE_TYPE.STRIPEEUR
          ) {
            const cronItem = await cronService.getItem({
              where: {
                referenceId: card.stripeCardId,
                cronTypes: CRON_ITEM_TYPES.CUSTOM,
              },
              attributes: ['initialStatus'],
            });
            if (cronItem) {
              status = cronItem.initialStatus;
              await cronService.deleteItem({
                where: {
                  referenceId: card.stripeCardId,
                  cronTypes: CRON_ITEM_TYPES.CUSTOM,
                },
              });
            }
          }

          if (status) {
            await cardService.updateCard(
              { status: status, deletedAt: null },
              { where: { id: card.id }, paranoid: false },
            );
          }
        }
      }

      await userService.establishLegalRepresentative(reactivateUserData.company.id);

      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('USER_REACTIVATE'),
        status: true,
      });
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t('USER_REACTIVATE_FAILED') },
        status: false,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at retrieveUser ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get user cards requests */
adminController.getUserCards = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getUserCards',
  });
  try {
    const { id } = req.body;

    const data = await adminService.getUserCards(id);
    const response = {
      cards: data.length > 0 ? data : [],
    };
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getUserCards ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get conatct information */
adminController.getContactInformation = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getContactInformation',
  });
  try {
    const { countryFilter } = req;
    const fields = [
      'Organization ID',
      'Organization Name',
      'Legal Name',
      'Card Service',
      'EIN',
      'Geo',
      'Org SignUp Date in ET',
      'First Name',
      'Last Name',
      'Email',
      'Role',
      'User Creation Date in ET',
      'Name',
      'Phone Number',
      'Position',
      'Owner Name',
      'Contact Number',
      'SPEI',
    ];
    const contacts = await adminService.getContactInformation(countryFilter);
    const data = [];

    for (let i = 0; i < contacts.length; i++) {
      const commonData = {
        orgName: contacts.length && contacts[i].name ? contacts[i].name : '',
        orgId: contacts[i].id ? contacts[i].id : '',
        legalName: contacts[i].legalName ? contacts[i].legalName : '',
        EIN: contacts[i].EIN ? contacts[i].EIN : '',
        cardService: userService
          .getCompanyCardServiceTypes(contacts[i].companyCardServices)
          .join(', '),
        geo:
          contacts.length &&
          contacts[i].geoCountryCodeLookup &&
          contacts[i].geoCountryCodeLookup.name
            ? contacts[i].geoCountryCodeLookup.name
            : '',
        orgSignupDate:
          contacts.length && contacts[i].createdAt
            ? utilsHelper.fileDownloadUTCDateTimeToETFormat(contacts[i].createdAt)
            : '',
        isStpAvailable: contacts[i].isStpAvailable && contacts[i].isStpAvailable == 1 ? 'Y' : '',
      };
      let countContact = 0;
      let countBusiness = 0;
      for (let j = 0; j < contacts[i].users.length; j++) {
        if (
          contacts[i].companyContacts[countContact] &&
          contacts[i].business_ownerships[countBusiness]
        ) {
          // all records
          data.push({
            'Organization Name': commonData.orgName ? commonData.orgName : '',
            'Organization ID': commonData.orgId ? commonData.orgId : '',
            'Legal Name': commonData.legalName ? commonData.legalName : '',
            'Card Service': commonData.cardService ? commonData.cardService : '',
            EIN: commonData.EIN ? commonData.EIN : '',
            Geo: commonData.geo ? commonData.geo : '',
            'First Name':
              contacts[i].users && contacts[i].users[j].firstName
                ? contacts[i].users[j].firstName
                : '',
            'Last Name':
              contacts[i].users && contacts[i].users[j].lastName
                ? contacts[i].users[j].lastName
                : '',
            Email:
              contacts[i].users && contacts[i].users[j].email ? contacts[i].users[j].email : '',
            Role: contacts[i].users && contacts[i].users[j].role ? contacts[i].users[j].role : '',
            'UUser Creation Date in ET':
              contacts[i].users && contacts[i].users[j].createdAt
                ? utilsHelper.fileDownloadUTCDateTimeToETFormat(contacts[i].users[j].createdAt)
                : '',
            Name:
              (contacts[i].companyContacts && contacts[i].companyContacts[countContact].firstName
                ? contacts[i].companyContacts[countContact].firstName
                : '') +
              ' ' +
              (contacts[i].companyContacts && contacts[i].companyContacts[countContact].lastName
                ? contacts[i].companyContacts[countContact].lastName
                : ''),
            'Phone Number':
              contacts[i].companyContacts && contacts[i].companyContacts[countContact].phoneNumber
                ? contacts[i].companyContacts[countContact].phoneNumber
                : '',
            Position:
              contacts[i].companyContacts && contacts[i].companyContacts[countContact].positionTitle
                ? contacts[i].companyContacts[countContact].positionTitle
                : '',
            'Owner Name':
              (contacts[i].business_ownerships &&
              contacts[i].business_ownerships[countBusiness].firstName
                ? contacts[i].business_ownerships[countBusiness].firstName
                : '') +
              ' ' +
              (contacts[i].business_ownerships &&
              contacts[i].business_ownerships[countBusiness].lastName
                ? contacts[i].business_ownerships[countBusiness].lastName
                : ''),
            'Contact Number':
              contacts[i].business_ownerships &&
              contacts[i].business_ownerships[countBusiness].phoneNumber
                ? contacts[i].business_ownerships[countBusiness].phoneNumber
                : '',
            'Org SignUp Date in ET': commonData.orgSignupDate ? commonData.orgSignupDate : '',
            SPEI: commonData.isStpAvailable,
          });
          countContact++;
          countBusiness++;
        }

        // company contact
        else if (contacts[i].companyContacts[countContact]) {
          data.push({
            'Organization Name': commonData.orgName ? commonData.orgName : '',
            'Organization ID': commonData.orgId ? commonData.orgId : '',
            'Legal Name': commonData.legalName ? commonData.legalName : '',
            'Card Service': commonData.cardService ? commonData.cardService : '',
            EIN: commonData.EIN ? commonData.EIN : '',
            Geo: commonData.geo ? commonData.geo : '',
            'First Name':
              contacts[i].users && contacts[i].users[j].firstName
                ? contacts[i].users[j].firstName
                : '',
            'Last Name':
              contacts[i].users && contacts[i].users[j].lastName
                ? contacts[i].users[j].lastName
                : '',
            Email:
              contacts[i].users && contacts[i].users[j].email ? contacts[i].users[j].email : '',
            Role: contacts[i].users && contacts[i].users[j].role ? contacts[i].users[j].role : '',
            'UUser Creation Date in ET':
              contacts[i].users && contacts[i].users[j].createdAt
                ? utilsHelper.fileDownloadUTCDateTimeToETFormat(contacts[i].users[j].createdAt)
                : '',
            Name:
              (contacts[i].companyContacts && contacts[i].companyContacts[countContact].firstName
                ? contacts[i].companyContacts[countContact].firstName
                : '') +
              ' ' +
              (contacts[i].companyContacts && contacts[i].companyContacts[countContact].lastName
                ? contacts[i].companyContacts[countContact].lastName
                : ''),
            'Phone Number':
              contacts[i].companyContacts && contacts[i].companyContacts[countContact].phoneNumber
                ? contacts[i].companyContacts[countContact].phoneNumber
                : '',
            Position:
              contacts[i].companyContacts && contacts[i].companyContacts[countContact].positionTitle
                ? contacts[i].companyContacts[countContact].positionTitle
                : '',
            'Owner Name': '',
            'Contact Number': '',
            'Org SignUp Date in ET': commonData.orgSignupDate ? commonData.orgSignupDate : '',
            SPEI: commonData.isStpAvailable,
          });
          countContact++;
        }

        // business owner
        else if (contacts[i].business_ownerships[countBusiness]) {
          data.push({
            'Organization Name': commonData.orgName ? commonData.orgName : '',
            'Organization ID': commonData.orgId ? commonData.orgId : '',
            'Legal Name': commonData.legalName ? commonData.legalName : '',
            'Card Service': commonData.cardService ? commonData.cardService : '',
            EIN: commonData.EIN ? commonData.EIN : '',
            Geo: commonData.geo ? commonData.geo : '',
            'First Name':
              contacts[i].users && contacts[i].users[j].firstName
                ? contacts[i].users[j].firstName
                : '',
            'Last Name':
              contacts[i].users && contacts[i].users[j].lastName
                ? contacts[i].users[j].lastName
                : '',
            Email:
              contacts[i].users && contacts[i].users[j].email ? contacts[i].users[j].email : '',
            Role: contacts[i].users && contacts[i].users[j].role ? contacts[i].users[j].role : '',
            'User Creation Date in ET':
              contacts[i].users && contacts[i].users[j].createdAt
                ? utilsHelper.fileDownloadUTCDateTimeToETFormat(contacts[i].users[j].createdAt)
                : '',
            Name: '',
            'Phone Number': '',
            Position: '',
            'Owner Name':
              (contacts[i].business_ownerships &&
              contacts[i].business_ownerships[countBusiness].firstName
                ? contacts[i].business_ownerships[countBusiness].firstName
                : '') +
              ' ' +
              (contacts[i].business_ownerships &&
              contacts[i].business_ownerships[countBusiness].lastName
                ? contacts[i].business_ownerships[countBusiness].lastName
                : ''),
            'Contact Number':
              contacts[i].business_ownerships &&
              contacts[i].business_ownerships[countBusiness].phoneNumber
                ? contacts[i].business_ownerships[countBusiness].phoneNumber
                : '',
            'Org SignUp Date in ET': commonData.orgSignupDate ? commonData.orgSignupDate : '',
            SPEI: commonData.isStpAvailable,
          });
          countBusiness++;
        } else {
          data.push({
            'Organization Name': commonData.orgName ? commonData.orgName : '',
            'Organization ID': commonData.orgId ? commonData.orgId : '',
            'Legal Name': commonData.legalName ? commonData.legalName : '',
            'Card Service': commonData.cardService ? commonData.cardService : '',
            EIN: commonData.EIN ? commonData.EIN : '',
            Geo: commonData.geo ? commonData.geo : '',
            'First Name':
              contacts[i].users && contacts[i].users[j].firstName
                ? contacts[i].users[j].firstName
                : '',
            'Last Name':
              contacts[i].users && contacts[i].users[j].lastName
                ? contacts[i].users[j].lastName
                : '',
            Email:
              contacts[i].users && contacts[i].users[j].email ? contacts[i].users[j].email : '',
            Role: contacts[i].users && contacts[i].users[j].role ? contacts[i].users[j].role : '',
            'User Creation Date in ET':
              contacts[i].users && contacts[i].users[j].createdAt
                ? utilsHelper.fileDownloadUTCDateTimeToETFormat(contacts[i].users[j].createdAt)
                : '',
            Name: '',
            'Phone Number': '',
            Position: '',
            'Owner Name': '',
            'Contact Number': '',
            'Org SignUp Date in ET': commonData.orgSignupDate ? commonData.orgSignupDate : '',
            SPEI: commonData.isStpAvailable,
          });
        }
      }

      // if contact more than users
      if (countContact < contacts[i].companyContacts.length) {
        for (let k = countContact; k < contacts[i].companyContacts.length; k++) {
          data.push({
            'Organization Name': commonData.orgName ? commonData.orgName : '',
            'Organization ID': commonData.orgId ? commonData.orgId : '',
            'Legal Name': commonData.legalName ? commonData.legalName : '',
            'Card Service': commonData.cardService ? commonData.cardService : '',
            EIN: commonData.EIN ? commonData.EIN : '',
            Geo: commonData.geo ? commonData.geo : '',
            'First Name': '',
            'Last Name': '',
            Email: '',
            Role: '',
            'User Creation Date in ET': '',
            Name:
              (contacts[i].companyContacts && contacts[i].companyContacts[k].firstName
                ? contacts[i].companyContacts[k].firstName
                : '') +
              ' ' +
              (contacts[i].companyContacts && contacts[i].companyContacts[k].lastName
                ? contacts[i].companyContacts[k].lastName
                : ''),
            'Phone Number':
              contacts[i].companyContacts && contacts[i].companyContacts[k].phoneNumber
                ? contacts[i].companyContacts[k].phoneNumber
                : '',
            Position:
              contacts[i].companyContacts && contacts[i].companyContacts[k].positionTitle
                ? contacts[i].companyContacts[k].positionTitle
                : '',
            'Owner Name': '',
            'Contact Number': '',
            'Org SignUp Date in ET': commonData.orgSignupDate ? commonData.orgSignupDate : '',
            SPEI: commonData.isStpAvailable,
          });
        }
      }

      // if business ownership more then users
      if (countBusiness < contacts[i].business_ownerships.length) {
        for (let l = countBusiness; l < contacts[i].business_ownerships.length; l++) {
          data.push({
            'Organization Name': commonData.orgName ? commonData.orgName : '',
            'Organization ID': commonData.orgId ? commonData.orgId : '',
            'Legal Name': commonData.legalName ? commonData.legalName : '',
            'Card Service': commonData.cardService ? commonData.cardService : '',
            EIN: commonData.EIN ? commonData.EIN : '',
            Geo: commonData.geo ? commonData.geo : '',
            'First Name': '',
            'Last Name': '',
            Email: '',
            Role: '',
            'UUser Creation Date in ET': '',
            Name: '',
            'Phone Number': '',
            Position: '',
            'Owner Name':
              (contacts[i].business_ownerships && contacts[i].business_ownerships[l].firstName
                ? contacts[i].business_ownerships[l].firstName
                : '') +
              ' ' +
              (contacts[i].business_ownerships && contacts[i].business_ownerships[l].lastName
                ? contacts[i].business_ownerships[l].lastName
                : ''),
            'Contact Number':
              contacts[i].business_ownerships && contacts[i].business_ownerships[l].phoneNumber
                ? contacts[i].business_ownerships[l].phoneNumber
                : '',
            'Org SignUp Date in ET': commonData.orgSignupDate ? commonData.orgSignupDate : '',
            SPEI: commonData.isStpAvailable,
          });
        }
      }
    }

    const json2csvParser = new Parser({ fields: fields });
    const csv = json2csvParser.parse(data);
    const originalFilename = 'contact_information_' + Date.now() + '.csv';
    const key = DOWNLOAD + originalFilename;
    const uploaded = await awsUtils.uploadExportFile(csv, key);

    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: { url: uploaded.url },
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getContactInformation ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

adminController.getCountryAndCurrency = async (req, res) => {
  try {
    const fetchCountry = await adminService.getCountry();
    const fetchCurrency = await adminService.getCurrency();

    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: { country: fetchCountry, currency: fetchCurrency },
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getCountryAndCurrency ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*
    @url POST /v2/admin/add-sub-admin
    @description to add new sub admin
*/
adminController.addSubAdmin = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'addSubAdmin',
  });
  try {
    const { firstName, lastName, email, roleId } = req.body;

    const params = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      setPasswordToken: randNumber(30),
      roleId: roleId,
    };
    const data = await adminService.addSubAdmin(params);
    // send set password link
    const emailbody = {
      firstName: data.firstName,
      link: config.SETPASSURLADMIN + '/' + data.setPasswordToken,
      email: data.email,
    };
    // awsUtils.sendEmail(EMAIL_TYPE.SET_ADMIN_PASSWORD, emailbody, (err, isEmailSent) => {
    emailService.sendEmail(EMAIL_TYPE.SET_ADMIN_PASSWORD, emailbody, (err, isEmailSent) => {
      if (isEmailSent) {
        return res.status(SUCCESSCODE.STANDARD).json({
          msg: req.t('SET_ADMIN_PASSWORD_MESSAGE'),
          status: true,
        });
      } else {
        return res.status(SERVERERROR.CODE).json({
          errors: { msg: req.t(SERVERERROR.MESSAGE) },
          status: false,
        });
      }
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at addSubAdmin ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*
    @url GET /v2/admin/validate-set-password/{token}
    @description validate set password link for new sub-admin
*/
adminController.validateSetPassword = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'validateSetPassword',
  });
  try {
    const {
      params: { token },
    } = req;
    const admin = await adminService.getAdmin({
      where: {
        setPasswordToken: token,
      },
    });
    if (admin) {
      return res.status(SUCCESSCODE.STANDARD).json({
        data: { isValid: true },
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else {
      return res.status(SUCCESSCODE.STANDARD).json({
        data: { isValid: false },
        msg: req.t('SUCCESS'),
        status: true,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at validateSetPassword ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*
    @url POST /v2/admin/set-password/{token}
    @description set password for new sub-admin
*/
adminController.setPassword = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'setPassword',
  });
  try {
    const {
      params: { token },
      body: { newPassword: password },
    } = req;
    const admin = await adminService.getAdmin({
      where: {
        setPasswordToken: token,
      },
    });
    if (!admin) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('SET_PASSWORD_TOKEN_EXPIRED') },
        status: false,
      });
    } else {
      const hashPassword = hash(password);
      const updateQuery = { where: { id: admin.id } };
      const updateData = {
        password: hashPassword,
        setPasswordToken: null,
      };
      await adminService.updateAdmin(updateData, updateQuery);
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('PASSWORD_SET'),
        status: true,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at setPassword ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*
    @url POST /v2/admin/update-sub-admin/{subAdminId}
    @description to update sub-admin details
*/
adminController.updateSubAdmin = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'updateSubAdmin',
  });
  try {
    const {
      params: { subAdminId },
      body: { roleId, roleAccessOverrides },
    } = req;
    const updateData = {
      roleId,
      roleAccessOverrides,
    };
    const updateQuery = {
      where: {
        id: subAdminId,
      },
    };
    await adminService.updateAdmin(updateData, updateQuery);
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUB_ADMIN_DETAIL_UPDATED_SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at updateSubAdmin ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*
    @url GET /v2/admin/get-admin-by-id/{adminId}
    @description get admin details by id
*/
adminController.getAdminById = async (req, res) => {
  logger.info({ message: 'getAdminById' });

  try {
    const id = req.params.adminId;
    const result = await adminService.getSubAdminById(id);

    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: result,
      status: true,
    });
  } catch (error) {
    logger.error({ message: 'Error at getAdminById ' + error });

    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* get sub admin */
adminController.getSubAdmin = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getSubAdmin',
  });
  try {
    const { page, search, ...filterParams } = req.body;
    const limit = config.MAX_RECORDS;
    let skip = 0;
    if (page && page > 0) {
      skip = +page * limit;
    }
    const data = await adminService.getSubAdmin(+skip, +limit, search, filterParams);
    const response = {
      users: data ? data.data : [],
      total: data ? data.total : 0,
      pages: 1,
      pageSize: limit,
    };
    if (data && data.total > 0) {
      response.pages = Math.ceil(data.total / limit);
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: response,
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getSubAdmin ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// delete sub admin
adminController.deleteSubAdmin = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'deleteSubAdmin',
  });
  try {
    const { id } = req.body;
    await adminService.deleteSubAdmin(id);
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at deleteSubAdmin ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// get admin role
adminController.getAdminRole = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getAdminRole',
  });
  try {
    const response = await adminService.getAdminRole();
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
      data: response,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getAdminRole ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// get admin module
adminController.getAdminModules = async (req, res) => {
  logger.info('adminController.getAdminModules');
  try {
    const response = adminService.getAdminModules();
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('MODULE_ADDED_SUCCESS'),
      status: true,
      data: response,
    });
  } catch (error) {
    logger.error(`Error at adminController.getAdminModules ${error}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

//update admin access based on role
adminController.updateAdminAccess = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'updateAdminAccess',
  });
  const { modules } = req.body;

  try {
    await adminService.updateAdminAccess(modules);
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('MODULE_UPDATED_SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at updateAdminAccess ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

//get admin access based on role
adminController.getAdminAccess = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'getAdminAccess',
  });
  const { roleId } = req.body;
  try {
    const response = await adminService.getAdminAccess(roleId);
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
      data: response,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at getAdminAccess ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @url POST /v2/admin/add-credit-limit
 * @description Controller for adding new credit limit.
 * @param {*} req request
 * @param {*} res response
 */
adminController.addCreditLimit = async (req, res) => {
  try {
    const { advanceRate, creditLimitCap, goodStandingBalance, creditCoverageRate, region } =
      req.body;

    const createData = {
      advanceRate,
      creditLimitCap,
      goodStandingBalance,
      creditCoverageRate,
      region,
    };
    const isCreated = await adminService.addCreditLimit(createData);
    if (isCreated) {
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        data: isCreated,
        status: true,
      });
    } else {
      return res.status(SERVERERROR.CODE).json({
        errors: { msg: req.t(SERVERERROR.MESSAGE) },
        status: false,
      });
    }
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @url PATCH /v2/admin/edit-credit-limit/{creditLimitId}
 * @description Controller for editing credit limit.
 * @param {*} req request
 * @param {*} res response
 */
adminController.editCredutLimit = async (req, res) => {
  try {
    const { id, advanceRate, creditLimitCap, goodStandingBalance, creditCoverageRate, region } =
      req.body;

    const editData = {
      advanceRate,
      creditLimitCap,
      goodStandingBalance,
      creditCoverageRate,
      region,
    };

    const editQuery = {
      where: { id: id },
    };

    const edited = await adminService.editCreditLimit(editData, editQuery);
    if (edited) {
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else {
      return res.status(ERROR400).json({
        errors: { msg: req.t(SERVERERROR.MESSAGE) },
        status: false,
      });
    }
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @url GET /v2/admin/get-credit-limit
 * @description Controller for getting credit limits.
 * @param {*} req request
 * @param {*} res response
 */
adminController.getCreditLimit = async (req, res) => {
  try {
    const { filter, page } = req.body;
    const limit = config.MAX_RECORDS;
    let skip = 0;
    if (page > 0) {
      skip = +page * limit;
    }

    const recordsData = await adminService.getCreditLimit(+skip, +limit, filter);
    const response = {
      records: recordsData ? recordsData.records : [],
      total: recordsData ? recordsData.total : 0,
      pages: recordsData.total > 0 ? Math.ceil(recordsData.total / limit) : 1,
      pageSize: limit,
    };
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
      data: response,
    });
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @url DELETE /v2/admin/delete-credit-limit
 * @description Controller for deleting credit limits.
 * @param {*} req request
 * @param {*} res response
 */
adminController.deleteCreditLimit = async (req, res) => {
  try {
    const { id } = req.body;

    await adminService.deleteCreditLimit(id);
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// countries
adminController.getCountry = async (req, res) => {
  try {
    const countries = await adminService.findAllCountry();
    return res.status(SUCCESSCODE.STANDARD).json({
      data: { countries: countries },
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

adminController.getExchangeRateCurrencies = async (req, res) => {
  try {
    const currencies = await adminService.findExchangeRateCurrencies();
    return res.status(SUCCESSCODE.STANDARD).json({
      data: {
        ...currencies,
      },
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at exchange rate currencies ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// get unique countries
adminController.getUniqueCountry = async (req, res) => {
  try {
    const countries = await adminService.findUniqueCountry();
    return res.status(SUCCESSCODE.STANDARD).json({
      data: { countries: countries },
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// get all users list- active, deleted, inactivate by company id
adminController.getAllUsersList = async (req, res) => {
  try {
    const { companyId } = req.body;

    const queryUser = {
      where: {
        companyId: companyId,
      },
      attributes: ['id', 'firstName', 'lastName', 'role'],
      paranoid: false,
    };
    const users = await adminService.getUsersByQuery(queryUser);
    return res.status(SUCCESSCODE.STANDARD).json({
      data: { users },
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

adminController.searchAdminManagerAndSalesUser = async (req, res) => {
  try {
    const { filter } = req.body;
    const adminUsers = await adminService.getManagerAndSalesAdmin(filter);
    return res.status(SUCCESSCODE.STANDARD).json({
      data: { users: adminUsers },
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Api invite user from CMS for particular organisation
 * @param {*} req
 * @param {*} res
 * @returns
 */
adminController.inviteUsers = errorHandler.errorHandlerWrapped(async (req, res) => {
  logger.log({
    level: 'info',
    message: 'inviteUsers',
  });
  const {
    body: { users, companyId },
    authAdmin: { id: adminId },
  } = req;
  const companyDetails = await adminService.getCompanyDetail({
    where: { id: companyId },
    attributes: ['status', 'hasExpenseManagementFeatureEnabled'],
  });

  // TODO CARDS-3764: Remove blockers for creating tutuka Colombia physical cards
  const allCompanyCardServiceTypes = await userService.getAllCompanyCardServiceTypes(companyId);

  if (_.empty(companyDetails)) {
    return res.status(ERROR400).json({
      errors: { msg: req.t('COMPANY_NOT_FOUND') },
      status: false,
    });
  }
  if (companyDetails && companyDetails.status !== STATUS.ACTIVE) {
    return res.status(ERROR400).json({
      errors: { msg: req.t('COMPANY_NOT_ACTIVATE') },
      status: false,
    });
  }

  users.forEach((element) => {
    element.companyId = companyId;
    element.authKey = randNumber(30);
    element.isSetSpendLimit = element.spendLimit ? true : false;
    element.isInvitedByAdmin = true;
    element.adminId = adminId || null;
    element.is_physical_card_creation_enable = allCompanyCardServiceTypes.every(
      isPhysicalCardCreationBlocked,
    )
      ? false
      : element.is_physical_card_creation_enable; // TODO CARDS-3764: Remove blockers for creating tutuka Colombia physical cards
  });
  for (const element of users) {
    userCardService.validateUserNameOnCardProcessors(allCompanyCardServiceTypes, element);
  }
  const invitedUsers = await adminService.bulkCreateInviteUsers(users);
  for (const element of invitedUsers) {
    if (!element.isDelegate) {
      const link = config.INVITATION_URL + '/' + element.authKey;
      const emailbody = {
        email: element.email,
        firstName: element.firstName,
        invitedBy: JEEVES_ADMIN,
        link,
      };
      // await awsUtils.sendEmail('INVITE_USERS', emailbody, (err, isEmailSent) => {
      await emailService.sendEmail(
        constants.EMAIL_TYPE.INVITE_USERS,
        emailbody,
        (err, isEmailSent) => {
          if (isEmailSent) {
            logger.log({
              level: 'info',
              message: `INVITE_USERS ${isEmailSent}`,
            });
          } else {
            return res.status(SERVERERROR.CODE).json({
              errors: { msg: req.t(SERVERERROR.MESSAGE) },
              status: false,
            });
          }
        },
      );
    }
  }
  return res.status(SUCCESSCODE.STANDARD).json({
    msg: req.t('INVITE_MAIL_SEND_SUCCESS'),
    status: true,
  });
});

/*This function check for card create/update permission*/
const updateUserCardSettings = async (
  user,
  is_virtual_card_creation_enable = null,
  is_physical_card_creation_enable = null,
) => {
  const data = {
    is_virtual_card_creation_enable:
      is_virtual_card_creation_enable !== null
        ? is_virtual_card_creation_enable
        : user.is_virtual_card_creation_enable,
    is_physical_card_creation_enable:
      is_physical_card_creation_enable !== null
        ? is_physical_card_creation_enable
        : user.is_physical_card_creation_enable,
  };
  await userService.updateUser(data, { where: { id: user.id } });
  await userService.updateInviteUser(data, { where: { id: user.id } });
};

/**
 * @description Api for cancel invitation of user from CMS
 * @param {*} req
 * @param {*} res
 * @returns
 */
adminController.cancelUserInvitation = async (req, res) => {
  logger.log({
    level: 'info',
    message: 'cancelUserInvitation',
  });
  try {
    const {
      body: { id },
    } = req;
    const invitedUser = await adminService.getInviteUser({
      where: {
        id: id,
      },
      attributes: ['id', 'status'],
    });
    if (invitedUser && invitedUser.status === STATUS.PENDING) {
      await adminService.updateInviteUser(
        { status: STATUS.INACTIVE },
        { where: { id: invitedUser.id } },
      );
      await adminService.deleteInviteUser({ where: { id: invitedUser.id } });
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else {
      return res.status(SERVERERROR.CODE).json({
        errors: { msg: req.t('INVITED_USER_NOT_FOUND') },
        status: false,
      });
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at cancelUserInvitation ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Update user invitation details
 * @param {*} req
 * @param {*} res
 * @returns
 */
adminController.editInviteUsers = errorHandler.errorHandlerWrapped(async (req, res) => {
  logger.log({
    level: 'info',
    message: 'editInviteUsers',
  });
  const userData = req.body;
  const inviteId = userData.inviteId;
  delete userData.inviteId;
  let sendMail = false;

  const inviteUserData = await adminService.getInviteUser({
    where: { id: inviteId, status: STATUS.PENDING },
    attributes: ['isDelegate', 'email'],
  });
  if (_.empty(inviteUserData)) {
    return res.status(ERROR400).json({
      errors: { msg: req.t('INVITED_USER_NOT_FOUND') },
      status: false,
    });
  }

  if (!inviteUserData.isDelegate && userData.email !== inviteUserData.email) {
    userData.authKey = randNumber(30);
    sendMail = true;
  }

  const allCompanyCardServiceTypes = await userService.getAllCompanyCardServiceTypes(
    inviteUserData.companyId,
  );
  userCardService.validateUserNameOnCardProcessors(allCompanyCardServiceTypes, userData);

  await adminService.updateInviteUser(userData, {
    where: {
      id: inviteId,
    },
  });
  if (sendMail) {
    const emailbody = {
      email: userData.email,
      firstName: userData.firstName,
      invitedBy: JEEVES_ADMIN,
      link: `${config.INVITATION_URL}/${userData.authKey}`,
    };
    // await awsUtils.sendEmail('INVITE_USERS', emailbody, (err, isEmailSent) => {
    await emailService.sendEmail(
      constants.EMAIL_TYPE.INVITE_USERS,
      emailbody,
      (err, isEmailSent) => {
        if (isEmailSent) {
          logger.log({
            level: 'info',
            message: `INVITE_USERS ${isEmailSent}`,
          });
        } else {
          return res.status(SERVERERROR.CODE).json({
            errors: { msg: req.t(SERVERERROR.MESSAGE) },
            status: false,
          });
        }
      },
    );
  }
  return res.status(SUCCESSCODE.STANDARD).json({
    msg: req.t('SUCCESS'),
    status: true,
  });
});

/**
 * @description Resend invite mail to user
 * @param {*} req
 * @param {*} res
 * @returns
 */
adminController.resendMailInviteUsers = errorHandler.errorHandlerWrapped(async (req, res) => {
  logger.log({
    level: 'info',
    message: 'resendMailInviteUsers',
  });
  const {
    body: { id },
  } = req;

  const inviteUserData = await userService.getInviteUser({
    where: { id, status: STATUS.PENDING },
  });
  if (_.empty(inviteUserData)) {
    throw new JeevesValidationError('INVITED_USER_NOT_FOUND');
  }

  const response = await userService.extendAndResendUserInvitation(inviteUserData);

  return res.status(SUCCESSCODE.STANDARD).json({
    msg: req.t('INVITE_MAIL_SEND_SUCCESS'),
    data: { inviteUserData, response },
    status: true,
  });
});

/* This function will update user name in tutuka cards*/
const updateTutukaCards = async (firstName, lastName, user) => {
  const cards = await cardService.findCards({
    where: {
      userId: user.id,
      status: {
        [Op.in]: [CARD_MAIN_STATUS.ACTIVE, CARD_MAIN_STATUS.INACTIVE, CARD_MAIN_STATUS.PENDING],
      },
      cardType: CARD_TYPES.VIRTUAL,
      cardServiceType: TUTUKA_CARD_SERVICE_TYPES,
    },
    attributes: [
      'id',
      'galileoCardId',
      'PRN',
      'stripeCardId',
      'tutukaCardId',
      'cardServiceType',
      'status',
      'cardType',
      'isActivateCard',
    ],
  });
  for (const card of cards) {
    await cardService.updateCard({ filePath: null }, { where: { id: card.id } });

    const data = {
      id: user.id,
      tutukaCardId: card.tutukaCardId,
      firstName: firstName,
      lastName: lastName,
    };
    await tutukaLocal.updateCardDetails(data, card.cardServiceType, card.cardType);
  }
};

/*This function will cancel all cards*/
const cancelUserCards = async (user, cardServiceType) => {
  const cards = await cardService.findCards({
    where: { userId: user.id, cardServiceType },
    attributes: ['id', 'stripeCardId', 'cardServiceType'],
  });
  for (const card of cards) {
    const stripeCardCancelledData = {
      status: STRIPE_STATUS.CANCELED,
      cancellation_reason: REPLACE_CARD_REQUEST_REASON.LOST,
      cardid: card.stripeCardId,
    };
    await stripeFacadeService.modifyCardStatus(card.cardServiceType, stripeCardCancelledData);
    /* Delete All Cards of passed user Id */
    await cardService.deleteCard(
      { status: CARD_MAIN_STATUS.CANCELLED, deletedAt: Date.now() },
      { where: { userId: user.id, id: card.id } },
    );
  }
};

/* This function will update user email in database and stripe*/
adminController.updateUserEmail = async (email, user) => {
  const userCardholders = await userService.getUserCardholders({
    where: {
      userId: user.id,
      cardHolderStatus: STRIPE_CARDHOLDER_STATUS.ACTIVE,
    },
  });
  if (user.role !== ROLE.BOOKKEEPER && userCardholders?.length) {
    for (const userCardholderData of userCardholders) {
      const cardServiceType =
        CARD_SERVICE_TYPE_BY_STRIPE_REGION[userCardholderData.cardServiceTypes];
      const stripeCardHolderData = await stripeFacadeService.getCardHolder(
        cardServiceType,
        userCardholderData.cardHolderId,
      );
      if (
        stripeCardHolderData &&
        stripeCardHolderData.data &&
        stripeCardHolderData.data.email !== email
      ) {
        const data = { email: email };
        const cardHolderUpdated = await stripeFacadeService.updateCardHolderData(
          cardServiceType,
          userCardholderData.cardHolderId,
          data,
        );
        if (cardHolderUpdated.success !== true) {
          return false;
        }
      }
    }
  }
  await userService.updateUser(
    {
      email: email,
      normalizedEmail: usersModel.calculateNormalizedEmail(email),
    },
    { where: { id: user.id } },
  );
  await userService.updateWaitListUser({ email: email }, { where: { email: user.email } });
  await userService.updateInviteUser({ email: email }, { where: { email: user.email } });
  return true;
};

/* This function will update user dateOfBirth in database and stripe*/
const updateUserDob = async (dateOfBirth, user) => {
  const userCardholders = await userService.getUserCardholders({
    where: {
      userId: user.id,
      cardHolderStatus: STRIPE_CARDHOLDER_STATUS.ACTIVE,
    },
  });
  if (userCardholders?.length) {
    dateOfBirth = new Date(dateOfBirth);
    const data = {
      individual: {
        first_name: user.firstName,
        last_name: user.lastName,
        dob: {
          day: dateOfBirth.getDate(),
          month: dateOfBirth.getMonth() + 1,
          year: dateOfBirth.getFullYear(),
        },
      },
    };
    for (const userCardholderData of userCardholders) {
      const cardServiceType =
        CARD_SERVICE_TYPE_BY_STRIPE_REGION[userCardholderData.cardServiceTypes];
      const cardHolderUpdated = await stripeFacadeService.updateCardHolderData(
        cardServiceType,
        userCardholderData.cardHolderId,
        data,
      );
      if (cardHolderUpdated.success !== true) {
        return false;
      }
    }
  }
  await userService.updateUser({ dateOfBirth: dateOfBirth }, { where: { id: user.id } });
  return true;
};

/**
 * This function is regarding getting cards details
 * @url GET /v2/admin/user-details/:id
 * @description Controller will return msg and data
 * @param {*} req request
 * @param {*} res response
 */
adminController.getUserDetails = async (req, res) => {
  logger.info('CMS getUserDetails');
  try {
    const {
      params: { id },
    } = req;
    const status = req.query.status;
    let result = {};
    if (status && status == 'invited') {
      result = await adminService.getInvitedUserDetails(id);
    } else {
      result = await adminService.getUserDetails(id);
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      data: result,
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.error(`Error at CMS getUserDetails ${error}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/*This Function will cancel old cardholder*/
const cancelOldCardHolder = async (userCardholderData, cardServiceType, user) => {
  await stripeCardholderService.updateUserCardHolderStatus(
    user.id,
    STRIPE_CARDHOLDER_STATUS.INACTIVE,
  );
  /* Delete Cards from Stripe/Tutuka & DB */
  await cancelUserCards(user, cardServiceType);
  await userService.updateUserDetail(
    { isSetEmboss: EMBOSSMENT_PROCESS_TYPE.NO },
    {
      where: {
        userId: user.id,
        addressType: USER_DETAILS_ADDRESS_TYPES.SHIPMENT,
      },
    },
  );
};

/**
 * Updates user first name and last name in the models, as well as in the respective cardholder accounts.
 * NOTE: Exposed for testing!
 *
 * @param firstName - the first name
 * @param lastName - the last name
 * @param user - the user data
 * @return {Promise<boolean>} false on error, true otherwise
 */
adminController.updateUserName = async (firstName, lastName, user) => {
  const allCompanyCardServiceTypes = await userService.getAllCompanyCardServiceTypes(
    user.companyId,
  );

  userCardService.validateUserNameOnCardProcessors(allCompanyCardServiceTypes, {
    firstName,
    lastName,
  });

  //Handle tutuka
  if (hasCardServiceTypeTutuka(allCompanyCardServiceTypes)) {
    await updateTutukaCards(firstName, lastName, user);
  }

  if (hasCardServiceTypeMarqeta(allCompanyCardServiceTypes)) {
    const marqetaCardServiceTypes = allCompanyCardServiceTypes.filter(isCardServiceTypeMarqeta);
    for (const cardServiceType of marqetaCardServiceTypes) {
      await userCardService.updateMarqetaUserDetails(
        {
          id: user.id,
          uuid: user.uuid,
          firstName,
          lastName,
        },
        cardServiceType,
      );
    }
  }

  if (hasCardServiceTypeStripe(allCompanyCardServiceTypes)) {
    //Handle stripe Cardholder
    if (user.role !== ROLE.BOOKKEEPER) {
      const userCardholders = await userService.getUserCardholders({
        where: {
          userId: user.id,
          cardHolderStatus: STRIPE_CARDHOLDER_STATUS.ACTIVE,
        },
      });
      if (userCardholders?.length) {
        for (const userCardholderData of userCardholders) {
          const cardServiceType =
            CARD_SERVICE_TYPE_BY_STRIPE_REGION[userCardholderData.cardServiceTypes];
          const stripeCardHolderData = await stripeFacadeService.getCardHolder(
            cardServiceType,
            userCardholderData.cardHolderId,
          );
          //Match name then cancel card and cardholder and create a new cardholder
          if (
            stripeCardHolderData &&
            stripeCardHolderData.data &&
            (stripeCardHolderData.data.individual.first_name !== firstName ||
              stripeCardHolderData.data.individual.last_name !== lastName)
          ) {
            await cancelOldCardHolder(userCardholderData, cardServiceType, user);
          }
        }
      }
    }
  }
  await userService.updateUser(
    { firstName: firstName, lastName: lastName },
    { where: { id: user.id } },
  );
  await userService.updateWaitListUser(
    { firstName: firstName, lastName: lastName },
    { where: { email: user.email } },
  );
  await userService.updateInviteUser(
    { firstName: firstName, lastName: lastName },
    { where: { email: user.email } },
  );
  /*Will change when update name in emailing address functionality comes in*/
  await userService.updateUserDetail(
    { firstName: firstName, lastName: lastName },
    { where: { userId: user.id } },
  );
  return true;
};

/**
 * @url POST /v2/admin/update-user-stripe-card-details
 * @description Controller will update stripe details.
 * @param {*} req request
 * @param {*} res response
 */
adminController.updateStripeCardDetails = async (req, res) => {
  logger.info('adminController update User Stripe Data:');
  try {
    const { userId, cardHolderId, email, countryCallingCode, phoneNumber } = req.body;
    const data = { email: email };
    if (!_.empty(countryCallingCode) && !_.empty(phoneNumber)) {
      data.phone_number = countryCallingCode + phoneNumber;
    }
    const userCardholderData = await userService.getUserCardholder({
      where: {
        userId,
        cardHolderStatus: STRIPE_CARDHOLDER_STATUS.ACTIVE,
        cardHolderId: cardHolderId,
      },
    });
    if (!userCardholderData?.id) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('STRIPE_CARDHOLDER_NOT_EXIST') },
        status: false,
      });
    }
    const cardServiceType = CARD_SERVICE_TYPE_BY_STRIPE_REGION[userCardholderData.cardServiceTypes];
    const stripeCardHolderData = await stripeFacadeService.getCardHolder(
      cardServiceType,
      userCardholderData.cardHolderId,
    );
    if (stripeCardHolderData && stripeCardHolderData.data) {
      await stripeFacadeService.updateCardHolderData(
        cardServiceType,
        userCardholderData.cardHolderId,
        data,
      );
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.error(`Error in update User Stripe Data: ${error}`);
  }
};

/*
 * @description Api for delete entry from waitlist table
 * @param {*} req
 * @param {*} res
 * @returns
 */
adminController.deleteWaitlistEntry = async (req, res) => {
  logger.info('deleteWaitlistEntry');
  try {
    const {
      body: { id },
    } = req;
    const waitlistedUser = await adminService.getWaitListUser({
      where: { id: id },
      attributes: ['id', 'status'],
    });
    if (waitlistedUser && waitlistedUser.status !== WAITLIST_STATUS.DELETED) {
      await adminService.updateWaitListUser(
        { status: WAITLIST_STATUS.DELETED, deletedAt: Date.now() },
        { where: { id: waitlistedUser.id } },
      );
      return res.status(SUCCESSCODE.STANDARD).json({
        msg: req.t('SUCCESS'),
        status: true,
      });
    } else {
      return res.status(SERVERERROR.CODE).json({
        errors: { msg: req.t('INVITED_USER_NOT_FOUND') },
        status: false,
      });
    }
  } catch (error) {
    logger.error(`Error at deleteWaitlistEntry ${error}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * Functionality for blocking merchant
 * @param {Object} request { transactionId: 123,  platform: US (region like us,eur,uk)}
 * @param {Object} res
 * @returns object { msg:"success", status: true }
 */
adminController.blockMerchant = async (req, res) => {
  logger.info(
    `[Admin] Blocking the merchant for transaction with ID [${req?.body?.transactionId} ${req?.body?.platform}]`,
  );
  try {
    const data = req.body;
    const transactionQuery = {
      where: { id: data.transactionId },
      attributes: ['merchantId', 'id', 'transactionType'],
      include: [
        {
          model: merchantModel,
          attributes: ['name', 'description'],
        },
      ],
    };
    const transaction = await transactionService.findOneTransaction(transactionQuery);
    // Check if transaction is exists or not
    if (_.empty(transaction)) {
      return res.status(ERROR404).json({
        errors: { msg: req.t('TRANSACTION_NOT_FOUND') },
        status: false,
      });
    }
    // Check if merchant is already blocked or not
    const blockedMerchant = await stripeService.checkIfBlockedMerchantExists(
      transaction.merchantId,
      data.platform,
    );
    if (blockedMerchant && blockedMerchant.id) {
      logger.info(`Merchant is already blocked ${blockedMerchant.id}`);
      return res.status(ERROR404).json({
        errors: { msg: req.t('MERCHANT_ALREADY_BLOCKED') },
        status: false,
      });
    }
    // preparing data for blocking the merchant
    const blockedMerchantData = {
      merchantId: transaction.merchantId,
      transactionId: data.transactionId,
      merchantName: transaction?.merchant?.name || '',
      merchantDescription: transaction?.merchant?.description || '',
      platform: data.platform,
      isBlockedByAdmin: true,
    };

    await stripeService.insertDataOfBlockedMerchants(blockedMerchantData);
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    logger.error(`Error at blockMerchant ${error}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

adminController.sendLumenAlertReviewedEmail = errorHandler.errorHandlerWrapped(async (req, res) => {
  logger.info('sendLumenAlertReviewedEmail');

  const {
    body: { emailsData },
  } = req;

  for (const emailData of emailsData) {
    const {
      companyName,
      companyId,
      value,
      alertDescription,
      alertDate,
      reviewerName,
      actions,
      additionalInfo,
    } = emailData;
    const kamSales = await companyService.findAllCompanyKAMSales(companyId);

    await Promise.all(
      kamSales.map((item) =>
        emailService.sendEmail(EMAIL_TYPE.LUMEN_ALERT_REVIEWED, {
          email: item.admin?.email,
          companyName,
          companyId,
          value,
          alertDescription: alertDescription || 'N/A',
          alertDate: formattedDate(alertDate),
          reviewDate: formattedDate(),
          reviewerName,
          actions,
          additionalInfo: additionalInfo || 'N/A',
        }),
      ),
    );
  }

  return res.status(SUCCESSCODE.STANDARD).json({
    status: true,
  });
});

adminController.makeUserLegalRepresentative = errorHandler.errorHandlerWrapped(async (req, res) => {
  logger.info('makeUserLegalRepresentative');

  const {
    body: { companyId, userId },
  } = req;

  await userService.makeUserLegalRepresentativeForCompany(companyId, userId);

  return res.status(SUCCESSCODE.STANDARD).json({
    status: true,
  });
});

adminController.editUser = async ({
  userData: {
    id,
    role,
    dateOfBirth,
    countryCallingCode,
    phoneNumber,
    is_virtual_card_creation_enable,
    is_physical_card_creation_enable,
    email,
    firstName,
    lastName,
    isNameChange,
  },
  company,
  currentRole,
  user,
}) => {
  let reqUpdateUser = {};
  if (role === ROLE.BOOKKEEPER && currentRole !== ROLE.BOOKKEEPER) {
    reqUpdateUser = {
      spendLimit: 0,
      isSetSpendLimit: false,
      role,
    };

    await stripeCardholderService.updateUserCardHolderStatus(id, STRIPE_CARDHOLDER_STATUS.INACTIVE);

    await cardServiceWeb.deleteCardsByUserId(id, CRON_ITEM_TYPES.HOUR);

    await userService.updateUserDetail(
      { isSetEmboss: EMBOSSMENT_PROCESS_TYPE.NO },
      {
        where: {
          userId: id,
          addressType: USER_DETAILS_ADDRESS_TYPES.SHIPMENT,
        },
      },
    );
  } else if (currentRole === ROLE.BOOKKEEPER && role !== ROLE.BOOKKEEPER) {
    throw new JeevesValidationError('FORBIDDEN_BOOKKEEPER_ROLE_CHANGE');

    // from bookkeeper to other role add the address of the company as the user address
    // const companyCardservice = await userService.getCompanyCardservices({
    //   where: { companyId: company.id },
    // });
    // const companyCardServiceType = companyCardservice?.cardServiceType || '';
    // await userService.addDefaultUserAddress(
    //   user,
    //   company.id,
    //   company && company.isJeevesAddress ? company.isJeevesAddress : false,
    //   companyCardServiceType
    // );
    // reqUpdateUser = {
    //   role,
    // };
  } else if (currentRole === ROLE.EMPLOYEE && role === ROLE.ADMIN) {
    reqUpdateUser = {
      role,
      spendLimit: 0,
      isSetSpendLimit: false,
    };
  } else {
    reqUpdateUser = {
      role,
    };
  }

  if (countryCallingCode && !user.countryCallingCode) {
    reqUpdateUser['countryCallingCode'] = countryCallingCode;
  }
  if (phoneNumber && !user.phoneNumber) {
    reqUpdateUser['phoneNumber'] = phoneNumber;
  }
  const edited = await userService.updateUser(reqUpdateUser, {
    where: { id: id },
    returning: true,
  });
  await userService.updateUserCardSettings(
    user,
    is_virtual_card_creation_enable,
    is_physical_card_creation_enable,
  );
  if (edited) {
    // TODO lventurini: check if this feature is still used
    /* Rush Shipment Change If Role change to Employee to Admin/Bookkeeper */
    if (currentRole === ROLE.EMPLOYEE && role === ROLE.BOOKKEEPER) {
      await companyService.deleteCardShipmentApproval({
        where: { userId: id },
        status: CARD_SHIPMENT_APPROVAL_STATUS.PENDING,
      });
    } else if (currentRole === ROLE.EMPLOYEE && role === ROLE.ADMIN) {
      const cardsRushApprovalRequest = await companyService.findCardShipmentApproval({
        where: {
          userId: id,
          status: CARD_SHIPMENT_APPROVAL_STATUS.PENDING,
        },
      });
      if (cardsRushApprovalRequest && cardsRushApprovalRequest.id) {
        // FORGIVE ME FATHER FOR I HAVE SINNED
        const companyController = require('../company/companyController');

        const rushShipmentReq = {
          body: {
            rushShipmentReqId: cardsRushApprovalRequest.id,
            action: company.isRushShipment ? 'approve' : 'decline',
            isCallFromChangeRole: true,
          },
        };
        await companyController.modifyStatusOfRushShipment(rushShipmentReq, null);
      }
    }
  } else {
    throw new JeevesValidationError('USER_EDIT_FAILED');
  }
  await userService.establishLegalRepresentative(company.id);

  const updatedUser = await userService.getUserById(id);

  /* User firstName/lastName Updated */
  if (
    isNameChange ||
    (firstName &&
      lastName &&
      (updatedUser.firstName !== firstName || updatedUser.lastName !== lastName))
  ) {
    const isNameUpdated = await adminController.updateUserName(firstName, lastName, updatedUser);
    if (!isNameUpdated) {
      throw new JeevesValidationError('USER_EDIT_FAILED');
    }
  }

  /* Email Updated */
  if (email && updatedUser.email !== email) {
    const isEmailUpdated = await adminController.updateUserEmail(email, updatedUser);
    if (!isEmailUpdated) {
      throw new JeevesValidationError('USER_EDIT_FAILED');
    }
  }

  /* DateOfBirth Updated */
  if (dateOfBirth) {
    dateOfBirth = moment(new Date(dateOfBirth)).format(DATE_FORMAT);
    if (dateOfBirth !== updatedUser.dateOfBirth) {
      const isDobUpdated = await updateUserDob(dateOfBirth, updatedUser);
      if (!isDobUpdated) {
        throw new JeevesValidationError('USER_EDIT_FAILED');
      }
    }
  }
};

/**
 * @url POST /v2/admin/user-update
 * @description updateUser will give ability to change role from cms.
 * @param {*} req request
 * @param {*} res response
 */
adminController.userUpdate = errorHandler.errorHandlerWrapped(async (req, res) => {
  logger.info('adminController/userUpdate');
  const {
    body: {
      id,
      role,
      dateOfBirth,
      countryCallingCode,
      phoneNumber,
      is_virtual_card_creation_enable,
      is_physical_card_creation_enable,
      email,
      firstName,
      lastName,
      isNameChange,
    },
    company,
    currentRole,
    user,
  } = req;

  await adminController.editUser({
    userData: {
      id,
      role,
      dateOfBirth,
      countryCallingCode,
      phoneNumber,
      is_virtual_card_creation_enable,
      is_physical_card_creation_enable,
      email,
      firstName,
      lastName,
      isNameChange,
    },
    company,
    currentRole,
    user,
  });

  return res.status(SUCCESSCODE.STANDARD).json({
    msg: req.t('USER_EDITED'),
    status: true,
  });
});

adminController.updateCvvForTutukaCards = async (userId) => {
  const cards = await cardService.findCards({
    where: {
      userId: userId,
      status: CARD_MAIN_STATUS.ACTIVE,
      cardType: CARD_TYPES.VIRTUAL,
      cardServiceType: TUTUKA_CARD_SERVICE_TYPES,
    },
    attributes: ['id', 'tutukaCardId', 'cardServiceType', 'cardType'],
  });
  for (const card of cards) {
    const data = {
      userId: userId,
      tutukaCardId: card.tutukaCardId,
      cardServiceType: card.cardServiceType,
      cardType: card.cardType,
    };
    await tutukaLocal.updateCardCvv(data);
  }
  return true;
};

/**
 * Updates CVV for Tutuka cards
 * @url POST /v2/admin/update-cvv
 * @param req - the http request
 * @param req - the http response
 */
adminController.updateCvv = async (req, res) => {
  const {
    body: { companyId: companyId, cardIds: cardIds },
  } = req;
  try {
    if (companyId) {
      const users = await adminService.getUsersByCompanyId(companyId);
      const allCompanyCardServiceTypes = await userService.getAllCompanyCardServiceTypes(companyId);
      if (hasCardServiceTypeTutuka(allCompanyCardServiceTypes)) {
        for (const user of users) {
          adminController.updateCvvForTutukaCards(user.id);
        }
      }
    }
    if (cardIds) {
      const cardsData = await cardService.findCards({
        where: {
          id: cardIds,
        },
        attributes: ['id', 'userId', 'tutukaCardId', 'cardServiceType', 'cardType'],
      });
      for (const card of cardsData) {
        if (TUTUKA_CARD_SERVICE_TYPES.includes(card.cardServiceType)) {
          const data = {
            userId: card.userId,
            tutukaCardId: card.tutukaCardId,
            cardServiceType: card.cardServiceType,
            cardType: card.cardType,
          };
          await tutukaLocal.updateCardCvv(data);
        }
      }
    }
    return res.status(SUCCESSCODE.STANDARD).json({
      msg: req.t('SUCCESS'),
      data: {},
      status: true,
    });
  } catch (err) {
    logger.error(`Error at admin login ${err} >>> ${err.stack}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * This API will be used to reset the mobile login process for given `userId`
 * Jeeves customer support will communicate back to the customer about this change
 * @param {*} req
 * @param {*} res
 * @returns
 */
adminController.resetMobileLogin = errorHandler.errorHandlerWrapped(async (req, res) => {
  const { companyIds, userIds } = req.body;
  // fetch mobile uers of provided companyId
  let userIdsToBeUpdate = [];
  let userIdsForCompany = [];
  if (companyIds?.length > 0) {
    const users = await userService.getUsers({
      companyId: companyIds,
    });
    userIdsForCompany = (users || []).map((u) => {
      return u.id;
    });
  }
  userIdsToBeUpdate = _.uniq(userIdsForCompany.concat(userIds));

  //reset the mobile login for given list of users
  await userService.resetUserMobileLogin(userIdsToBeUpdate);

  return res.status(SUCCESSCODE.STANDARD).json({
    msg: req.t('SUCCESS'),
    status: true,
  });
});

adminController.getAllCompanies = async (req, res) => {
  logger.log({ level: 'info', message: 'adminController getAllCompanies' });
  try {
    const recordsData = await adminService.getAllCompanies();

    return res.status(SUCCESSCODE.STANDARD).json({
      data: recordsData,
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    console.log('Error at getAllCompanies', error);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

adminController.getFullCompanies = async (req, res) => {
  logger.log({ level: 'info', message: 'adminController getFullCompanies' });
  try {
    const recordsData = await adminService.getFullCompanies();

    return res.status(SUCCESSCODE.STANDARD).json({
      data: recordsData,
      msg: req.t('SUCCESS'),
      status: true,
    });
  } catch (error) {
    console.log('Error at getFullCompanies', error);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};
module.exports = adminController;
