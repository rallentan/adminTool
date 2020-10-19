var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const memberRepository = require('../data/memberRepository');
const userRepository = require('../data/userRepository');
const accessControl = require('../accessControl');
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
        if (!accessControl.canDemoteMember(req.user, member)) {
            console.log(`Unauthorized access attempted by userId ${req.user.id}!`);
            return res.status(422).end();
        }

        try {
            member.demote();
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
            await memberRepository.update(member);
            return res.send({errors: false});
        } catch (ex) {
            console.log(ex);
            return res.status(500).end();
        }
    });

module.exports = router;
