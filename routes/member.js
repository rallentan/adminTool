var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const accessControl = require('../accessControl');
const memberViewRepository = require('../data/memberViewRepository');
const memberRepository = require('../data/memberRepository');
const rankMap = require('../rankMap');
const promotionRules = require('../promotionRules');
const moment = require('moment-timezone');
const discourseForum = require('../externalServices/discourseForum');
const userRepository = require('../data/userRepository');
const memberChangeFormRepository = require('../data/memberChangeFormRepository');
let path = require('path');

router.get('/:memberId',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('memberId').isInt(),
    ],
    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        const memberId = parseInt(req.params.memberId);
        if (!accessControl.canViewProfile(req.user, req.params.memberId)) {
            return res.status(422).end();
        }

        const member = await memberViewRepository.getByMemberId(memberId);

        let changeForms = await memberChangeFormRepository.getByMemberId(memberId);
        changeForms = changeForms.map(f => {
            return {date: f.createdTimestamp.format('YYYY-MM-DD'), gameRank: f.gameRank}
        });

        const joinDate = member.joinDate ? member.joinDate : moment.utc();
        const lastRankChange = member.lastRankChange ? member.lastRankChange : moment.utc();
        let memberView = {};
        memberView.id = member.memberId;
        memberView.name = member.username;
        memberView.rank = rankMap[member.memberRank];
        memberView.compartment = member.memberCompartment;
        memberView.timeInService = moment.utc().diff(joinDate, 'months') + ' mo';
        memberView.timeInGrade = moment.utc().diff(lastRankChange, 'days') + ' d';
        memberView.activity = member.discordActivity;
        memberView.gameRank = member.gameRank;
        memberView.catapultProduction = member.catapultProduction;
        memberView.changeForms = changeForms;
        if (memberView.rank) {
            memberView.eligibleForPromotion = promotionRules.isEligibleForPromotion(member);
            memberView.canPromote = accessControl.canPromoteMember(req.user, member);
            memberView.canDemote = accessControl.canDemoteMember(req.user, member) && promotionRules.canBeDemoted(member);
            memberView.canTransfer = accessControl.canTransferMember(req.user, member)
                && promotionRules.canBeTransferred(member);
            memberView.links = [];
            if (memberView.eligibleForPromotion && memberView.canPromote)
                memberView.links.push({href: path.join(req.originalUrl, './promote'), rel: 'promote', type: 'post'});
            if (accessControl.canForcePromoteMember(req.user, member))
                memberView.links.push({
                    href: path.join(req.originalUrl, './forcePromote'),
                    rel: 'forcePromote',
                    type: 'post'
                });
            if (memberView.canDemote)
                memberView.links.push({href: path.join(req.originalUrl, './demote'), rel: 'demote', type: 'post'});
            if (memberView.canTransfer)
                memberView.links.push({href: path.join(req.originalUrl, './transfer'), rel: 'transfer', type: 'post'});
            if (memberView.canPromote || memberView.canDemote || memberView.canTransfer)
                memberView.links.push({
                    href: path.join(req.originalUrl, './fixPermissions'),
                    rel: 'fixPermissions',
                    type: 'post'
                });
        }

        if (req.accepts('html')) {
            return res.render('member', {member: memberView});
        } else if (req.accepts('json')) {
            return res.send(memberView);
        }
        return res.status(404).end();
    });

router.put('/:memberId',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('memberId').isInt(),
        check('rank').isInt(),
        check('compartment').isIn(['', 'Warrior', 'S-1', 'S-2', 'S-3']),
    ],
    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        const memberId = parseInt(req.params.memberId);
        if (!accessControl.canEditProfile(req.user, req.params.memberId)) {
            return res.status(422).end();
        }

        return res.status(404).end();

        const member = await memberRepository.get(memberId);
        member.rank = req.body.rank;
        member.memberCompartment = req.body.compartment;
        await memberRepository.update(member);
        return res.send({errors: false});
    });

router.post('/:memberId/promote',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('memberId').isNumeric(),
    ],
    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let member = await memberRepository.get(req.body.memberId);
        let user = await userRepository.getById(member.userId);
        if (!accessControl.canPromoteMember(req.user, member)) {
            console.log(`Unauthorized access attempted by userId ${req.user.id}!`);
            return res.status(422).end();
        }
        if (!promotionRules.isEligibleForPromotion(member)) {
            console.log(`Unauthorized access attempted by userId ${req.user.id}!`);
            return res.status(422).end();
        }

        member.promote();
        if (user.forumUserId)
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
        await memberRepository.update(member);
        return res.send({errors: false});
    });

router.post('/:memberId/forcePromote',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('memberId').isNumeric(),
    ],
    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let member = await memberRepository.get(req.body.memberId);
        let user = await userRepository.getById(member.userId);
        if (!accessControl.canForcePromoteMember(req.user, member)) {
            console.log(`Unauthorized access attempted by userId ${req.user.id}!`);
            return res.status(422).end();
        }

        member.promote();
        if (user.forumUserId)
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
        await memberRepository.update(member);
        return res.send({errors: false});
    });

router.post('/:memberId/demote',
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

        member.demote();
        if (user.forumUserId)
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
        await memberRepository.update(member);
        return res.send({errors: false});
    });

router.post('/:memberId/transfer',
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

        member.transfer(req.body.team);
        if (user.forumUserId)
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
        await memberRepository.update(member);
        return res.send({errors: false});
    });

router.post('/:memberId/fixPermissions',
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

        if (user.forumUserId)
            await discourseForum.setPermissions(user.forumUserId, member.memberRank, member.memberCompartment);
        return res.send({errors: false});
    });

module.exports = router;
