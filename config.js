module.exports = {
    mode: process.env.mode || 'Production',
    dbHost: process.env.dbHost,
    dbPort: process.env.dbPort || '3306',
    dbUser: process.env.dbUser,
    dbPassword: process.env.dbPassword,
    dbDatabase: process.env.dbDatabase || 'adminTool',

    discourseApiHeaders: {
        'Api-Key': process.env.discourseApiKey,
        'Api-Username': 'system'
    },

    viewDashboardAC: [{minRank: 10, compartment: 'all'}],
    viewProfileAC: [{minRank: 10, compartment: 'S-1'}],
    editProfileAC: [{minRank: 10, compartment: 'S-1'}],
    approveUsersAC: [{minRank: 10, compartment: 'S-1'}],
    getLocalRosterAC: [{minRank: 10, compartment: 'all'}],
    getFullRosterAC: [{minRank: 20, compartment: 'all'}],
    boardHasAllAccess: true,
};
