<template>
    <div class="project-details-container">
        <h2>{{ project.projectName }}</h2>
        <p>{{ project.projectDesc }}</p>
    </div>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/init.js'

export default {
    data() {
        return {
            project: {}
        }
    },
    async created() {
        const projectId = this.$route.params.id;
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
            this.project = projectDoc.data();
        } else {
            console.error('No such project!');
        }
    }
}
</script>

<style>
.project-details-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}
</style>
