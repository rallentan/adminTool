// // jQuery
// let jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const { window } = new JSDOM();
// const { document } = (new JSDOM('')).window;
// global.document = document;
// let $ = jQuery = require('jquery')(window);

//Vue.prototype.$userId = document.querySelector("meta[name='user-id']").getAttribute('content');
//let user = document.querySelector("meta[name='user']").getAttribute('content');
//alert(user);

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

new Vue({
    el: '#root',

    data: {
        gameRank: undefined,
        showSuccessNotification: false,
        showErrorNotification: false,
        notificationMessage: "",
        isLoading: true,
        isSubmitting: false,
    },

    created() {
        this.refreshData();
    },

    methods: {
        async refreshData() {
            try {
                const response = await axios.post('/lastMcf');
                const data = response.data;
                if (data) {
                    if (data.gender === "male") {
                        $("#genderMale").checked = true;
                    } else if (data.gender === "female") {
                        $("#genderFemale").checked = true;
                    }
                    this.gameRank = data.gameRank;
                    $("#catapult_production").value = data.catapultProduction;
                    $("#finishedBasics").checked = data.finishedBasics;
                    $("#finishedSupplier1").checked = data.finishedSupplier1;
                    $("#finishedMonker1").checked = data.finishedMonker1;
                    $("#finishedFighter1").checked = data.finishedFighter1;
                }
            } finally {
                this.isLoading = false;
            }
        },

        async handleSubmit() {
            this.isLoading = true;
            try {
                const data = {
                    gender: document.querySelector("#gender input:checked").value,
                    gameRank: document.querySelector('#rank option:checked').value,
                    catapultProduction: document.querySelector("#catapult_production").value,
                    finishedBasics: document.querySelector("#finishedBasics").checked,
                    finishedSupplier1: document.querySelector("#finishedSupplier1").checked,
                    finishedMonker1: document.querySelector("#finishedMonker1").checked,
                    finishedFighter1: document.querySelector("#finishedFighter1").checked,
                };
                console.log(data);
                const response = await axios.post('/memberChangeForm', data)
                    .then(() => {
                        this.notificationMessage = "Success";
                        this.showErrorNotification = false;
                        this.showSuccessNotification = true;
                    })
                    .catch((ex) => {
                        //let errors = response.data.errors;
                        this.notificationMessage = ex.response.data.errors.map(e => e.msg).join('<br />');
                        this.showSuccessNotification = false;
                        this.showErrorNotification = true;
                    });
            } finally {
                this.isLoading = false;
            }
        }
    }
});
