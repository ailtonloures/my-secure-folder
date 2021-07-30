'use strict'

const {
    i18n,
    identity,
    tabs,
    storage
} = chrome;

// ? Components
const CardComponent = Vue.extend({
    props: [
        'site',
    ],
    methods: {
        handleDelete: function () {
            console.log("delete")
        },
        goTo: function (url) {
            window.open(url, '_blank');
        }
    },
    template: `
        <div class="card">
            <div class="card-body" @click="goTo(site.url)" v-bind:title="'Navegar para ' + site.url">
                <h5 class="card-title">{{ site.title }}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ site.url }}</h6>
            </div>
            <div class="card-footer text-muted">
                <span>
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
const root = new Vue({
    el: '#root',
    data: {
        // * Password form properties
        passwordVerified: false,
        passwordExists: false,
        passwordMessage: null,
        checkPasswordErrorMessage: null,
        newPasswordErrorMessage: null,
        confirmPasswordErrorMessage: null,
        password: null,
        newPassword: null,
        confirmPassword: null,
        // * User properties
        user: {
            email: null,
            id: null,
            password: null
        },
        // * Other properties
        sites: [
            {
                id: 1,
                title: 'Teste',
                url: 'https://getbootstrap.com/docs/5.0/extend/icons/'
            },
            {
                id: 2,
                title: 'Teste',
                url: 'https://getbootstrap.com/docs/5.0/extend/icons/'
            }
        ]
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
        currentUser: function () {
            identity.getProfileUserInfo(
                ({ email, id }) => {
                    if (email !== "" && id !== "") {
                        root.user.email = email;
                        root.user.id = id;

                        storage.sync.get(id, function (result) {
                            if (result.hasOwnProperty(id)) {
                                root.user.password = result[id];
                                root.passwordExists = true;
                                root.passwordMessage = i18n.getMessage('passwordMessage2');
                            }
                        });
                    }
                }
            );
        },
        addPage: function () {
            tabs.query(
                {
                    active: true,
                    currentWindow: true
                },
                (tabs) => {
                    const {
                        id,
                        favIconUrl,
                        title,
                        url
                    } = tabs[0];
                }
            );
        },
        createPassword: function () {
            const newPassword = this.newPassword;
            const confirmPassword = this.confirmPassword;

            this.newPasswordErrorMessage = null;
            this.confirmPasswordErrorMessage = null;

            if (newPassword === null) {
                this.newPasswordErrorMessage = i18n.getMessage('passwordErrorMessage1');
                return;
            }

            if (confirmPassword === null || confirmPassword !== newPassword) {
                this.confirmPasswordErrorMessage = i18n.getMessage('passwordErrorMessage2');
                return;
            }

            storage.sync.set({
                [this.user.id]: newPassword
            }, () => {
                this.user.password = newPassword;

                this.newPassword = null;
                this.confirmPassword = null;
                this.passwordExists = true;
                this.passwordMessage = i18n.getMessage('passwordMessage1');
            });
        },
        resetPassword: function () {
            storage.sync.remove(this.user.id, () => {
                this.passwordExists = false;
                this.passwordVerified = false;
                this.passwordMessage = i18n.getMessage('passwordMessage3');

                this.user.password = null;
            });
        },
        checkPassword: function () {
            const password = this.password;

            if (password === null) {
                this.checkPasswordErrorMessage = i18n.getMessage('passwordErrorMessage1');
                return;
            }

            if (password !== this.user.password) {
                this.checkPasswordErrorMessage = i18n.getMessage('passwordErrorMessage3');
                return;
            }            

            this.password = null;
            this.passwordMessage = i18n.getMessage('passwordMessage2');
            this.passwordVerified = true;
        },
    },
    computed: {
        now: function () {
            return new Date();
        }
    },
    mounted: function () {
        this.i18nActivate();
    },
    updated: function () {
        this.i18nActivate();
    },
    created: function () {
        this.currentUser();
    }
});