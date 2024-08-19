<template>
    <div class="create-project-container">
        <h2>Create Project</h2>
        <form @submit.prevent="createProject">
            <div class="input-container">
                <input type="text" placeholder="Project Name" v-model="projectName" required>
                <textarea placeholder="Project Description" v-model="projectDesc" required></textarea>
                <label>
                    <input type="checkbox" v-model="isPasswordProtected"> Enable Password
                </label>
                <input type="password" placeholder="Project Password" v-model="projectPassword"
                    :disabled="!isPasswordProtected">
            </div>
            <button type="submit">Create Project</button>
        </form>
    </div>
</template>

<script>
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../firebase/init.js'
import { getAuth } from 'firebase/auth'
import router from '../../router/index.js'
import CryptoJS from 'crypto-js'

export default {
    data() {
        return {
            projectName: '',
            projectDesc: '',
            projectPassword: '',
            isPasswordProtected: false,
        }
    },
    methods: {
        generateProjectId() {
            return `project-${Math.random().toString(36).substr(2, 9)}`;
        },
        async createProject() {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const projectId = this.generateProjectId();
                const hashedPassword = this.isPasswordProtected
                    ? CryptoJS.SHA256(this.projectPassword).toString()
                    : '';

                const projectData = {
                    projectAdmins: [user.uid],
                    projectDesc: this.projectDesc,
                    projectMembers: [user.uid],
                    projectName: this.projectName,
                    projectPassword: hashedPassword,
                    projectToken: this.generateProjectToken(),
                };

                try {
                    const projectRef = doc(db, 'projects', projectId);
                    await setDoc(projectRef, projectData);

                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        let updatedActiveProjects = userDoc.data().activeProjects || [];
                        updatedActiveProjects.push(projectId);

                        // Оновлюємо об'єкт користувача з новим масивом activeProjects
                        await updateDoc(userRef, {
                            activeProjects: updatedActiveProjects
                        });
                    } else {
                        // Якщо об'єкт користувача ще не існує, створюємо його з новим масивом activeProjects
                        await setDoc(userRef, {
                            activeProjects: [projectId],
                        });
                    }

                    alert('Проект створено успішно!');
                    router.push({ name: 'main' });
                } catch (error) {
                    console.error('Помилка при створенні проекту:', error);
                }
            } else {
                alert('Користувач не увійшов у систему!');
            }
        },
        generateProjectToken() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let token = '#';
            for (let i = 0; i < 5; i++) {
                token += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            token += 'P';
            return token;
        },
    }
}
</script>

<style>
.create-project-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

form {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
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
