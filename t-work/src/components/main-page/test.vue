Канва <!-- <template>
  <div class="main-container">
    <div class="container-header">
      <div class="menu-header">
        <button><img alt="Menu Icon"></button>
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

    <div v-if="showModal" class="modal modal-component-1">
      <div class="modal-content-1">
        <span class="close" @click="closeProjectModal">&times;</span>
        <h2>Choose an option</h2>
        <button @click="goToCreateProject">Create Project</button>
        <button @click="openJoinProjectModal">Join Project</button>
      </div>
    </div>

    <div v-if="showJoinModal" class="modal modal-join-project-component">
      <div class="modal-join-project-content">
        <span class="close" @click="closeJoinProjectModal">&times;</span>
        <h2>Join Project</h2>
        <input
          v-model="projectTokenInput"
          type="text"
          placeholder="Enter project token"
        />
        <button @click="joinProject">Join</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
    <section>
      <v-select :items="['Apple', 'Banana', 'Pears']">
        
      </v-select>
    </section>
  </div>
</template> -->


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

      <v-btn
        icon
        class="ml-auto"
        color="gray"
        @click="toggleNotificationDot"
      >
        <v-badge
          v-if="showNotificationDot"
          color="red"
          dot
          overlap
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell</v-icon>
      </v-btn>
        
      </section>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      temporary
    >
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
      <v-list-item-content style="display: flex; align-items: center;">
        <v-icon class="mr-3">mdi-folder</v-icon>
        <span>Проекти</span>
      </v-list-item-content>
    </v-list-item>

    <v-list-item @click="goToFriends">
      <v-list-item-content style="display: flex; align-items: center;">
        <v-icon class="mr-3">mdi-account-multiple</v-icon>
        <span>Друзі</span>
      </v-list-item-content>
    </v-list-item>

    <v-list-item @click="goToSettings">
      <v-list-item-content style="display: flex; align-items: center;">
        <v-icon class="mr-3">mdi-cog</v-icon>
        <span>Налаштування</span>
      </v-list-item-content>
    </v-list-item>
  </v-list>

    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-2">
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

    <div v-if="showModal" class="modal modal-component-1">
      <div class="modal-content-1">
        <span class="close" @click="closeProjectModal">&times;</span>
        <h2>Choose an option</h2>
        <button @click="goToCreateProject">Create Project</button>
        <button @click="openJoinProjectModal">Join Project</button>
      </div>
    </div>

    <div v-if="showJoinModal" class="modal modal-join-project-component">
      <div class="modal-join-project-content">
        <span class="close" @click="closeJoinProjectModal">&times;</span>
        <h2>Join Project</h2>
        <input
          v-model="projectTokenInput"
          type="text"
          placeholder="Enter project token"
        />
        <button @click="joinProject">Join</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
    </v-main>
  </v-app>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, updateDoc, doc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/init.js";
import defaultAvatar from "@/assets/default-avatar.png";
import settingsIcon from "@/assets/settings-icon.png";

export default {
  data() {
    return {
      user: null,
      userToken: "",
      userPhotoURL: defaultAvatar,
      settingsIcon: settingsIcon,
      projects: [],
      showModal: false,
      showJoinModal: false,
      projectTokenInput: "",
      errorMessage: "",
      drawer: null,
      showNotificationDot: false,
    };
  },
  created() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        const userRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.userToken = userData.token || "No token found";
            this.userPhotoURL = userData.avatarURL || defaultAvatar;
            if (userData.activeProjects && userData.activeProjects.length) {
              await this.loadProjects(userData.activeProjects);
            }
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.log("Error getting document:", error);
        }
      } else {
        this.$router.push({ name: "Login" });
      }
    });
  },
  methods: {
    async loadProjects(projectIds) {
      try {
        const projectPromises = projectIds.map(async (projectId) => {
          const projectRef = doc(db, "projects", projectId);
          const projectDoc = await getDoc(projectRef);
          if (projectDoc.exists()) {
            return { id: projectId, ...projectDoc.data() };
          } else {
            console.warn("Project not found: ${projectId}");
            return null;
          }
        });
        this.projects = (await Promise.all(projectPromises)).filter(
          (project) => project !== null
        );
        console.log("Loaded Projects:", this.projects);
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    },
    goToSettings() {
      this.$router.push({ name: "settings" });
    },
    logout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          this.$router.push({ name: "Login" });
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
    openProject(projectId) {
      this.$router.push({ name: "projectDetails", params: { id: projectId } });
    },
    openProjectModal() {
      this.showModal = true;
    },
    closeProjectModal() {
      this.showModal = false;
    },
    openJoinProjectModal() {
      this.showModal = false;
      this.showJoinModal = true;
    },
    closeJoinProjectModal() {
      this.showJoinModal = false;
      this.projectTokenInput = "";
      this.errorMessage = "";
    },
    async joinProject() {
      if (!this.projectTokenInput) {
        this.errorMessage = "Please enter a project token.";
        return;
      }
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("projectToken", "==", this.projectTokenInput)
        );
        const querySnapshot = await getDocs(projectsQuery);
        if (querySnapshot.empty) {
          this.errorMessage = "Project not found.";
          return;
        }
        const projectDoc = querySnapshot.docs[0];
        const projectData = projectDoc.data();
        if (!projectData.projectMembers.includes(this.user.uid)) {
          await updateDoc(projectDoc.ref, {
            projectMembers: arrayUnion(this.user.uid),
          });
          const userRef = doc(db, "users", this.user.uid);
          await updateDoc(userRef, {
            activeProjects: arrayUnion(projectDoc.id),
          });
          this.projects.push({
            id: projectDoc.id,
            ...projectData,
          });
          this.closeJoinProjectModal();
        } else {
          this.errorMessage = "You are already a member of this project.";
        }
      } catch (error) {
        console.error("Error joining project:", error);
        this.errorMessage = "An error occurred. Please try again.";
      }
    },
    toggleNotificationDot() {
      this.showNotificationDot = !this.showNotificationDot;
    },
  },
};
</script>

<style>
html, body {
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
.menu-header, .settings-header {
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
.modal-content-1, .modal-join-project-content {
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
  font-size: 0.8rem; /* Зменшений шрифт */
  color: grey; /* Сірий колір */
  margin: 0; /* Прибрати відступи */
}

.list-title {
  margin-left: 16px; /* Відступ між текстом і іконкою */
}
</style>
