var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const memberRepository = require('../data/memberRepository');
const userRepository = require('../data/userRepository');
const discourseForum = require('../externalServices/discourseForum');

router.post('/',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('memberId').isNumeric(),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let member = await memberRepository.get(req.body.memberId);
        let user = await userRepository.getById(member.userId);

        try {
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
            return res.send({errors: false});
        } catch (ex) {
            console.log(ex);
            return res.status(500).end();
        }
    });

module.exports = router;
