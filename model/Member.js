const moment = require('moment-timezone');
const promotionRules = require('../promotionRules');

module.exports = {
    promote: function promote() {
        this.memberRank += 1;
        if (this.memberRank === 6)
            this.memberRank = 10;
        else if (this.memberRank === 13)
            this.memberRank = 20;
        else if (this.memberRank === 21)
            throw Error("Cannot promote past the highest rank");
        this.lastRankChange = moment.utc();
    },

    demote: function demote() {
        this.memberRank -= 1;
        if (this.memberRank === 19)
            this.memberRank = 12;
        else if (this.memberRank === 9)
            this.memberRank = 5;
        else if (this.memberRank === -1)
            throw Error("Cannot demote past the lowest rank");
        if (this.memberRank <= 1)
            this.memberCompartment = '';
        this.lastRankChange = moment.utc();
    },

    transfer: function transfer(compartment) {
        if (!promotionRules.canBeTransferred(this)) {
            throw Error("Member cannot be transferred");
        }
        this.memberCompartment = compartment;
    }
};
