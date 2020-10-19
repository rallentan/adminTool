var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const memberChangeFormRepository = require('../data/memberChangeFormRepository');

router.post('/',
    require('connect-ensure-login').ensureLoggedIn(),
    async (req, res, next) => {
        try {
            const lastMcf = await memberChangeFormRepository.getLast(req.user.id);
            delete lastMcf.userId;
            delete lastMcf.createdTimestamp;
            res.send(lastMcf);
        } catch (ex) {
            console.log(ex);
            res.status(500).end();
            // res.status(422).send({errors: [{msg: 'An error occurred'}]});
        }
    });

module.exports = router;
