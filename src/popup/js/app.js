"use strict";

// * Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmVZWF30XDbzbjUclI0fOdvplHodmUYcw",
    authDomain: "my--folder-cc13f.firebaseapp.com",
    projectId: "my--folder-cc13f",
    storageBucket: "my--folder-cc13f.appspot.com",
    messagingSenderId: "982631035022",
    appId: "1:982631035022:web:361b225a825eeab7ef99df",
};
// ? Initialize Firebase
firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const bookmarks = firestore.collection("bookmarks");

const { i18n, identity, tabs, storage } = chrome;

// ? Components
const CardComponent = Vue.extend({
    props: ["bookmark"],
    methods: {
        handleDelete: function (id) {
            bookmarks
                .doc(id)
                .delete()
                .then(() => {
                    document.getElementById(id).remove();
                });
        },
        goTo: function (url) {
            window.open(url, "_blank");
        },
        formatDate: function (createdAt) {
            return dayjs(createdAt).format(i18n.getMessage("dateFormat"));
        },
    },
    template: `
        <div class="card" v-bind:id="bookmark.uid">
            <div class="card-body" @click="goTo(bookmark.url)" v-bind:title="'Navegar para ' + bookmark.url">
                <div class="card-title">     
                    <img v-bind:src="bookmark.favIconUrl" width="18"> 
                    &nbsp;              
                    <span>{{ bookmark.title }}</span>
                </div>
                <h6 class="card-subtitle mb-2 text-muted">{{ bookmark.url }}</h6>
            </div>
            <div class="card-footer text-muted">
                <span>
                    <a href="#!" class="i18n card-link link-danger" data-i18n="deleteButton" @click="handleDelete(bookmark.uid)">Remove</a>
                </span>
                <span>
                    <span class="i18n" data-i18n="dateFormatMessage">Created at: </span>
                    <span>{{ formatDate(bookmark.createdAt) }}</span>
                </span>                
            </div>
        </div>
    `,
});

// ? Registering components
Vue.component("card-component", CardComponent);
// ? Vue config
Vue.config.devtools = true;
// ? Vue Instance
const root = new Vue({
    el: "#root",
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
            password: null,
        },
        // * Other properties
        bookmarks: [],
        bookmarksOnQueue: false,
    },
    methods: {
        i18nActivate: function () {
            const elements = document.getElementsByClassName("i18n");

            for (let i = 0; i < elements.length; i++) {
                const element = elements.item(i);
                const i18nDataset = element.dataset.i18n;

                element.innerHTML = i18n.getMessage(i18nDataset);
            }
        },
        currentUser: function () {
            identity.getProfileUserInfo(({ email, id }) => {
                if (email !== "" && id !== "") {
                    root.user.email = email;
                    root.user.id = id;

                    storage.sync.get(id, function (result) {
                        if (result.hasOwnProperty(id)) {
                            root.user.password = result[id];
                            root.passwordExists = true;
                            root.passwordMessage = i18n.getMessage("passwordMessage2");
                        }
                    });

                    localStorage.setItem("userId", id);
                }
            });
        },
        addBookmark: function () {
            tabs.query(
                {
                    active: true,
                    currentWindow: true,
                },
                (tabs) => {
                    const { id, favIconUrl, title, url } = tabs[0];

                    const date = `${this.now.getFullYear()}-${this.now.getMonth() + 1}-${this.now.getDate()}`;
                    const hour = `${this.now.getHours()}:${this.now.getMinutes()}`;
                    const createdAt = `${date} ${hour}`;

                    if (!this.passwordVerified) {
                        this.bookmarksOnQueue = true;
                        this.checkPasswordErrorMessage = i18n.getMessage("passwordErrorMessage4");

                        return;
                    }

                    bookmarks
                        .add({
                            id,
                            title,
                            favIconUrl,
                            url,
                            createdAt,
                            user: this.user.id,
                        })
                        .then((snapshot) => {
                            this.bookmarks.push({
                                uid: snapshot.id,
                                id,
                                title,
                                favIconUrl,
                                url,
                                createdAt,
                            });
                        });
                }
            );
        },
        getBookmarks: function () {
            const userId = localStorage.getItem("userId");

            bookmarks
                .where("user", "==", userId)
                .get()
                .then((snapshot) => {
                    snapshot.docs.forEach((bookmark) => {
                        const { id, title, favIconUrl, url, createdAt } = bookmark.data();

                        this.bookmarks.push({
                            uid: bookmark.id,
                            id,
                            title,
                            favIconUrl,
                            url,
                            createdAt,
                        });
                    });
                });
        },
        createPassword: function () {
            const newPassword = this.newPassword;
            const confirmPassword = this.confirmPassword;

            this.newPasswordErrorMessage = null;
            this.confirmPasswordErrorMessage = null;

            if (newPassword === null) {
                this.newPasswordErrorMessage = i18n.getMessage("passwordErrorMessage1");
                return;
            }

            if (confirmPassword === null || confirmPassword !== newPassword) {
                this.confirmPasswordErrorMessage = i18n.getMessage("passwordErrorMessage2");
                return;
            }

            storage.sync.set(
                {
                    [this.user.id]: newPassword,
                },
                () => {
                    this.user.password = newPassword;

                    this.newPassword = null;
                    this.confirmPassword = null;
                    this.passwordExists = true;
                    this.passwordMessage = i18n.getMessage("passwordMessage1");
                }
            );
        },
        resetPassword: function () {
            storage.sync.remove(this.user.id, () => {
                this.passwordExists = false;
                this.passwordVerified = false;
                this.passwordMessage = i18n.getMessage("passwordMessage3");

                this.user.password = null;
            });
        },
        checkPassword: function () {
            const password = this.password;

            if (password === null) {
                this.checkPasswordErrorMessage = i18n.getMessage("passwordErrorMessage1");
                return;
            }

            if (password !== this.user.password) {
                this.checkPasswordErrorMessage = i18n.getMessage("passwordErrorMessage3");
                return;
            }

            if (this.bookmarksOnQueue) {
                this.addBookmark();
            }

            this.password = null;
            this.passwordMessage = i18n.getMessage("passwordMessage2");
            this.passwordVerified = true;
        },
    },
    computed: {
        now: function () {
            return new Date();
        },
    },
    created: function () {
        this.currentUser();
    },
    mounted: function () {
        this.i18nActivate();
        this.getBookmarks();
    },
    updated: function () {
        this.i18nActivate();
    },
});
