<template>
  <div class="main-container">
    <div class="container-header">
      <div class="menu-header">
        <button> <img alt="Menu Icon"> </button>
      </div>
      <div class="user-info" v-if="user">
        <div class="user-details">
          <p id="user-name">{{ user.displayName }}</p>
          <p id="user-token">{{ userToken }}</p>
        </div>
        <img id="avatar-photo" :src="userPhotoURL" alt="User Photo" class="avatar">
      </div>
      <div class="settings-header">
        <img class="settings-button" :src="settingsIcon" alt="Settings Icon" @click="goToSettings">
      </div>
    </div>
    <div class="content">
      <p v-if="user">Logged in as: {{ user.displayName }} ({{ user.email }})</p>
      <button @click="logout">Logout</button>
      <button @click="openProjectModal">Create/Join Project</button>

      <div v-if="projects.length">
        <h3>Your Projects</h3>
        <ul>
          <li v-for="project in projects" :key="project.id">
            {{ project.projectName }}
            <button @click="openProject(project.id)">Open Project</button>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeProjectModal">&times;</span>
        <h2>Choose an option</h2>
        <button @click="goToCreateProject">Create Project</button>
        <button>Join Project (not implemented)</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/init.js'
import defaultAvatar from '@/assets/default-avatar.png'
import settingsIcon from '@/assets/settings-icon.png'

export default {
  data() {
    return {
      user: null,
      userToken: '',
      userPhotoURL: defaultAvatar,
      settingsIcon: settingsIcon,
      projects: [],
      showModal: false,
    }
  },
  created() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        const userRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.userToken = userData.token;
            this.userPhotoURL = userData.avatarURL ? userData.avatarURL : defaultAvatar;
            if (userData.activeProjects) {
              await this.loadProjects(userData.activeProjects);
            }
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.log('Error getting document:', error);
        }
      } else {
        this.$router.push({ name: 'Login' });
      }
    });
  },
  methods: {
    async loadProjects(projectIds) {
      const projectPromises = projectIds.map(async (projectId) => {
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          return { id: projectId, ...projectDoc.data() };
        }
        return null;
      });
      this.projects = (await Promise.all(projectPromises)).filter(project => project !== null);
    },
    goToSettings() {
      this.$router.push({ name: 'settings' });
    },
    logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.$router.push({ name: 'Login' });
      }).catch((error) => {
        console.log(error.message);
      });
    },
    openProject(projectId) {
      this.$router.push({ name: 'projectDetails', params: { id: projectId } });
    },
    openProjectModal() {
      this.showModal = true;
    },
    closeProjectModal() {
      this.showModal = false;
    },
    goToCreateProject() {
      this.showModal = false;
      this.$router.push({ name: 'createProject' });
    }
  }
}
</script>

<style>
/* ваші стилі тут */
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

.avatar img {
  border-radius: 50%;
  width: 50px;
  height: 50px;
}

.user-info div p {
  margin: 0;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* відображення проектів */
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
  width: auto;
}

button:hover {
  background-color: darkgreen;
}

.modal {
  display: block;
  /* Показуємо модальне вікно (після зміни стану) */
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
