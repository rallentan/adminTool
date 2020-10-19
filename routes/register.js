let express = require('express');
let router = express.Router();
let passport = require('passport');
let userRepository = require('../data/userRepository');
const { check, validationResult } = require('express-validator');
const discourseForum = require('../externalServices/discourseForum');

router.get('/', function (req, res, next) {
    res.render('register', {title: 'Express'});
});

router.post('/', [
        check('username').trim().isLength({min: 3, max: 25}),
        check('email').isEmail().normalizeEmail(),
        check('password').isLength({min: 8, max: 50})
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('/register');
        }
        try {
            if (req.body.password !== req.body.confirm_password)
                throw Error("Passwords do not match");
            let user = {username: req.body.username, email: req.body.email, password: req.body.password};
            await userRepository.addUser(user);
            res.render('needApproval');
        } catch (ex) {
            console.log("Error registering user: " + ex);
            res.redirect('/register');
        }
    });

module.exports = router;
