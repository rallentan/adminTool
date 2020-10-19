var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const memberRepository = require('../data/memberRepository');
const userRepository = require('../data/userRepository');
const accessControl = require('../accessControl');
const promotionRules = require('../promotionRules');
const discourseForum = require('../externalServices/discourseForum');

router.post('/',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('memberId').isNumeric(),
        check('team').isIn(['Warriors', 'S-1', 'S-2', 'S-3']),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let member = await memberRepository.get(req.body.memberId);
        let user = await userRepository.getById(member.userId);
        if (!accessControl.canTransferMember(req.user, member, req.body.team)) {
            console.log(`Unauthorized access attempted by userId ${req.user.id}!`);
            return res.status(422).end();
        }
        if (!promotionRules.canBeTransferred(member)) {
            return res.status(422).end();
        }

        try {
            member.transfer(req.body.team);
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
            await memberRepository.update(member);
            return res.send({errors: false});
        } catch (ex) {
            console.log(ex);
            return res.status(500).end();
        }
    });

module.exports = router;
