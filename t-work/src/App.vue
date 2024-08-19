<script >
import { RouterLink, RouterView } from 'vue-router'
import { effect } from 'vue'
import router from './router'

export default {

}
</script>

<template>
  <!-- <div v-if="!isLoggedIn">
    <template v-if="showLogin">
      <login-page />
      <p>No account yet? <a @click="showLogin=false"> Sign up </a></p>
    </template>

    <template v-else>
      <registration-page @loggedIn="sendToMain" />
      <p>Already registered? <a @click="showLogin = true"> Login </a></p>
    </template>


  </div>
     -->

  <div id="app">
    <router-view />
  </div>

</template>

<style scoped>

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}
/* a {
  color: green;
}
a:hover {
  border-color: green;
  border-bottom: 1px;
} */


/* 
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
