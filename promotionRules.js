const rankMap = require('./rankMap');
const moment = require('moment-timezone');

module.exports = {
    canBeDemoted: function canBePromoted(member) {
        return member.memberRank > 1;
    },

    canBeTransferred: function canBeTransferred(member) {
        return member.memberRank >= 3 && member.memberRank < 20;
    },

    isEligibleForPromotion: function isEligibleForPromotion(member) {
        const rankName = rankMap[member.memberRank];
        const joinDate = member.joinDate ? member.joinDate : moment.utc();
        const lastRankChange = member.lastRankChange ? member.lastRankChange : moment.utc();
        const timeInService = moment.utc().diff(joinDate, 'days');
        const timeInGrade = moment.utc().diff(lastRankChange, 'days');

        switch (rankName) {
            case "Unranked":
                return true;
            case "M1":
                return timeInService >= 14;
            case "M2":
                return timeInService >= 30 && timeInGrade >= 10;
            case "M3":
                return timeInService >= 60 && timeInGrade >= 15;
            case "M4":
                return timeInService >= 90 && timeInGrade >= 15;
            case "ATL":
                return timeInService >= 90 && timeInGrade >= 30;
            case "TL":
                return timeInService >= 120 && timeInGrade >= 60;
            case "AD":
                return timeInService >= 300 && timeInGrade >= 90;
            case "D":
                return timeInService >= 480 && timeInGrade >= 90;
            case "Board":
                return false;
            default:
                throw Error("Invalid rank");
        }
    },

    isEligibleForEarlyPromotion: function isEligibleForEarlyPromotion(member) {
        const rankName = rankMap[member.memberRank];
        const joinDate = member.joinDate ? member.joinDate : moment.utc();
        const lastRankChange = member.lastRankChange ? member.lastRankChange : moment.utc();
        const timeInService = moment.utc().diff(joinDate, 'days');
        const timeInGrade = moment.utc().diff(lastRankChange, 'days');

        switch (rankName) {
            case "Unranked":
                return true;
            case "M1":
                return false;
            case "M2":
                return false;
            case "M3":
                return false;
            case "M4":
                return timeInService >= 45;
            case "ATL":
                return false;
            case "TL":
                return false;
            case "AD":
                return false;
            case "D":
                return false;
            case "Board":
                return false;
            default:
                throw Error("Invalid rank");
        }
    }
};
