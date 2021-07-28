'use strict'

const { i18n, storage, identity } = chrome;

// * Components
const NomeComponent = Vue.extend({
    data: function() {
        return;
    },
    template: ''
});

// * Registering components
Vue.component('nome-component', NomeComponent);

new Vue({
    el: '#app',
    methods: {
        i18nActivate: function () {
            const elements = document.getElementsByClassName('i18n');

            for (let i = 0; i < elements.length; i++) {
                const element = elements.item(i);
                const i18nDataset = element.dataset.i18n;

                element.innerText = i18n.getMessage(i18nDataset);
            }
        }
    },
    created: function() {
        this.i18nActivate();
    }
});

const configUser = () => {
    // todo: check if no exists password and data
    // * config password here...

    identity.getProfileUserInfo(
        ({ email, id }) => {
            if (email !== "" && id !== "") {
                // * store password and data...
            }
            else {
                // * store only password...
            }
        }
    );
}