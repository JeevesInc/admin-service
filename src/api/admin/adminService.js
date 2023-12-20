const {
  ROLE,
  USER_DETAILS_ADDRESS_TYPES,
  ADDRESS_REQUEST_STATUS,
  CARD_HOLDER_REGIONS,
  MODULE_NAMES,
  ALL,
  STATUS,
  ADMIN_ROLE,
  CARD_SERVICE_TYPE,
  ROLE_ACCESS_OVERRIDE_TYPE,
} = require('../../../../db').constants;
const sequelize = require('../../../../db').sequelize;
const { HARD_DELETED_USER_STATUS } = require('../../../../constants/commonConstant');
const utils = require('../../../../helper/utils');
const {
  admins: adminsModel,
  users: usersModel,
  cards: cardsModel,
  companies: companiesModel,
  company_addresses: companyAddressesModel,
  company_business_leaderships: companyBusinessLeadershipModel,
  transactions: transactionsModel,
  merchants: merchantsModel,
  states: statesModel,
  cities: citiesModel,
  user_details: userDetailsModel,
  country_lookup: countryLookupModel,
  two_factor_auth_configurations: twoFactorAuthConfigurationsModel,
  admin_settings: adminSettingsModel,
  address_settings: addressSettingsModel,
  version_management: versionManagementModel,
  address_requests: addressRequestsModel,
  missing_event_logs: missingEventLogsModel,
  currency_lookup: currencyLookupModel,
  business_ownerships: businessOwnershipsModel,
  company_contacts: companyContactsModel,
  user_stripe_cardholder_details: userStripeCardholderDetailsModel,
  roles: RolesModel,
  role_access: RoleAccessModel,
  role_access_override: RoleAccessOverrideModel,
  activity_logs: activityLogsModel,
  admin_user_activities: adminUserActivityModel,
  users_non_us_address_details: usersNonUSAddressDetailsModel,
  company_cardservices: companyCardServicesModel,
  credit_limit_default_settings: creditLimitDefaultSettingsModel,
  invite_users: inviteUsersModel,
  waitlists: waitlistsModel,
  exchange_rates: exchangeRateModel,
  card_shipment_approvals: cardShipmentApprovalModel,
} = require('../../../../db').models;

const adminService = {};
adminService.getAdminByEmail = async (email) => {
  return adminsModel.findOne({ where: { email } });
};

function calculateOverrides(overrides, roleAccessOverrideType) {
  const result = new Set();
  overrides.forEach(function (override) {
    if (roleAccessOverrideType === override.overrideType) {
      result.add(override.moduleName);
    }
  });
  return result;
}

adminService.getAdminDetailByIdOrEmail = async (idOrEmail) => {
  const query = {
    where: {
      [Op.or]: [{ email: idOrEmail }, { id: idOrEmail }],
    },
  };
  query.include = [
    {
      model: RolesModel,
      attributes: ['role'],
      include: [
        {
          model: RoleAccessModel,
          attributes: ['id', 'roleId', 'moduleName', 'moduleAccess'],
        },
      ],
    },
    {
      model: RoleAccessOverrideModel,
      as: 'roleAccessOverrides',
      attributes: ['moduleName', 'overrideType'],
    },
  ];

  let admin = await adminsModel.findOne(query);
  if (admin) {
    admin = admin.toJSON();
    if (admin.roleAccessOverrides && admin.roleAccessOverrides.length > 0) {
      const grantSet = calculateOverrides(
        admin.roleAccessOverrides,
        ROLE_ACCESS_OVERRIDE_TYPE.GRANT,
      );
      const revokeSet = calculateOverrides(
        admin.roleAccessOverrides,
        ROLE_ACCESS_OVERRIDE_TYPE.REVOKE,
      );
      // calculate existing, remove revokes and add missing grants
      const finalRoleAccess = [];
      admin.role.role_accesses.forEach(function (roleAccess) {
        if (roleAccess.moduleAccess && !revokeSet.has(roleAccess.moduleName)) {
          finalRoleAccess.push(roleAccess);
          grantSet.delete(roleAccess.moduleName);
        }
      });
      grantSet.forEach(function (moduleName) {
        if (!revokeSet.has(moduleName)) {
          finalRoleAccess.push({
            moduleName: moduleName,
            moduleAccess: true,
          });
        }
      });
      // override values
      admin.role.role_accesses = finalRoleAccess;
    }
    return admin;
  }
  return null;
};

/**
 * Returns admin enabled modules
 * @param email
 * @returns {Promise<*[]>}
 */
adminService.getAdminModulesByEmail = async (email) => {
  const adminDetails = await adminService.getAdminDetailByIdOrEmail(email);
  const modules = [];
  for (const roleAccess of adminDetails.role.role_accesses) {
    if (roleAccess.moduleAccess) {
      modules.push(roleAccess.moduleName);
    }
  }
  return modules;
};

/*
    @description add the admin detail
    @params where - contains the details for which data will retrive
*/
adminService.getAdmin = (where) => {
  return adminsModel.findOne(where);
};

adminService.get2FAConfigureRequests = async (
  countryFilter,
  skip = null,
  limit = null,
  filter,
  role,
  status,
) => {
  let query = {};

  if (status) {
    query = { where: { status } };
  }

  const companyModelWhere = countryFilter ? { geoCountryCode: countryFilter } : {};
  if (filter) {
    filter = filter.trim();
    query.where = {
      ...query.where,
      [Op.or]: [
        {
          '$user.email$': { [Op.like]: '%' + filter + '%' },
        },
        {
          '$user.firstName$': { [Op.like]: '%' + filter + '%' },
        },
        {
          '$user.lastName$': { [Op.like]: '%' + filter + '%' },
        },
      ],
    };
  }
  if (role && role !== ALL) {
    query.where = {
      ...query.where,
      '$user.role$': {
        [Op.eq]: role,
      },
    };
  }
  query.include = [
    {
      model: usersModel,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
      required: true,
      include: [
        {
          model: companiesModel,
          required: true,
          where: companyModelWhere,
          attributes: ['id', 'name', 'referenceId', 'geoCountryCode'],
        },
      ],
    },
  ];
  query.order = [['createdAt', 'DESC']];
  query.attributes = ['id', 'userId', 'status', 'createdAt'];
  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }
  const total = await twoFactorAuthConfigurationsModel.count(query);
  const requests = await twoFactorAuthConfigurationsModel.findAll(query);
  return { total, requests };
};

adminService.update2FAConfigurations = (data, query) => {
  return twoFactorAuthConfigurationsModel.update(data, query);
};

/*
    @description updates the admin detail
    @params data - contains the data to udpate
            query - contains the details for which data will update
*/
adminService.updateAdmin = async (data, query) => {
  // remove access overrides
  const adminId = query.where['id'];
  if (data.roleAccessOverrides) {
    await RoleAccessOverrideModel.destroy({
      where: {
        adminId: adminId,
      },
      force: true,
    });
    const bulkData = [];
    data.roleAccessOverrides.forEach(function (accessOverride) {
      bulkData.push({
        adminId: adminId,
        moduleName: accessOverride.moduleName,
        overrideType: accessOverride.overrideType,
      });
    });
    await RoleAccessOverrideModel.bulkCreate(bulkData);

    delete data.roleAccessOverrides;
  }
  // update user role
  return adminsModel.update(data, query);
};

adminService.updateUser = (data, query) => {
  return usersModel.update(data, query);
};

adminService.findOneUser = (query) => {
  return usersModel.findOne(query);
};

adminService.getUsersByCompanyId = (companyId) => {
  const query = {
    where: {
      companyId: companyId,
    },
    attributes: ['id', 'spentAmount'],
    paranoid: false,
  };
  return usersModel.findAll(query);
};

adminService.getAdminSettings = (raw) => {
  const query = { where: {} };
  if (raw) {
    query.raw = true;
  }
  query.attributes = ['id', 'settingKey', 'settingValue', 'settingDescription'];

  return adminSettingsModel.findAll(query);
};

adminService.findOneAdminSetting = (query) => {
  return adminSettingsModel.findOne(query);
};

adminService.updateAdminSettings = (data, query) => {
  return adminSettingsModel.update(data, query);
};

adminService.getAllVersion = () => {
  return versionManagementModel.findAll();
};

adminService.updateVersion = (minimumVersion, stableVersion, id) => {
  const query = {
    where: { id: id },
  };
  const updateData = {};
  if (minimumVersion) {
    updateData.minimumVersion = minimumVersion;
  }
  if (stableVersion) {
    updateData.stableVersion = stableVersion;
  }
  return versionManagementModel.update(updateData, query);
};

adminService.getAddress = (query) => {
  return addressSettingsModel.findAll(query);
};

adminService.updateAddress = (data, query) => {
  return addressSettingsModel.update(data, query);
};

adminService.getAddressChangeRequests = async (
  search,
  skip = null,
  limit = null,
  countryFilter,
  sortBy = null,
  sortDirection = null,
) => {
  const companyModelWhere = countryFilter ? { geoCountryCode: countryFilter } : {};
  const query = {
    where: {
      status: ADDRESS_REQUEST_STATUS.PENDING,
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
      {
        model: usersModel,
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: companiesModel,
        where: companyModelWhere,
        as: 'company',
        attributes: ['id', 'name', 'referenceId'],
      },
    ],
    order: [['createdAt', 'DESC']],
  };
  if (search) {
    search = search.trim();
    query.where = {
      [Op.or]: [
        {
          '$company.id$': { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.name$': { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.referenceId$': { [Op.like]: '%' + search + '%' },
        },
        sequelize.where(
          sequelize.fn(
            'concat',
            sequelize.col('user.firstName'),
            ' ',
            sequelize.col('user.lastName'),
          ),
          {
            [Op.like]: '%' + search + '%',
          },
        ),
      ],
    };
  }
  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }
  if (sortBy && sortDirection && sortBy == 'orgId') {
    query.order = [['companyId', sortDirection]];
  }
  const data = await addressRequestsModel.findAll(query);
  const total = await addressRequestsModel.count(query);
  return { total, data };
};

adminService.findOneAddressChangeRequest = (addressChangeRequestId) => {
  const query = {
    where: {
      id: addressChangeRequestId,
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
      {
        model: usersModel,
        include: [
          {
            model: userStripeCardholderDetailsModel,
            as: 'userCardHolders',
            attributes: ['cardHolderId', 'cardHolderStatus', 'cardServiceTypes'],
          },
        ],
      },
      {
        model: companiesModel,
        as: 'company',
        include: [
          {
            model: companyCardServicesModel,
            as: 'companyCardServices',
            attributes: ['cardServiceType'],
          },
        ],
      },
    ],
  };
  return addressRequestsModel.findOne(query);
};

adminService.updateUserDetails = (data, query) => {
  return userDetailsModel.update(data, query);
};

adminService.updateAddressChangeRequest = (data, query) => {
  return addressRequestsModel.update(data, query);
};

adminService.findUsersWithUserDetailsById = (companyId, userId, role) => {
  const query = {
    where: {},
  };
  if (role === ROLE.ADMIN) {
    query.where.companyId = companyId;
  } else {
    query.where.userId = userId;
  }
  query.attributes = ['id', 'firstName', 'lastName'];
  query.include = [
    {
      model: userDetailsModel,
      where: {
        addressType: USER_DETAILS_ADDRESS_TYPES.PROFILE,
      },
      attributes: ['id', 'addressType'],
    },
    {
      model: userStripeCardholderDetailsModel,
      as: 'userCardHolders',
      attributes: ['cardHolderId', 'cardHolderStatus', 'cardServiceTypes'],
    },
  ];
  return usersModel.findAll(query);
};

// getUkCountryCode
adminService.getValidCountryCode = (countryCode) => {
  return countryCode === 'UK' ? 'GB' : countryCode;
};

adminService.getMissingEvents = async (
  skip = null,
  limit = null,
  search,
  filterParams,
  countryFilter,
  sortBy = null,
  sortDirection = null,
) => {
  const companyModelWhere = countryFilter ? { geoCountryCode: countryFilter } : {};
  const query = {
    where: {},
    include: [
      {
        model: transactionsModel,
        required: true,
        include: [
          {
            model: companiesModel,
            paranoid: false,
            where: companyModelWhere,
            attributes: ['id', 'referenceId', 'name'],
            required: true,
          },
          {
            model: usersModel,
            paranoid: false,
            attributes: ['id', 'firstName', 'lastName', 'role'],
          },
          {
            model: merchantsModel,
            paranoid: false,
            attributes: ['id', 'name', 'address', 'description', 'website'],
          },
          {
            model: cardsModel,
            paranoid: false,
            attributes: [
              'id',
              [sequelize.fn('RIGHT', sequelize.col('cardNumber'), 4), 'cardNumber'],
            ],
          },
          {
            model: currencyLookupModel,
            as: 'localCurrencyLookup',
            attributes: ['numericCode', 'alphaCode'],
          },
        ],
        attributes: [
          'id',
          'transactionAmount',
          'localCurrency',
          'localCurrencyAmount',
          'transactionStatus',
          'currency',
        ],
      },
    ],
  };
  if (search) {
    query.where = {
      [Op.or]: [
        {
          transactionId: { [Op.like]: '%' + search + '%' },
        },
        {
          '$transaction.company.name$': { [Op.like]: '%' + search + '%' },
        },
        {
          '$transaction.company.referenceId$': {
            [Op.like]: '%' + search + '%',
          },
        },
        {
          '$transaction.company.id$': { [Op.like]: '%' + search + '%' },
        },
        sequelize.where(
          sequelize.fn(
            'concat',
            sequelize.col('transaction.user.firstName'),
            ' ',
            sequelize.col('transaction.user.lastName'),
          ),
          {
            [Op.like]: '%' + search + '%',
          },
        ),
        {
          '$transaction.card.cardNumber$': { [Op.like]: '%' + search + '%' },
        },
      ],
    };
  }
  if (filterParams.eventType && filterParams.eventType !== ALL) {
    query.where.eventType = {
      [Op.eq]: filterParams.eventType,
    };
  }
  if (filterParams.transactionStatus && filterParams.transactionStatus !== ALL) {
    query.where['$transaction.transactionStatus$'] = {
      [Op.eq]: filterParams.transactionStatus,
    };
  }
  const total = await missingEventLogsModel.count(query);
  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }
  if (sortBy && sortDirection && sortBy == 'orgId') {
    query.order = [[transactionsModel, 'companyId', sortDirection]];
  } else {
    query.order = [['createdAt', 'DESC']];
  }
  const events = await missingEventLogsModel.findAll(query);
  return { total, events };
};

adminService.getAllUsers = async (
  skip = null,
  limit = null,
  search,
  filterParams,
  countryFilter,
  sortBy = null,
  sortDirection = null,
) => {
  const query = { where: {} };
  const companyModelWhere = countryFilter ? { geoCountryCode: countryFilter } : {};
  if (search) {
    search = search.trim();
    query.where = {
      [Op.or]: [
        {
          $email$: { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.referenceId$': { [Op.like]: '%' + search + '%' },
        },
        sequelize.where(
          sequelize.fn('concat', sequelize.col('firstName'), ' ', sequelize.col('lastName')),
          { [Op.like]: '%' + search + '%' },
        ),
        {
          '$company.id$': { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.name$': { [Op.like]: '%' + search + '%' },
        },
      ],
    };
  }
  if (filterParams) {
    if (filterParams.status && filterParams.status !== ALL) {
      query.where.status = {
        [Op.eq]: filterParams.status,
      };
    }
    if (filterParams.role && filterParams.role !== ALL) {
      query.where.role = {
        [Op.eq]: filterParams.role,
      };
    }
    if (filterParams.userStatus) {
      if (filterParams.userStatus === STATUS.DELETED) {
        query.paranoid = false;

        query.where.status = {
          [Op.eq]: STATUS.DELETED,
        };
      } else if (filterParams.userStatus === HARD_DELETED_USER_STATUS) {
        query.paranoid = false;

        query.where.deletedAt = {
          [Op.ne]: null,
        };
      } else {
        query.where.status = {
          [Op.eq]: filterParams.userStatus,
        };
      }
    }
  }
  query.include = [
    {
      paranoid: false,
      model: companiesModel,
      where: companyModelWhere,
      attributes: ['id', 'referenceId', 'name', ['billingCurrency', 'displayCurrency']],
      include: [
        {
          model: companyCardServicesModel,
          as: 'companyCardServices',
          attributes: ['cardServiceType'],
          limit: 1,
        },
      ],
    },
  ];
  if (sortBy && sortDirection && sortBy == 'orgId') {
    query.order = [['companyId', sortDirection]];
  } else {
    query.order = [['createdAt', 'DESC']];
  }
  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }
  query.attributes = [
    'id',
    'companyId',
    'firstName',
    'lastName',
    'dateOfBirth',
    'countryCallingCode',
    'phoneNumber',
    'email',
    'role',
    'spendLimit',
    'spentAmount',
    'status',
    'isSetSpendLimit',
    'createdAt',
    'deletedAt',
    'isDeletedForce',
    'is_physical_card_creation_enable',
    'is_virtual_card_creation_enable',
  ];
  const data = await usersModel.findAll(query);
  const total = await usersModel.count(query);
  return { total, data };
};

adminService.getAllInvitedUsers = async (
  skip = null,
  limit = null,
  search,
  filterParams,
  countryFilter,
  sortBy = null,
  sortDirection = null,
) => {
  const query = { where: {} };
  const companyModelWhere = countryFilter ? { geoCountryCode: countryFilter } : {};
  if (search) {
    search = search.trim();
    query.where = {
      [Op.or]: [
        {
          $email$: { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.referenceId$': { [Op.like]: '%' + search + '%' },
        },
        sequelize.where(
          sequelize.fn('concat', sequelize.col('firstName'), ' ', sequelize.col('lastName')),
          { [Op.like]: '%' + search + '%' },
        ),
        {
          '$company.id$': { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.name$': { [Op.like]: '%' + search + '%' },
        },
      ],
    };
  }
  query.where.status = {
    [Op.eq]: STATUS.PENDING,
  };

  if (filterParams) {
    if (filterParams.role && filterParams.role !== ALL) {
      query.where.role = {
        [Op.eq]: filterParams.role,
      };
    }

    if (filterParams.companyId) {
      query.where['$company.id$'] = {
        [Op.eq]: filterParams.companyId,
      };
    }
  }
  query.include = [
    {
      required: true,
      model: companiesModel,
      where: companyModelWhere,
      attributes: ['id', 'referenceId', 'name', ['billingCurrency', 'displayCurrency']],
      include: [
        {
          model: companyCardServicesModel,
          as: 'companyCardServices',
          attributes: ['cardServiceType'],
          limit: 1,
        },
      ],
    },
  ];
  if (sortBy && sortDirection && sortBy == 'orgId') {
    query.order = [['companyId', sortDirection]];
  } else {
    query.order = [['createdAt', 'DESC']];
  }

  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }
  query.attributes = [
    'id',
    'companyId',
    'firstName',
    'lastName',
    'email',
    'role',
    'spendLimit',
    'status',
    'isSetSpendLimit',
    'createdAt',
    'isDelegate',
    'is_physical_card_creation_enable',
    'is_virtual_card_creation_enable',
  ];
  const data = await inviteUsersModel.findAll(query);
  const total = await inviteUsersModel.count(query);
  return { total, data };
};

adminService.getUser = (where) => {
  return usersModel.findOne(where);
};

adminService.deleteUser = (query) => {
  return usersModel.destroy(query);
};

adminService.deleteUserDetails = (query) => {
  return userDetailsModel.destroy(query);
};

adminService.updateUserDetail = (data, query) => {
  return userDetailsModel.update(data, query);
};

adminService.getUserCards = async (id) => {
  const query = { where: { userId: id } };
  query.include = [
    {
      model: usersModel,
      attributes: ['id', 'firstName', 'lastName'],
    },
  ];
  return await cardsModel.findAll(query);
};

adminService.getCard = async (query) => {
  return await cardsModel.findOne(query);
};

adminService.getAllCards = async (query) => {
  return await cardsModel.findAll(query);
};

adminService.getCountry = () => {
  const query = {
    where: {
      [Op.or]: [
        {
          name: ['Mexico', 'US', 'UK', 'Europe', 'Colombia', 'Canada', 'Brazil'],
        },
        {
          alpha2Code: ['Mexico', 'US', 'UK', 'Europe', 'Colombia', 'Canada', 'Brazil'],
        },
      ],
    },
    attributes: ['name', 'alpha2Code', 'numericCode'],
    raw: true,
  };
  return countryLookupModel.findAll(query);
};

adminService.getCurrency = () => {
  const query = {
    where: {
      // alphaCode: ['MXN', 'USD', 'GBP', 'EUR', 'CAD'],
      isDisplay: 1,
    },
    attributes: ['alphaCode', 'numericCode'],
    raw: true,
  };

  return currencyLookupModel.findAll(query);
};

adminService.getContactInformation = async (countryFilter) => {
  const query = {
    where: {},
    attributes: ['id', 'name', 'createdAt', 'legalName', 'EIN', 'isStpAvailable'],
  };
  if (countryFilter !== null) {
    query.where.geoCountryCode = countryFilter;
  }
  query.include = [
    {
      model: usersModel,
      as: 'users',
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
    },
    {
      model: countryLookupModel,
      as: 'geoCountryCodeLookup',
      attributes: ['alpha2Code', 'name'],
    },
    {
      model: businessOwnershipsModel,
      attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth'],
    },
    {
      model: companyContactsModel,
      as: 'companyContacts',
      attributes: ['id', 'firstName', 'lastName', 'positionTitle', 'phoneNumber'],
    },
    {
      model: companyCardServicesModel,
      as: 'companyCardServices',
      attributes: ['cardServiceType'],
      paranoid: false,
    },
    {
      model: currencyLookupModel,
      attributes: ['numericCode', 'alphaCode', 'currency'],
    },
  ];
  query.order = [['createdAt', 'DESC']];

  return await companiesModel.findAll(query);
};

/*
    @description to add the admin detail
    @params data - contains the data to add in admin table
*/
adminService.addSubAdmin = async (data) => {
  return await adminsModel.create(data);
};

adminService.getSubAdminById = async (id) => {
  return adminsModel.findOne({
    attributes: ['id', 'firstName', 'lastName', 'email'],
    where: { id: id },
  });
};

// get sub admin
adminService.getSubAdmin = async (skip = null, limit = null, search, filterParams) => {
  const query = { where: {} };
  if (search) {
    search = search.trim();
    query.where = {
      [Op.or]: [
        {
          $email$: { [Op.like]: '%' + search + '%' },
        },
        {
          $firstName$: { [Op.like]: '%' + search + '%' },
        },
        {
          $lastName$: { [Op.like]: '%' + search + '%' },
        },
      ],
    };
  }
  if (filterParams) {
    if (filterParams.role && filterParams.role !== ALL) {
      query.where['$role.role$'] = {
        [Op.eq]: filterParams.role,
      };
    }
  }
  query.order = [['createdAt', 'DESC']];
  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }
  query.attributes = ['id', 'firstName', 'lastName', 'email', 'status', 'createdAt'];
  query.include = [
    {
      model: RolesModel,
      attributes: ['id', 'role'],
    },
    {
      model: RoleAccessOverrideModel,
      as: 'roleAccessOverrides',
      attributes: ['moduleName', 'overrideType'],
    },
  ];
  const data = await adminsModel.findAll(query);
  const total = await adminsModel.count(query);
  return { total, data };
};

// delete sub admin
adminService.deleteSubAdmin = (id) => {
  return adminsModel.destroy({ where: { id: id } });
};

// get admin role
adminService.getManagerAndSalesAdmin = (filter) => {
  const query = {
    attributes: ['id', 'firstName', 'lastName', 'email'],
    where: {},
  };
  if (filter) {
    filter = filter.trim();
    query.where = {
      [Op.or]: [
        {
          firstName: { [Op.like]: '%' + filter + '%' },
        },
        {
          lastName: { [Op.like]: '%' + filter + '%' },
        },
        {
          id: { [Op.like]: '%' + filter + '%' },
        },
        {
          email: { [Op.like]: '%' + filter + '%' },
        },
      ],
    };
  }
  query.include = [
    {
      model: RolesModel,
      attributes: ['role'],
      where: {
        [Op.and]: [
          {
            role: {
              [Op.ne]: ADMIN_ROLE.SUPERADMIN,
            },
          },
        ],
      },
    },
  ];

  return adminsModel.findAll(query);
};

// get admin role
adminService.getAdminRole = () => {
  const query = { attributes: ['id', 'role'] };
  return RolesModel.findAll(query);
};

// get admin module
adminService.getAdminModules = () => {
  return MODULE_NAMES;
};

// update admin access
adminService.updateAdminAccess = async (modules) => {
  const query = {
    fields: [
      'id',
      'roleId',
      'moduleName',
      'insertAccess',
      'viewAccess',
      'editAccess',
      'deleteAccess',
      'moduleAccess',
    ],
    updateOnDuplicate: ['moduleAccess', 'updatedAt'],
  };

  if (modules.length > 0) {
    return await RoleAccessModel.bulkCreate(modules, query);
  }
};

// get admin access
adminService.getAdminAccess = async (roleId) => {
  const query = { where: { roleId: roleId } };
  query.attributes = [
    'id',
    'roleId',
    'moduleName',
    'editAccess',
    'viewAccess',
    'insertAccess',
    'moduleAccess',
  ];
  return await RoleAccessModel.findAll(query);
};

// create activity log
adminService.createActivityLog = (data) => {
  return activityLogsModel.create(data);
};

// Create Admin activity log for every route
adminService.createAdminActivityLog = async (data) => {
  try {
    return adminUserActivityModel.create(data);
  } catch (e) {
    logger.error(`problem during createAdminActivityLog: ${e} >>> ${e.stack}`);
  }
};

/*
    @description get users with non US, UK and EUR address data
    @params skip - contains details to skip number of record in query
            limit - contains details to limit number of record in query
            filterParams - contains details to filter data in query
*/
adminService.getNonUsUkEurAddressList = async (
  filterParams,
  skip = null,
  limit = null,
  countryFilter,
  sortBy = null,
  sortDirection = null,
) => {
  const { startDate, endDate, search, cardServiceType } = filterParams;
  const query = { where: {} };
  query.subQuery = false;
  const companyModelWhere = countryFilter ? { geoCountryCode: countryFilter } : {};
  if (startDate && endDate) {
    query.where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }
  if (cardServiceType) {
    query.where = {
      ...query.where,
      '$company.companyCardServices.cardServiceType$': cardServiceType,
    };
  }
  if (search) {
    query.where = {
      ...query.where,
      [Op.or]: [
        {
          companyId: { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.name$': { [Op.like]: '%' + search + '%' },
        },
        {
          '$company.referenceId$': { [Op.like]: '%' + search + '%' },
        },
        {
          userId: { [Op.like]: '%' + search + '%' },
        },
        sequelize.where(
          sequelize.fn(
            'concat',
            sequelize.col('user.firstName'),
            ' ',
            sequelize.col('user.lastName'),
          ),
          {
            [Op.like]: '%' + search + '%',
          },
        ),
      ],
    };
  }
  if (sortBy && sortDirection && sortBy == 'orgId') {
    query.order = [['companyId', sortDirection]];
  } else {
    query.order = [['createdAt', 'DESC']];
  }

  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }
  query.attributes = ['id', 'userAddress', 'userId', 'companyId', 'stripeCardId', 'createdAt'];
  query.include = [
    {
      model: usersModel,
      attributes: ['firstName', 'lastName', 'email', 'countryCallingCode', 'phoneNumber', 'role'],
      required: true,
    },
    {
      model: companiesModel,
      where: companyModelWhere,
      attributes: ['id', 'name', 'referenceId'],
      required: true,
      include: [
        {
          model: companyCardServicesModel,
          as: 'companyCardServices',
          attributes: ['cardServiceType'],
        },
      ],
    },
    {
      model: countryLookupModel,
      as: 'shipToCountry',
      attributes: ['name'],
    },
    {
      model: statesModel,
      as: 'shipToState',
      attributes: ['stateName'],
    },
  ];
  const data = await usersNonUSAddressDetailsModel.findAll(query);
  const total = await usersNonUSAddressDetailsModel.count(query);
  const parsedData = [];
  for (const element of data) {
    const parsedUserAddress = element.userAddress ? JSON.parse(element.userAddress) : null;
    let cardServiceType =
      element.company &&
      element.company.companyCardServices &&
      element.company.companyCardServices[0] &&
      element.company.companyCardServices[0].cardServiceType
        ? element.company.companyCardServices[0].cardServiceType
        : '';

    // because after migration from stripe US to tutka compnay can still have stripeUS cards along with new tutuka
    if (
      !_.includes(
        [CARD_SERVICE_TYPE.STRIPEUS, CARD_SERVICE_TYPE.STRIPEUK, CARD_SERVICE_TYPE.STRIPEEUR],
        cardServiceType,
      ) &&
      !utils.empty(element.stripeCardId)
    ) {
      const cardData = await adminService.getCard({
        where: {
          stripeCardId: element.stripeCardId,
        },
        attributes: ['cardServiceType'],
        paranoid: false,
      });

      if (!utils.empty(cardData.cardServiceType)) {
        cardServiceType = cardData.cardServiceType;
      }
    }

    parsedData.push({
      id: element.id,
      userId: element.userId,
      userFirstName: element.user && element.user.firstName,
      userLastName: element.user && element.user.lastName,
      userEmail: element.user && element.user.email,
      userPhoneNumber:
        element.user && element.user.phoneNumber
          ? `${element.user.countryCallingCode} ${element.user.phoneNumber}`
          : '',
      role: element.user && element.user.role,
      companyId: element.companyId,
      companyName: element.company && element.company.name,
      referenceId: element.company && element.company.referenceId,
      cardServiceType: cardServiceType,
      shipToUserFirstName: parsedUserAddress && parsedUserAddress.firstName,
      shipToUserLastName: parsedUserAddress && parsedUserAddress.lastName,
      shipToAddress1: parsedUserAddress && parsedUserAddress.address1,
      shipToAddress2: parsedUserAddress && parsedUserAddress.address2,
      shipToCity: parsedUserAddress && parsedUserAddress.city,
      shipToState: element.shipToState && element.shipToState.stateName,
      shipToCountry: element.shipToCountry && element.shipToCountry.name,
      shipToZipCode: parsedUserAddress && parsedUserAddress.zipcode,
      createdAt: element.createdAt,
    });
  }
  return { total, data: parsedData };
};

adminService.addCreditLimit = async (data) => {
  return creditLimitDefaultSettingsModel.create(data);
};

adminService.editCreditLimit = (data, query) => {
  return creditLimitDefaultSettingsModel.update(data, query);
};

adminService.getCreditLimit = async (skip = null, limit = null, filter) => {
  const query = { where: {} };
  if (filter) {
    filter = filter.trim();
    query.where = {
      [Op.or]: [
        {
          region: { [Op.like]: '%' + filter + '%' },
        },
      ],
    };
  }
  if (limit !== null && skip !== null) {
    query.limit = limit;
    query.offset = skip;
  }

  const { count, rows } = await creditLimitDefaultSettingsModel.findAndCountAll(query);
  return { total: count, records: rows };
};

adminService.deleteCreditLimit = async (id) => {
  return creditLimitDefaultSettingsModel.destroy({ where: { id: id } });
};

adminService.findAllCountry = () => {
  return countryLookupModel.findAll({
    order: [['name', 'ASC']],
    attributes: ['numericCode', 'name', 'alpha2Code'],
  });
};

adminService.findExchangeRateCurrencies = async () => {
  const sourceCurrencies = await exchangeRateModel.findAll({
    attributes: [
      [sequelize.fn('DISTINCT', sequelize.col('sourceCurrency')), 'numericCode'],
      [sequelize.col('sourceCurrencyDetails.currency'), 'name'],
    ],
    include: [
      {
        model: currencyLookupModel,
        attributes: [],
        unique: true,
        as: 'sourceCurrencyDetails',
      },
    ],
    group: ['sourceCurrency'],
  });
  const destinationCurrencies = await exchangeRateModel.findAll({
    attributes: [
      [sequelize.fn('DISTINCT', sequelize.col('destinationCurrency')), 'numericCode'],
      [sequelize.col('destinationCurrencyDetails.currency'), 'name'],
    ],
    include: [
      {
        model: currencyLookupModel,
        attributes: [],
        unique: true,
        as: 'destinationCurrencyDetails',
      },
    ],
    group: ['destinationCurrency'],
  });
  return { sourceCurrencies, destinationCurrencies };
};

adminService.getAdminSettingsByKeys = (keys) => {
  return adminSettingsModel.findAll({
    where: {
      settingKey: {
        [Op.in]: keys,
      },
    },
  });
};

adminService.findUniqueCountry = () => {
  return companiesModel.findAll({
    order: [[{ model: countryLookupModel, as: 'geoCountryCodeLookup' }, 'name', 'ASC']],
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('geoCountryCode')), 'geoCountryCode']],
    include: [
      {
        model: countryLookupModel,
        attributes: ['numericCode', 'name', 'alpha2Code'],
        unique: true,
        as: 'geoCountryCodeLookup',
      },
    ],
    group: ['geoCountryCode'],
    paranoid: false,
  });
};

adminService.getUsersByQuery = (query) => {
  return usersModel.findAll(query);
};

adminService.getWaitListUser = (data) => {
  return waitlistsModel.findOne(data);
};

adminService.getInviteUser = (where) => {
  return inviteUsersModel.findOne(where);
};

adminService.bulkCreateInviteUsers = (data) => {
  return inviteUsersModel.bulkCreate(data);
};

adminService.getCompanyDetail = (where) => {
  return companiesModel.findOne(where);
};

adminService.getInviteUsers = (where) => {
  return inviteUsersModel.findAll(where);
};

adminService.updateInviteUser = (data, query) => {
  return inviteUsersModel.update(data, query);
};

adminService.deleteInviteUser = (query) => {
  return inviteUsersModel.destroy(query);
};

adminService.updateWaitListUser = (data, query) => {
  return waitlistsModel.update(data, query);
};

adminService.getRushShipmentApproval = (query) => {
  return cardShipmentApprovalModel.findOne(query);
};

adminService.deleteRushShipmentApproval = (query) => {
  return cardShipmentApprovalModel.destroy(query);
};

adminService.getUserDetails = async (userId) => {
  const query = {
    where: { id: userId },
    attributes: [
      'id',
      'companyId',
      'firstName',
      'lastName',
      'dateOfBirth',
      'countryCallingCode',
      'phoneNumber',
      'email',
      'role',
      'spendLimit',
      'spentAmount',
      'status',
      'isSetSpendLimit',
      'isDeletedForce',
    ],
    include: [
      {
        model: companiesModel,
        attributes: ['id', 'referenceId', 'name', ['billingCurrency', 'displayCurrency']],
        include: [
          {
            model: companyCardServicesModel,
            as: 'companyCardServices',
            attributes: ['cardServiceType'],
            limit: 1,
          },
        ],
      },
    ],
  };
  return usersModel.findOne(query);
};

adminService.getInvitedUserDetails = async (userId) => {
  const query = {
    where: { id: userId },
    attributes: [
      'id',
      'companyId',
      'firstName',
      'lastName',
      'email',
      'role',
      'spendLimit',
      'status',
      'isSetSpendLimit',
      'deletedAt',
    ],
    include: [
      {
        model: companiesModel,
        attributes: ['id', 'referenceId', 'name', ['billingCurrency', 'displayCurrency']],
        include: [
          {
            model: companyCardServicesModel,
            as: 'companyCardServices',
            attributes: ['cardServiceType'],
            limit: 1,
          },
        ],
      },
    ],
  };
  return inviteUsersModel.findOne(query);
};

adminService.getAllCompanies = async () => {
  try {
    const companies = await companiesModel.findAll({
      attributes: ['id', 'name', 'website', 'businessAddress'],
      where: { status: 'active' },
    });

    return companies;
  } catch (error) {
    console.error(error);

    return error;
  }
};

adminService.getFullCompanies = async () => {
  try {
    const companies = await companiesModel.findAll({
      attributes: ['id', 'name', 'website', 'businessAddress'],
    });

    return companies;
  } catch (error) {
    console.error(error);

    return error;
  }
};

module.exports = adminService;
