// @ts-nocheck
const express = require('express');
const adminRoutes = express.Router();
const adminMiddleware = require('./adminMiddleware');
const adminValidator = require('./adminValidator');
const adminController = require('./adminController');
const { validationResult } = require('express-validator');
const { ACTIVITY_LOGS_TYPES, PAGE422 } = require('../../db/jeeves').constants;

const loginMiddleware = [
  //   adminValidator.validateAdmin(),
  (req, res, next) => {
    req.apiType = ACTIVITY_LOGS_TYPES.ADMIN;
    const errors = ['Error'];
    if (!errors.isEmpty()) {
      return res.status(PAGE422.CODE).json({
        errors: errors.array()[0],
      });
    }
    return next();
  },
  adminMiddleware.storeAdminLogs,
  adminController.login,
];

adminRoutes.post('/login', (_req, res) => res.send('Successfully hit login route'));

export default adminRoutes;
