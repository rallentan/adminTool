var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const userRepository = require('../data/userRepository');
const accessControl = require('../accessControl');
const discourseForum = require('../externalServices/discourseForum');

router.post('/',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('userId').isNumeric(),
    ],
    async (req, res, next) => {
        if (!accessControl.canApproveUsers(req.user)) {
            if (req.user) {
                console.log(`Unauthorized access attempted by userId ${req.user.id}!`);
            } else {
                console.log(`Unauthorized access attempted by unauthenticated user!`);
            }
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        try {
            const user = await userRepository.getById(req.body.userId);
            user.forumUserId = await discourseForum.createUser(user.username, user.email, user.password);
            await userRepository.update(user);
            await userRepository.approveUser(req.body.userId);
            res.send({errors: false});
        } catch (ex) {
            console.log(ex);
            res.status(500).end();
        }
    });

module.exports = router;
