const config = require('./config');
const memberRepository = require('./data/memberRepository');

module.exports = {
    canViewDashboard: function canApproveUsers(user) {
        return hasAccess(user, config.viewDashboardAC);
    },

    canViewProfile: function canViewProfile(user, memberId) {
        return hasAccess(user, config.viewProfileAC);
    },

    canEditProfile: function canEditProfile(user, memberId) {
        return hasAccess(user, config.editProfileAC);
    },

    canApproveUsers: function canApproveUsers(user) {
        return hasAccess(user, config.approveUsersAC);
    },

    canGetRoster: function canGetRoster(user) {
        return this.canGetLocalRoster(user) || this.canGetFullRoster(user);
    },

    canGetLocalRoster: function canGetLocalRoster(user) {
        return hasAccess(user, config.getLocalRosterAC);
    },

    canGetFullRoster: function canGetFullRoster(user) {
        return hasAccess(user, config.getFullRosterAC);
    },

    canPromoteMember: function canPromoteMember(user, member) {
        if (member.memberRank <= 4)
            return (user.memberRank >= 10 && user.memberCompartment === 'S-1') || user.memberRank >= 20;
        else if (member.memberRank <= 5)
            return (user.memberRank >= 11 && user.memberCompartment === 'S-1') || user.memberRank >= 20;
        else if (member.memberRank <= 10)
            return user.memberRank >= 20;
        else
            return user.memberRank >= 21;
    },

    canForcePromoteMember: function canForcePromoteMember(user, member) {
        return user.memberRank >= 20;
    },

    canDemoteMember: function canDemoteMember(user, member) {
        if (member.memberRank < 10)
            return user.memberRank >= 12;
        else if (member.memberRank < 20)
            return user.memberRank >= 20;
        else
            return user.memberRank >= 21;
    },

    canTransferMember: function canDemoteMember(user, member, compartment) {
        switch (user.memberRank) {
            case 12:
                return member.memberRank <= 11
                    && member.memberCompartment === ''
                    && user.memberCompartment === compartment;
            case 20:
            case 21:
                return true;
            default:
                return false;
        }
    },
};

function hasAccess(user, ac) {
    if (!user)
        return false;
    if (!user.memberRank)
        return false;
    if (user.memberRank >= 20 && config.boardHasAllAccess)
        return true;
    for (let requirement of ac) {
        if (user.memberRank < requirement.minRank) {
            continue;
        }
        if (requirement.compartment !== 'all'
            && user.memberCompartment !== requirement.compartment) {
            continue;
        }
        return true;
    }
    return false;
}
