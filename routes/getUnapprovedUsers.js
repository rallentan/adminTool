var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const userRepository = require('../data/userRepository');
const accessControl = require('../accessControl');

router.post('/',
    require('connect-ensure-login').ensureLoggedIn(),
    async (req, res, next) => {
        if (!accessControl.canApproveUsers(req.user)) {
            return res.status(422).end();
        }
        try {
            const unapprovedUsers = await userRepository.getUnapprovedUsers();
            return res.send({unapprovedUsers: unapprovedUsers});
        } catch (ex) {
            console.log(ex);
            return res.status(500).end();
        }
    });

module.exports = router;
