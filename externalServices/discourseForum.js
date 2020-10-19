const config = require('../config');
const axios = require('axios');

const axiosInstance = axios.create({
    baseURL: 'XXXXX',
    timeout: 15000,
    headers: config.discourseApiHeaders,
});

const discourseRankGroupMap = {
    1: 'members',
    2: 'members',
    3: 'members',
    4: 'members',
    5: 'atls',
    10: 'team_leaders',
    11: 'assistant_directors',
    12: 'directors',
    20: 'board',
    21: 'board',
};

const discourseCompartmentGroupMap = {
    'Warrior': 'warriors',
    'S-1': 'S-1',
    'S-2': 'S-2',
    'S-3': 'S-3',
};

let groups = null;

module.exports = {
    createUser: async function createUser(name, email, password) {
        const username = name.replace(/ /g, '');
        const response = await axiosInstance.post(`/users`, {
            name: name,
            email: email,
            password: password,
            username: username,
        });
        return response.data['user_id'];
    },

    setPermissions: async function setPermissions(forumUserId, rank, compartment) {
        if (!groups) {
            groups = await loadGroups();
        }
        let response;

        response = await axiosInstance.get(`/admin/users/${forumUserId}.json`);
        let user = response.data;

        await Promise.all(Object.entries(discourseRankGroupMap).map(async kvp => {
            const groupId = findGroupId(kvp[1]);
            if (rank === parseInt(kvp[0])) {
                //Add to group
                if (!(user.groups.find(g => g.id === groupId))) {
                    response = await axiosInstance.post(`/admin/users/${forumUserId}/groups`, {group_id: groupId});
                }
            } else {
                // Remove from group
                if (user.groups.find(g => g.id === groupId)) {
                    response = await axiosInstance.delete(`/admin/users/${forumUserId}/groups/${groupId}`);
                }
            }
        }));

        await Promise.all(Object.entries(discourseCompartmentGroupMap).map(async kvp => {
            const groupId = findGroupId(kvp[1]);
            if (compartment === parseInt(kvp[0])) {
                //Add to group
                if (!(user.groups.find(g => g.id === groupId))) {
                    response = await axiosInstance.post(`/admin/users/${forumUserId}/groups`, {group_id: groupId});
                }
            } else {
                // Remove from group
                if (user.groups.find(g => g.id === groupId)) {
                    response = await axiosInstance.delete(`/admin/users/${forumUserId}/groups/${groupId}`);
                }
            }
        }));
    },
};

function findGroupId(groupName) {
    const group = groups.find(g => g.name === groupName);
    return group.id;
}

async function loadGroups() {
    const response = await axiosInstance.get(`/groups.json`, {}, config.discourseApiAxiosConfig);
    return response.data.groups;
}
