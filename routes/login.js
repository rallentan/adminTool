var express = require('express');
var router = express.Router();
let passport = require('passport');

router.get('/', function(req, res, next) {
    res.render('login', { title: 'Express' });
});

router.post('/', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            res.redirect('/login');
        } else if (!user) {
            res.redirect('/login');
        } else {
            console.log('user logged in: ' + user.username);
            req.login(user, (error) => {
                if (error)
                    return next(error);
            });
            res.redirect('/');
        }
    })(req, res, next);
});

module.exports = router;
