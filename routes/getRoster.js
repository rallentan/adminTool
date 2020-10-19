var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const memberViewRepository = require('../data/memberViewRepository');
const accessControl = require('../accessControl');
const rankMap = require('../rankMap');
const promotionRules = require('../promotionRules');
const moment = require('moment-timezone');

router.post('/',
    require('connect-ensure-login').ensureLoggedIn(),
    async (req, res, next) => {
        if (!accessControl.canGetRoster(req.user)) {
            if (req.user) {
                console.log(`Unauthorized access attempted by userId ${req.user.id}!`);
            } else {
                console.log(`Unauthorized access attempted by unauthenticated user!`);
            }
        }
        try {
            let members = await memberViewRepository.getAll();
            members = members.filter(m => m.approved && !m.suspended)
            if (accessControl.canGetFullRoster(req.user)) {
                members = members.filter(m => m.memberRank < req.user.memberRank);
            } else if (accessControl.canGetLocalRoster(req.user)) {
                members = members.filter(m => m.memberCompartment === req.user.memberCompartment);
                members = members.filter(m => m.memberRank < req.user.memberRank);
            }
            members = members.sort((m1, m2) => {
                const m1Rank = typeof m1.memberRank !== "undefined" ? m1.memberRank : -1;
                const m2Rank = typeof m1.memberRank !== "undefined" ? m2.memberRank : -1;
                if (m1Rank !== m2Rank)
                    return m2Rank - m1Rank;
                else
                    return m1.username.localeCompare(m2.username);
            });
            members = members.map(m => {
                const joinDate = m.joinDate ? m.joinDate : moment.utc();
                const lastRankChange = m.lastRankChange ? m.lastRankChange : moment.utc();
                let memberView = {};
                memberView.id = m.memberId;
                memberView.name = m.username;
                memberView.rank = rankMap[m.memberRank];
                memberView.compartment = m.memberCompartment;
                memberView.timeInService = moment.utc().diff(joinDate, 'months') + ' mo';
                memberView.timeInGrade = moment.utc().diff(lastRankChange, 'days') + ' d';
                memberView.activity = m.discordActivity;
                if (memberView.rank) {
                    memberView.eligibleForPromotion = promotionRules.isEligibleForPromotion(m);
                    memberView.canPromote = accessControl.canPromoteMember(req.user, m);
                    memberView.canDemote = accessControl.canDemoteMember(req.user, m) && promotionRules.canBeDemoted(m);
                    memberView.canTransfer = accessControl.canTransferMember(req.user, m)
                        && promotionRules.canBeTransferred(m);
                }
                return memberView;
            });
            res.send({members: members});
        } catch (ex) {
            console.log(ex);
            res.status(500).end();
        }
    });

module.exports = router;
