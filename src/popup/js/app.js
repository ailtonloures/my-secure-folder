'use strict'

const {
    i18n,
    identity,
    tabs
} = chrome;

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
    el: '#root',
    data: {
        // * Password form properties
        passwordVerified: false,
        passwordErrorMessage: null,
        password: null,
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
                        this.user.email = email;
                        this.user.id = id;
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
        checkPassword: function () {
            const password = this.password;

            if (password === null) {
                this.passwordErrorMessage = i18n.getMessage('passwordErrorMessage1');
                return;
            }

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
    created: function () {
        this.currentUser();
    }
});