var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const memberChangeFormRepository = require('../data/memberChangeFormRepository');
const memberRepository = require('../data/memberRepository');

router.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res, next) {
        res.render('memberChangeForm', {user: req.user});
    });

router.post('/',
    require('connect-ensure-login').ensureLoggedIn(),
    [
        check('gender').isIn(['male', 'female']),
        check('gameRank').isInt({ min: 1, max: 23 }),
        check('catapultProduction').isNumeric(),
        check('finishedBasics').isBoolean(),
        check('finishedSupplier1').isBoolean(),
        check('finishedMonker1').isBoolean(),
        check('finishedFighter1').isBoolean(),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        try {
            //const rank = rankMap[req.body.rank];
            const form = {
                userId: req.user.id,
                gender: req.body.gender,
                gameRank: req.body.gameRank,
                catapultProduction: req.body.catapultProduction,
                finishedBasics: req.body.finishedBasics,
                finishedSupplier1: req.body.finishedSupplier1,
                finishedMonker1: req.body.finishedMonker1,
                finishedFighter1: req.body.finishedFighter1,
            };
            await memberChangeFormRepository.add(form);
            await memberRepository.addOrUpdate(form);
            res.send({errors: null});
        } catch (ex) {
            res.status(500).send({errors: [{msg: 'An error occurred'}]});
        }
    });

module.exports = router;
