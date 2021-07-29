'use strict'

const { i18n, storage, identity } = chrome;

// ? Components
const CardComponent = Vue.extend({
    props: [
        'site'
    ],
    methods: {
        handleUpdate: function () {
            console.log("update")
        },
        handleDelete: function () {
            console.log("delete")
        }
    },
    template: `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{{ site.title }}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ site.url }}</h6>
            </div>
            <div class="card-footer text-muted">
                <span>
                    <a href="#!" class="i18n card-link link-success" data-i18n="updateButton" @click="handleUpdate">Update</a>
                    <a href="#!" class="i18n card-link link-danger" data-i18n="deleteButton" @click="handleDelete">Remove</a>
                </span>
                <span>2 days ago</span>
            </div>
        </div>
    `
});

// ? Registering components
Vue.component('card-component', CardComponent);
// ? Vue config
Vue.config.devtools = true;
// ? Vue Instance
new Vue({
    el: '#app',
    data: {
        // * Password form properties
        passwordVerified: false,
        passwordErrorMessage: null,
        password: null,
        // * Other properties
        site: {
            title: 'Bootstrap',
            url: 'https://getbootstrap.com/docs/5.0/components/card/'
        }
    },
    methods: {
        i18nActivate: function () {
            const elements = document.getElementsByClassName('i18n');

            for (let i = 0; i < elements.length; i++) {
                const element = elements.item(i);
                const i18nDataset = element.dataset.i18n;

                element.innerHTML = i18n.getMessage(i18nDataset);
            }
        },
        configUser: function () {
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
        },
        checkPassword: function() {
            const password = this.password;

            if (password === null) {
                this.passwordErrorMessage = i18n.getMessage('passwordErrorMessage1');
                return;
            }   
            
            this.passwordVerified = true;
        }
    },
    mounted: function () {
        this.i18nActivate();
    }
});