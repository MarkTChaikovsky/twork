<!-- <template>
  <div class="projects-page-wrapper">
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
        <input v-model="projectTokenInput" type="text" placeholder="Enter project token" />
        <button @click="joinProject">Join</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template> -->

<template>
  <div class="projects-page-wrapper">
    <div class="content">
      <p v-if="user">Logged in as: {{ user.displayName }} ({{ user.email }})</p>
      <v-btn color="primary" @click="logout">Logout</v-btn>
      <v-btn color="success" @click="openProjectModal">Create/Join Project</v-btn>

      <v-container>
        <v-row>
          <!-- Список проектів -->
          <v-col cols="12" md="9">
            <v-row>
              <v-col v-for="project in filteredProjects" :key="project.id" cols="12" lg="12">
                <v-card :class="{ 'archived-card': isArchived(project) }" outlined>
                  <v-card-title>
                    <div class="project-title">
                      {{ project.projectName }}
                      <v-badge v-if="isAdmin(project)" color="blue" content="Admin" class="ml-3"></v-badge>
                    </div>
                  </v-card-title>
                  <v-card-subtitle>
                    Учасники: {{ project.projectMembers?.length || 0 }}
                  </v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="primary" @click="openProject(project.id)" :disabled="isArchived(project)">
                      Відкрити проект
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Бокова панель -->
          <v-col cols="12" md="3">
            <v-card outlined>
              <v-card-title>Фільтри</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-select v-model="sortCriteria" :items="sortOptions" label="Сортувати за" dense outlined></v-select>
                <v-checkbox v-model="showArchived" label="Неактивні/закриті проекти" dense></v-checkbox>
              </v-card-text>
            </v-card>
          </v-col>

        </v-row>

      </v-container>
    </div>

    <!-- Модальні вікна залишаються без змін -->
    <div v-if="showModal" class="modal modal-component-1">
      <div class="modal-content-1">
        <span class="close" @click="closeProjectModal">&times;</span>
        <h2>Choose an option</h2>
        <v-btn color="primary" @click="goToCreateProject">Create Project</v-btn>
        <v-btn color="secondary" @click="openJoinProjectModal">Join Project</v-btn>
      </div>
    </div>

    <div v-if="showJoinModal" class="modal modal-join-project-component">
      <div class="modal-join-project-content">
        <span class="close" @click="closeJoinProjectModal">&times;</span>
        <h2>Join Project</h2>
        <v-text-field v-model="projectTokenInput" label="Enter project token" outlined dense></v-text-field>
        <v-btn color="success" @click="joinProject">Join</v-btn>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  computed,
  onMounted,
  ref,
} from "vue";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  db,
} from "../../firebase/init.js";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  useRouter,
} from "vue-router";
export default {
  setup() {
    const projects = ref([]);
    const archivedProjects = ref([]);
    const user = ref(null);
    const showModal = ref(false);
    const showJoinModal = ref(false);
    const projectTokenInput = ref("");
    const errorMessage = ref("");
    const sortCriteria = ref("");
    const showArchived = ref(false);
    const router = useRouter();

    const sortOptions = [
      { text: "Останній візит", value: "lastVisited" },
      { text: "Кількість учасників", value: "membersCount" },
      { text: "Адмінські проекти", value: "admin" },
    ];

    const openProject = (projectId) => {
      router.push({ name: "projectDetails", params: { id: projectId } });
    };

    const isArchived = (project) =>
      archivedProjects.value.some((archived) => archived.id === project.id);

    const isAdmin = (project) =>
      project.admins && project.admins.includes(user.value.uid);

    const filteredProjects = computed(() => {
      const allProjects = showArchived.value
        ? [...projects.value, ...archivedProjects.value]
        : projects.value;

      switch (sortCriteria.value) {
        case "lastVisited":
          return allProjects.sort((a, b) =>
            a.lastVisited && b.lastVisited
              ? b.lastVisited - a.lastVisited
              : 0
          );
        case "membersCount":
          return allProjects.sort((a, b) =>
            b.projectMembers.length - a.projectMembers.length
          );
        case "admin":
          return allProjects.filter((project) => isAdmin(project));
        default:
          return allProjects;
      }
    });

    const loadProjects = async (projectIds, archiveIds) => {
      try {
        const fetchProjects = async (ids) => {
          const projectPromises = ids.map(async (id) => {
            const projectRef = doc(db, "projects", id);
            const projectDoc = await getDoc(projectRef);
            if (projectDoc.exists()) {
              return { id, ...projectDoc.data() };
            } else {
              console.warn("Project not found:", id);
              return null;
            }
          });
          return (await Promise.all(projectPromises)).filter(
            (project) => project !== null
          );
        };

        projects.value = await fetchProjects(projectIds);
        archivedProjects.value = await fetchProjects(archiveIds);
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    };

    const openProjectModal = () => {
      showModal.value = true;
    };

    const closeProjectModal = () => {
      showModal.value = false;
    };

    const openJoinProjectModal = () => {
      showModal.value = false;
      showJoinModal.value = true;
    };

    const closeJoinProjectModal = () => {
      showJoinModal.value = false;
      projectTokenInput.value = "";
      errorMessage.value = "";
    };

    const auth = getAuth();
    onAuthStateChanged(auth, async (loggedInUser) => {
      if (loggedInUser) {
        user.value = loggedInUser;
        const userRef = doc(db, "users", user.value.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            await loadProjects(
              userData.activeProjects || [],
              userData.archivedProjects || []
            );
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        router.push({ name: "Login" });
      }
    });

    return {
      projects,
      archivedProjects,
      user,
      showModal,
      showJoinModal,
      projectTokenInput,
      errorMessage,
      sortCriteria,
      sortOptions,
      showArchived,
      openProject,
      isArchived,
      isAdmin,
      filteredProjects,
      loadProjects,
      openProjectModal,
      closeProjectModal,
      openJoinProjectModal,
      closeJoinProjectModal,
    };
  },
};
</script>

<style scoped>
.archived-card {
  background-color: #f5f5f5;
  color: #9e9e9e;
}
</style>
