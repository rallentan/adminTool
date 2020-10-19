let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
var engines = require('consolidate');
let passport = require('passport');
let bodyParser = require('body-parser').urlencoded({extended: true});
let LocalStrategy = require('passport-local').Strategy;
let userRepository = require('./data/userRepository')
let memberViewRepository = require('./data/memberViewRepository')


// Passport example: https://github.com/passport/express-4.x-local-example/blob/master/server.js

// TODO: Implement security best practices
// https://medium.com/@nodepractices/were-under-attack-23-node-js-security-best-practices-e33c146cb87d

passport.use(
    new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function (username, password, cb) {
            // NOTE: If this function fails to run at all, it's probably because usernameField or passwordField are
            // set incorrectly.
            console.log(username);
            userRepository.getByUsername(username)
                .then(user => {
                    if (!user) {
                        return cb(null, false);
                    }
                    if (password !== user.password) {
                        return cb(null, false);
                    }
                    if (!user.approved) {
                        return cb(null, false);
                    }
                    if (user.suspended) {
                        return cb(null, false);
                    }
                    return cb(null, user);
                })
                .catch(err => {
                    return cb(err);
                });
        }
    ));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    memberViewRepository.getByUserId(id)
        .then(user => {
            if (!user) {
                return cb(null, false);
            }
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
});

let app = express();

app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({extended: false}));
//app.use(cookieParser("keyboard cat"));
app.use(require('body-parser').urlencoded({extended: true}));  // parse application/x-www-form-urlencoded
app.use(require('body-parser').json());  // parse application/json
app.use(require('express-session')({
    secret: 'hru483jw3iw9fufyqi',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));
app.use(passport.initialize());
app.use(passport.session());

// view engine
app.set('views', path.join(__dirname, './views'));
app.engine('html', engines.ejs);
app.set('view engine', 'html');

// serve static files from 'public'
app.use(express.static(path.join(__dirname, './public'), {'extensions': ['html']}));

app.all('/', require('./routes/index'));
app.use('/login', require('./routes/login'));
app.use('/register', require('./routes/register'));
app.use('/lastMcf', require('./routes/lastMcf'));
app.use('/memberChangeForm', require('./routes/memberChangeForm'));
app.use('/getUnapprovedUsers', require('./routes/getUnapprovedUsers'));
app.use('/approveUser', require('./routes/approveUser'));
app.use('/getRoster', require('./routes/getRoster'));
app.use('/promoteMember', require('./routes/promoteMember'));
app.use('/demoteMember', require('./routes/demoteMember'));
app.use('/transferMember', require('./routes/transferMember'));
app.use('/updatePermissions', require('./routes/updatePermissions'));
app.use('/member', require('./routes/member'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: app.get('env') === 'development' ? err : {},
    });
    //next();
});

module.exports = app;
