const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

new Vue({
    el: '#root',

    data: {
        unapprovedUsers: false,
        members: false,
        showTeamSelectModal: false,
        selectedMember: {},
    },

    created() {
        this.refreshData();
        setInterval(this.refreshData, 5000);
    },

    methods: {
        showTeamSelect(member) {
            this.showTeamSelectModal = true;
            this.selectedMember = member;
        },

        async refreshData() {
            await this.refreshUnapprovedUsers();
            await this.refreshRoster();
        },

        async refreshUnapprovedUsers() {
            try {
                const response = await axios.post('/getUnapprovedUsers');
                const data = response.data;
                if (data) {
                    this.unapprovedUsers = (data.unapprovedUsers.length > 0) ? data.unapprovedUsers : false;
                }
            } finally {
            }
        },

        async refreshRoster() {
            try {
                const response = await axios.post('/getRoster');
                const data = response.data;
                if (data) {
                    this.members = (data.members.length > 0) ? data.members : false;
                }
            } finally {
            }
        },

        async approveUser(userId) {
            try {
                await axios.post('/approveUser', {userId: userId});
                await this.refreshData();
            } finally {
            }
        },

        async promoteMember(memberId) {
            try {
                await axios.post('/promoteMember', {memberId: memberId});
                await this.refreshData();
            } finally {
            }
        },

        async demoteMember(memberId) {
            try {
                await axios.post('/demoteMember', {memberId: memberId});
                await this.refreshData();
            } finally {
            }
        },

        async transferMember() {
            try {
                const team = $('#teamSelect option:checked').value;
                await axios.post('/transferMember', {memberId: this.selectedMember.id, team: team});
                this.showTeamSelectModal = false;
                await this.refreshData();
            } finally {
            }
        },

        async updatePermissions(memberId) {
            try {
                await axios.post('/updatePermissions', {memberId: memberId});
                await this.refreshData();
            } finally {
            }
        },
    }
});
