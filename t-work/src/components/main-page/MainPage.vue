<template>
  <v-app id="inspire">
    <v-system-bar>
      <v-spacer></v-spacer>

      <v-icon>mdi-square</v-icon>

      <v-icon>mdi-circle</v-icon>

      <v-icon>mdi-triangle</v-icon>
    </v-system-bar>

    <v-app-bar>
      <section>

        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

        <v-btn icon class="ml-auto" color="gray" @click="toggleNotificationDot">
          <v-badge v-if="showNotificationDot" color="red" dot overlap>
            <v-icon>mdi-bell</v-icon>
          </v-badge>
          <v-icon v-else>mdi-bell</v-icon>
        </v-btn>

      </section>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-container class="account-info" fluid>
        <v-row align="center">
          <v-col cols="3">
            <v-avatar size="40">
              <img :src="userPhotoURL" alt="User Avatar">
            </v-avatar>
          </v-col>
          <v-col>
            <div class="user-details">
              <strong>{{ user?.displayName || 'Guest' }}</strong>
              <p class="user-token">{{ userToken || 'No token available' }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Інший контент меню -->
      <v-divider></v-divider>

      <v-list dense>
        <v-list-item @click="goToProjects">
          <v-list-item style="display: flex; align-items: center;">
            <v-icon class="mr-3">mdi-folder</v-icon>
            <span>Проекти</span>
          </v-list-item>
        </v-list-item>

        <v-list-item @click="goToFriends">
          <v-list-item style="display: flex; align-items: center;">
            <v-icon class="mr-3">mdi-account-multiple</v-icon>
            <span>Друзі</span>
          </v-list-item>
        </v-list-item>

        <v-list-item @click="goToSettings">
          <v-list-item style="display: flex; align-items: center;">
            <v-icon class="mr-3">mdi-cog</v-icon>
            <span>Налаштування</span>
          </v-list-item>
        </v-list-item>
      </v-list>

    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-2">
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "@/firebase/init";
import { doc, getDoc } from "firebase/firestore";
import defaultAvatar from "@/assets/default-avatar.png";
import ProjectsPage from './ProjectsPage.vue';

export default {
  components: { ProjectsPage },
  setup() {
    const drawer = ref(false);
    const showNotificationDot = ref(false);
    const user = ref(null);
    const userToken = ref("");
    const userPhotoURL = ref(defaultAvatar);

    const router = useRouter();

    const auth = getAuth();

    const toggleDrawer = () => {
      drawer.value = !drawer.value;
    };

    const toggleNotificationDot = () => {
      showNotificationDot.value = !showNotificationDot.value;
    };

    const goToProjects = () => {
      router.push({ name: "projects" });
    };

    const goToFriends = () => {
      console.warn("Друзі ще не реалізовані.");
    };

    const goToSettings = () => {
      router.push({ name: "settings" });
    };


    onMounted(() => {
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          user.value = currentUser;
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userToken.value = userData.token || "No token found";
            userPhotoURL.value = userData.avatarURL || defaultAvatar;
          }
        } else {
          router.push({ name: "Login" });
        }
      });
    });

    return {
      drawer,
      showNotificationDot,
      user,
      userToken,
      userPhotoURL,
      toggleDrawer,
      toggleNotificationDot,
      goToProjects,
      goToFriends,
      goToSettings,
    };
  },
};
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-details {
  text-align: right;
}

#user-name {
  font-weight: bolder;
  color: darkgreen;
}

#user-token {
  font-weight: normal;
  font-size: 80%;
  color: gray;
}

#avatar-photo {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  margin-left: 10px;
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
}

.menu-header,
.settings-header {
  flex: 1;
  height: 43px;
}

.user-info {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: end;
  padding: 0 20px;
  height: 43px;
}

.settings-button {
  cursor: pointer;
  height: 40px;
  width: 40px;
  margin-left: 10px;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

button {
  color: white;
  background-color: green;
  border: 0;
  padding: 6px;
  border-radius: 10px;
}

button:hover {
  background-color: darkgreen;
}

.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content-1,
.modal-join-project-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.close {
  cursor: pointer;
  font-size: 24px;
  float: right;
  color: #aaa;
}

.close:hover {
  color: #000;
}


/* дизайн вютіфая */

.account-info {
  padding: 10px 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-token {
  font-size: 0.8rem;
  /* Зменшений шрифт */
  color: grey;
  /* Сірий колір */
  margin: 0;
  /* Прибрати відступи */
}

.list-title {
  margin-left: 16px;
  /* Відступ між текстом і іконкою */
}
</style>
