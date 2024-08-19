<template>
    <div class="authentication-wrapper">
        <form @submit.prevent="login">
            <h2>login page</h2>
            <div class="input-container">
                <input type="email" placeholder="Email" required v-model="email" autocomplete="current-email">
                <input type="password" placeholder="Password" required v-model="password"
                    autocomplete="current-password">
            </div>
            <button> Log in </button>
            <br>
            <router-link to="/registration">First time here?</router-link>
        </form>

        
    </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/init'
import router from '../../router/index.js'


export default {
    data() {
        return {
            email: '',
            password: '',
        }
    },
    methods: {
        login() {
            signInWithEmailAndPassword(auth, this.email, this.password)
                .then(() => {
                    router.push({ name: 'main' });
                })
                .catch((error) => {
                    console.log(error.message);
                });
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
        grid-template-columns: 1fr 250px 1fr;
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
        <form @submit.prevent="signIn">
            <h2>Login Page</h2>
            <div class="input-container">
                <input type="email" placeholder="Email" required v-model="email" autocomplete="username">
                <input type="password" placeholder="Password" required v-model="password"
                    autocomplete="current-password">
            </div>
            <button>Sign In</button>
            <br>
            <router-link to="/register">No account yet? Register here</router-link>
        </form>
    </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/init.js'
import router from '../../router/index.js'

export default {
    data() {
        return {
            email: '',
            password: '',
        }
    },
    methods: {
        async signIn() {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;

                if (user.emailVerified) {
                    router.push({ name: 'main' });
                } else {
                    alert('Будь ласка, підтвердіть вашу електронну пошту перед входом.');
                    await auth.signOut();
                }
            } catch (error) {
                console.log(error.message);
                alert('Невірні дані для входу або акаунт не існує.');
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
