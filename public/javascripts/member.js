const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

new Vue({
    el: '#root',

    data: {
        unapprovedUsers: false,
        members: false,
        showTeamSelectModal: false,
        selectedMember: {},
        links: [],
        editingTeam: false,
    },

    created() {
        this.loadLinks();
    },

    methods: {
        loadLinks() {
            const links = document.getElementsByTagName('link');
            for (let l of links) {
                if (l.getAttribute('rel') === 'stylesheet')
                    continue;
                let link = {};
                link.href = l.getAttribute('href');
                link.rel = l.getAttribute('rel');
                link.type = l.getAttribute('type');
                this.links.push(link);
            }
        },

        async callApi(linkRel, data) {
            const link = this.links.find(l => l.rel === linkRel);
            return await axios[link.type](link.href, data);
        },

        async promoteMember(memberId) {
            await this.callApi('promote', {memberId: memberId});
            location.reload();
        },

        async forcePromoteMember(memberId) {
            await this.callApi('forcePromote', {memberId: memberId});
            location.reload();
        },

        async demoteMember(memberId) {
            await this.callApi('demote', {memberId: memberId});
            location.reload();
        },

        async transferMember(memberId) {
            const team = $('#teamSelect option:checked').value;
            await this.callApi('transfer', {memberId: memberId, team: team});
            this.editingTeam = false;
            location.reload();
        },

        async fixPermissions(memberId) {
            await this.callApi('fixPermissions', {memberId: memberId, team: team});
        },
    }
});
