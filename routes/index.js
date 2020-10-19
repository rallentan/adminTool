var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const accessControl = require('../accessControl');

router.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res, next) {
        if (!accessControl.canViewDashboard(req.user)) {
            res.redirect('memberChangeForm');
        } else {
            res.render('index', {user: req.user});
        }
    });

module.exports = router;
