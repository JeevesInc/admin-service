// load helper and modules
const moment = require('moment');
const uuid = require('uuid/v4');
const {
  validateSpendLimitForTutukaProcessors,
  isCardServiceTypeTutuka,
} = require('../../utils/card-utils');
const { ERROR400, SERVERERROR, PAGE404, PAGE422 } = require('../../constants');
const userService = require('../../web/user/userService');
const adminMiddleware = {};
const { ROLE, STATUS, ADMIN_SETTINGS_KEYS, WAITLIST_STATUS, ACTIVITY_LOGS_TYPES } =
  require('../../db/jeeves').constants;
const _ = require('lodash');

const { logger } = require('../../../../config/logger');
const commonService = require('../../web/common/commonService');
const adminService = require('./adminService');

// Check email is does't exists
adminMiddleware.emailDoesNotExists = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/emailDoesNotExists',
  });
  try {
    const { email } = req.body;
    const admin = await adminService.getAdminByEmail(email);
    if (_.empty(admin)) {
      return res.status(ERROR400).json({
        errors: { msg: req.t("USER_DOESN'T EXISTS") },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at adminMiddleware/emailDoesNotExists ' + error + ' ' + error.stack,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// Check email is exist
adminMiddleware.emailExist = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/emailExist',
  });
  try {
    const { email } = req.body;
    const admin = await adminService.getAdminByEmail(email);
    if (!_.empty(admin)) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('USER_EMAIL_EXISTS') },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at adminMiddleware/emailExist ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* find and set address change request */
adminMiddleware.findAndSetAddressChangeRequest = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/findAndSetAddressChangeRequest',
  });
  try {
    const {
      body: { id: addressChangeRequestId },
    } = req;
    const addressChangeRequestDetails = await adminService.findOneAddressChangeRequest(
      addressChangeRequestId,
    );
    /* if address change request not found */
    if (!addressChangeRequestDetails) {
      return res.status(ERROR400).json({
        errors: { msg: req.t('ADDRESS_CHANGE_REQUEST_NOT_FOUND') },
        status: false,
      });
    }
    req.body.state = addressChangeRequestDetails.state.stateName;
    req.body.city = addressChangeRequestDetails.city.cityName;
    req.body.stateCode = addressChangeRequestDetails.state.stateCode;
    req.addressChangeRequestDetails = addressChangeRequestDetails;
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at adminMiddleware/findAndSetAddressChangeRequest ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// Check sub admin exist
adminMiddleware.isSubAdminExist = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/isSubAdminExist',
  });
  try {
    const { subAdminId } = req.params;
    const findQuery = {
      where: {
        id: subAdminId,
      },
    };
    const admin = await adminService.getAdmin(findQuery);
    if (!admin) {
      return res.status(PAGE404.CODE).json({
        errors: { msg: req.t('SUB_ADMIN_NOT_FOUND') },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at adminMiddleware/isSubAdminExist ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Store all activity/logs for add-update-delete operations.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
adminMiddleware.storeAdminLogs = async (req, res, next) => {
  try {
    const scrubbedBody = utils.scrubSensitiveFields(_.cloneDeep(req.body));
    logger.info(
      `${req.method} request to ${req.originalUrl} - Request body: ${JSON.stringify(scrubbedBody)}`,
    );
    const auditData = commonService.createAuditDataPayload(req);
    const activityLog = {
      id: uuid(),
      userId: req?.authAdmin?.id ?? '',
      email: req?.authAdmin?.email ?? req?.body?.email ?? '',
      source: JSON.stringify(auditData),
      platform: req?.headers['platform-type']
        ? req.headers['platform-type'].toUpperCase()
        : 'ADMIN',
      method: req.method,
      route: req.originalUrl ? req.originalUrl : '',
      requestData: JSON.stringify(scrubbedBody),
    };

    //this is called in async mode, I don't want to wait the result
    adminService.createAdminActivityLog(activityLog).then();

    req.auditData = auditData;
  } catch (e) {
    logger.error(`Error at adminMiddleware storeAdminLogs: ${e} >>>  ${e.stack}`);
  }
  //do not block any operation if store logs is failing
  next();
};

// Check users spend limit
adminMiddleware.validateSpendLimitInArray = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/validateSpendLimitInArray',
  });
  try {
    const { companyId, users } = req.body;
    const allCompanyCardServiceTypes = await userService.getAllCompanyCardServiceTypes(companyId);
    for (const element of users) {
      for (const cardServiceType of allCompanyCardServiceTypes) {
        if (isCardServiceTypeTutuka(cardServiceType)) {
          validateSpendLimitForTutukaProcessors(req, res, {
            spendLimit: element.spendLimit,
            cardServiceType,
            raise: true,
          });
        }
      }
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at adminMiddleware/validateSpendLimitInArray ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description check duplicates email in request body
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
adminMiddleware.validateDuplicateEmailsInBody = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/validateDuplicateEmailsInBody',
  });
  try {
    const { users } = req.body;
    let duplicateEmails = [];
    let concateDuplicateEmails;
    duplicateEmails = _.filter(
      _.uniq(
        _.map(users, function (user) {
          user.email = user.email.toLowerCase();
          if (_.filter(users, { email: user.email }).length > 1) {
            return user.email;
          }
          return false;
        }),
      ),
      function (value) {
        return value;
      },
    );
    if (duplicateEmails.length > 0) {
      concateDuplicateEmails = duplicateEmails.join();
      return res.status(ERROR400).json({
        errors: {
          msg: `'${concateDuplicateEmails}' email address is duplicate. please remove and make correct them.`,
        },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at adminMiddleware/validateDuplicateEmailsInBody ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Check email is exists in wait-list,invite-user, users table
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
adminMiddleware.emailExistsInArray = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/emailExistsInArray',
  });
  try {
    const { users } = req.body;
    let user;
    const existsUsers = [];
    let concatUsers;
    // check user in database
    for (const element of users) {
      if (element && element.email) {
        element.email = element.email.toLowerCase();
      }
      user = await adminService.getWaitListUser({
        where: { email: element.email },
        attributes: ['id'],
      });
      if (!_.empty(user)) {
        if (existsUsers.indexOf(element.email) === -1) {
          existsUsers.push(element.email);
        }
      }
      user = await adminService.getInviteUser({
        where: { email: element.email },
        attributes: ['id'],
      });
      if (!_.empty(user)) {
        if (existsUsers.indexOf(element.email) === -1) {
          existsUsers.push(element.email);
        }
      }
      user = await adminService.findOneUser({
        where: { email: element.email },
        attributes: ['id'],
      });
      if (!_.empty(user)) {
        if (existsUsers.indexOf(element.email) === -1) {
          existsUsers.push(element.email);
        }
      }
    }
    if (existsUsers.length > 0) {
      concatUsers = existsUsers.join();
      return res.status(ERROR400).json({
        errors: {
          msg: req.t('ERR_EMAIL_ALREADT_REGISTER_OR_INVITED').replace(/{EMAIL}/gi, concatUsers),
        },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at adminMiddleware/emailExistsInArray ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/* Set  User to Invite User Field For Card Holder Check For at least One admin left  */
adminMiddleware.setUserForCardHolderAndCheckAdmin = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/setUserForCardHolderAndCheckAdmin',
  });
  try {
    const {
      body: { id, role },
    } = req;
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(SERVERERROR.CODE).json({
        errors: { msg: req.t('USER_NOT_EXIST') },
        status: false,
      });
    }
    if (user.status !== 'active') {
      return res.status(SERVERERROR.CODE).json({
        errors: { msg: req.t('ACTIVE_USERS_ONLY') },
        status: false,
      });
    }
    const activeAdmins = await userService.getUsersCount({
      where: {
        companyId: user.companyId,
        role: ROLE.ADMIN,
        status: STATUS.ACTIVE,
      },
    });
    req.currentRole = user.role;
    user.role = role;
    req.user = user;
    if (req.currentRole == ROLE.ADMIN && (role == ROLE.BOOKKEEPER || role == ROLE.EMPLOYEE)) {
      if (activeAdmins > 0 && activeAdmins == 1) {
        return res.status(SERVERERROR.CODE).json({
          errors: { msg: req.t('ATLEAST_ONE_ADMIN') },
          status: false,
        });
      }
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: `adminMiddleware/setUserForCardHolderAndCheckAdmin - ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// find and set company
adminMiddleware.findAndSetCompany = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/findAndSetCompany',
  });
  try {
    let companyId;
    if (req && req.user && req.user.companyId) {
      companyId = req.user.companyId;
    }
    const company = await userService.findOneCompanyWithAttributes({ id: companyId }, [
      'id',
      'name',
      'isRushShipment',
    ]);
    req.company = company;
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at adminMiddleware/findAndSetCompany ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

// check invited none bookkeeper user DOB, phone number and country code
adminMiddleware.checkNoneBookkeeperUser = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/checkNoneBookkeeperUser',
  });
  try {
    const {
      body: { role, dateOfBirth, countryCallingCode, phoneNumber },
      user,
    } = req;
    if (
      (!dateOfBirth || dateOfBirth == '') &&
      !user.dateOfBirth &&
      (role === ROLE.ADMIN || role === ROLE.EMPLOYEE)
    ) {
      return res.status(PAGE422.CODE).json({
        errors: { msg: req.t('FIELD_REQUIRED', { FIELD: 'Date of birth' }) },
        status: false,
      });
    }
    if (
      (!countryCallingCode || countryCallingCode == '') &&
      !user.countryCallingCode &&
      (role === ROLE.ADMIN || role === ROLE.EMPLOYEE)
    ) {
      return res.status(PAGE422.CODE).json({
        errors: {
          msg: req.t('FIELD_REQUIRED', { FIELD: 'Country calling code' }),
        },
        status: false,
      });
    }
    if (
      (!phoneNumber || phoneNumber == '') &&
      !user.phoneNumber &&
      (role === ROLE.ADMIN || role === ROLE.EMPLOYEE)
    ) {
      return res.status(PAGE422.CODE).json({
        errors: { msg: req.t('FIELD_REQUIRED', { FIELD: 'Phone number' }) },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: 'Error at adminMiddleware/checkNoneBookkeeperUser ' + error,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Validate deleted user is exsit in reactivate user criteria.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
adminMiddleware.emailDeletedButExists = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/emailDeletedButExists',
  });
  try {
    const { users } = req.body;
    let compareDate;
    const existsUsers = [];
    const configData = await adminService.findOneAdminSetting({
      where: {
        settingKey: ADMIN_SETTINGS_KEYS.USER_ACCOUNT_RECOVERY_INTERVAL,
      },
      attributes: ['settingValue'],
    });
    if (configData && Object.hasOwn(configData.dataValues, 'settingValue')) {
      const days = parseInt(configData.dataValues.settingValue);
      compareDate = moment(new Date()).subtract(days, 'days');
    }
    let userData;
    let deletedDate;
    for (const element of users) {
      if (element && element.email) {
        element.email = element.email.toLowerCase();
      }
      userData = await adminService.findOneUser({
        where: {
          email: element.email,
          isDeletedForce: false,
          status: STATUS.DELETED,
          deletedAt: {
            [Op.ne]: null,
          },
        },
        atributes: ['deletedAt'],
        paranoid: false,
      });
      if (!_.empty(userData)) {
        deletedDate = moment(new Date(userData.deletedAt));
        if (deletedDate > compareDate) {
          existsUsers.push(element.email);
        }
      }
    }
    if (existsUsers.length > 0) {
      const concatUsers = existsUsers.join();
      return res.status(ERROR400).json({
        errors: {
          msg: req.t('ERR_ACCOUNT_ALREADY_EXIST').replace(/{EMAIL}/gi, concatUsers),
        },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at adminMiddleware/emailDeletedButExists ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Validate deleted user is exsit in reactivate user criteria.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
adminMiddleware.emailDeletedButExistsEditInviteUser = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/emailDeletedButExistsEditInviteUser',
  });
  try {
    let { email } = req.body;
    let compareDate;
    const configData = await adminService.findOneAdminSetting({
      where: {
        settingKey: ADMIN_SETTINGS_KEYS.USER_ACCOUNT_RECOVERY_INTERVAL,
      },
      attributes: ['settingValue'],
    });
    if (configData && Object.hasOwn(configData.dataValues, 'settingValue')) {
      const days = parseInt(configData.dataValues.settingValue);
      compareDate = moment(new Date()).subtract(days, 'days');
    }
    let deletedDate;

    email = email.toLowerCase();
    const userData = await adminService.findOneUser({
      where: {
        email: email,
        isDeletedForce: false,
        status: STATUS.DELETED,
        deletedAt: {
          [Op.ne]: null,
        },
      },
      atributes: ['deletedAt'],
      paranoid: false,
    });
    if (!_.empty(userData)) {
      deletedDate = moment(new Date(userData.deletedAt));
      if (deletedDate > compareDate) {
        return res.status(ERROR400).json({
          errors: {
            msg: req.t('ERR_ACCOUNT_ALREADY_EXIST').replace(/{EMAIL}/gi, email),
          },
          status: false,
        });
      }
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at adminMiddleware/emailDeletedButExistsEditInviteUser ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Check email is exists in wait-list,invite-user, users table
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
adminMiddleware.emailExistsEditInviteUser = async (req, res, next) => {
  logger.log({
    level: 'info',
    message: 'adminMiddleware/emailExistsEditInviteUser',
  });
  try {
    // eslint-disable-next-line prefer-const
    let { email, inviteId } = req.body;
    let user;
    let isUserExist = false;
    // check user in database
    email = email.toLowerCase();
    user = await adminService.getWaitListUser({
      where: { email: email },
      attributes: ['id'],
    });
    if (!_.empty(user)) {
      isUserExist = true;
    }

    user = await adminService.getInviteUser({
      where: { email: email, id: { [Op.ne]: inviteId } },
      attributes: ['id'],
    });
    if (!_.empty(user)) {
      isUserExist = true;
    }
    user = await adminService.findOneUser({
      where: { email: email },
      attributes: ['id'],
    });
    if (!_.empty(user)) {
      isUserExist = true;
    }
    if (isUserExist) {
      return res.status(ERROR400).json({
        errors: {
          msg: req.t('ERR_EMAIL_ALREADT_REGISTER_OR_INVITED').replace(/{EMAIL}/gi, email),
        },
        status: false,
      });
    }
    next();
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error at adminMiddleware/emailExistsEditInviteUser ${error}`,
    });
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

/**
 * @description Validate email before updating user email.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
adminMiddleware.checkIfEmailExist = async (req, res, next) => {
  logger.info('adminMiddleware/checkIfEmailExistForUpdate');
  try {
    const {
      body: { email, id },
    } = req;
    if (email) {
      const user = await userService.getUser({
        where: {
          email: email,
          id: { [Op.ne]: id },
        },
        raw: true,
        attributes: ['email', 'id'],
      });
      if (user) {
        return res.status(ERROR400).json({
          errors: { msg: req.t('USER_EMAIL_EXISTS') },
          status: false,
        });
      }
      const invitedUser = await userService.getInviteUser({
        where: {
          email: email,
          status: { [Op.eq]: STATUS.PENDING },
        },
        raw: true,
        attributes: ['email', 'id'],
      });
      if (invitedUser) {
        return res.status(ERROR400).json({
          errors: { msg: req.t('USER_EMAIL_EXISTS') },
          status: false,
        });
      }
      const waitListedUser = await userService.getWaitListUser({
        where: {
          email: email,
          status: {
            [Op.in]: [WAITLIST_STATUS.INVITED, WAITLIST_STATUS.WAITLISTED],
          },
        },
        raw: true,
        attributes: ['email', 'id'],
      });
      if (waitListedUser) {
        return res.status(ERROR400).json({
          errors: { msg: req.t('USER_EMAIL_EXISTS') },
          status: false,
        });
      }
      const existsUsers = [];
      let compareDate = null;
      const configData = await userService.findOneAdminSetting({
        where: {
          settingKey: ADMIN_SETTINGS_KEYS.USER_ACCOUNT_RECOVERY_INTERVAL,
        },
        attributes: ['settingValue'],
      });
      if (configData && Object.hasOwn(configData.dataValues, 'settingValue')) {
        const days = parseInt(configData.dataValues.settingValue);
        compareDate = moment(new Date()).subtract(days, 'days');
      }
      let deletedDate;
      const deletedUser = await userService.getUser({
        where: {
          email: email,
          isDeletedForce: false,
          status: STATUS.DELETED,
          deletedAt: {
            [Op.ne]: null,
          },
        },
        paranoid: false,
      });
      if (!_.empty(deletedUser)) {
        deletedDate = moment(new Date(deletedUser.deletedAt));
        if (deletedDate > compareDate) {
          existsUsers.push(email);
        }
      }
      if (existsUsers.length > 0) {
        const concatUsers = existsUsers.join();
        return res.status(ERROR400).json({
          errors: {
            msg: req.t('ERR_ACCOUNT_ALREADY_EXIST').replace(/{EMAIL}/gi, concatUsers),
          },
          status: false,
        });
      }
    }
    next();
  } catch (error) {
    logger.error(`Error at adminMiddleware/checkIfEmailExistForUpdate :- ${error}`);
    return res.status(SERVERERROR.CODE).json({
      errors: { msg: req.t(SERVERERROR.MESSAGE) },
      status: false,
    });
  }
};

module.exports = adminMiddleware;
