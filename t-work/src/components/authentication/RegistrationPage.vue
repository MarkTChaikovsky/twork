<template>
    <div class="authentication-wrapper">
        <form @submit.prevent="signUp">
            <h2>registration page</h2>
            <div class="input-container">
                <input type="text" placeholder="Username" required v-model="username">
                <input type="email" placeholder="Email" required v-model="email" autocomplete="new-email">
                <input type="password" placeholder="Password" required v-model="password" autocomplete="new-password">
            </div>
            <button> Sign Up </button>
            <br>
            <router-link to="/login">have account?</router-link>
        </form>
    </div>
</template>
<script>
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/init.js'
import router from '../../router/index.js'
import defaultAvatar from '@/assets/default-avatar.png'

export default {
    data() {
        return {
            username: '',
            email: '',
            password: '',
        }
    },
    methods: {
        generateUserToken() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let token = '#';
            for (let i = 0; i < 5; i++) {
                token += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            token += 'U';
            return token;
        },
        async signUp() {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;
                await updateProfile(user, {
                    displayName: this.username,
                    photoURL: defaultAvatar
                });

                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    email: this.email,
                    username: this.username,
                    profession: '',
                    technologies: '',
                    token: this.generateUserToken(),
                    friends: [],
                    activeProjects: [],
                    archivedProjects: [],
                    avatarURL: defaultAvatar // тут ми встановлюємо стандартний аватар
                });

                router.push({ name: 'main' });
            } catch (error) {
                console.log(error.message);
            }
        }
    }
}
</script>
<style>
.authentication-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

@media (min-width: 1024px) {
    .authentication-wrapper {
        display: grid;
        grid-template-columns: 1fr 250pxpx 1fr;
        grid-template-rows: 1fr;
    }

    form {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        margin: 10px;
    }
}

form {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 250px;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0;
}

button {
    color: white;
    background-color: green;
    border: 0;
    padding: 6px;
    border-radius: 10px;
    width: auto;
}

button:hover {
    background-color: darkgreen;
}
</style>

<!-- <template>
    <div class="authentication-wrapper">
        <form @submit.prevent="signUp">
            <h2>registration page</h2>
            <div class="input-container">
                <input type="text" placeholder="Username" required v-model="username">
                <input type="email" placeholder="Email" required v-model="email" autocomplete="new-email">
                <input type="password" placeholder="Password" required v-model="password" autocomplete="new-password">
            </div>
            <button> Sign Up </button>
            <br>
            <router-link to="/login">have account?</router-link>
        </form>
    </div>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/init.js'
import router from '../../router/index.js'
import defaultAvatar from '@/assets/default-avatar.png'

export default {
    data() {
        return {
            username: '',
            email: '',
            password: '',
        }
    },
    methods: {
        generateUserToken() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let token = '#';
            for (let i = 0; i < 5; i++) {
                token += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            token += 'U';
            return token;
        },
        async signUp() {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;
                await updateProfile(user, {
                    displayName: this.username,
                    photoURL: defaultAvatar
                });

                await sendEmailVerification(user);

                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    email: this.email,
                    username: this.username,
                    profession: '',
                    technologies: '',
                    token: this.generateUserToken(),
                    friends: [],
                    projects: [],
                    archivedProjects: [],
                    avatarURL: defaultAvatar
                });

                alert("Реєстрація успішна! Будь ласка, підтвердіть вашу електронну пошту перед входом.");
                router.push({ name: 'login' });
            } catch (error) {
                console.log(error.message);
            }
        }
    }
}
</script>

<style>
.authentication-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

@media (min-width: 1024px) {
    .authentication-wrapper {
        display: grid;
        grid-template-columns: 1fr 250pxpx 1fr;
        grid-template-rows: 1fr;
    }

    form {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        margin: 10px;
    }
}

form {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 250px;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0;
}

button {
    color: white;
    background-color: green;
    border: 0;
    padding: 6px;
    border-radius: 10px;
    width: auto;
}

button:hover {
    background-color: darkgreen;
}
</style> -->
