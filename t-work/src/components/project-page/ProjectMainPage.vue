<template>
    <div class="project-details-container">
        <h2>{{ project.projectName }}</h2>
        <p>{{ project.projectDesc }}</p>

        <div class="project-members">
            <h3>Учасники проєкту:</h3>
            <ul>
                <li v-for="member in membersList" :key="member.id" class="member-item">
                    <img :src="member.avatarURL" alt="Avatar" class="avatar" />
                    <span>{{ member.username }}</span>
                    <span v-if="member.isAdmin" class="admin-tag">(адмін)</span>
                </li>
            </ul>

            <!-- Кнопка додавання учасника -->
            <button @click="showAddUserModal = true" class="add-user-btn">
                Додати учасника
            </button>
        </div>

        <!-- Модальне вікно -->
        <div v-if="showAddUserModal" class="modal modal-component-2">
            <div class="modal-content-2">
                <h3>Додати нового учасника</h3>
                <input
                    v-model="newUserToken"
                    type="text"
                    placeholder="Введіть токен користувача"
                    class="input-token"
                />
                <div class="modal-buttons">
                    <button @click="addUserToProject" class="add-user-modal-btn">Додати</button>
                    <button @click="showAddUserModal = false" class="close-modal-btn">Закрити</button>
                </div>
                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { doc, getDoc, getDocs, updateDoc, arrayUnion, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase/init.js';

export default {
    data() {
        return {
            project: {},
            membersList: [], // Дані про учасників
            showAddUserModal: false, // Показ модального вікна
            newUserToken: '', // Токен для нового користувача
            errorMessage: '' // Повідомлення про помилку
        };
    },
    async created() {
        const projectId = this.$route.params.id;
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);

        if (projectDoc.exists()) {
            this.project = projectDoc.data();

            // Отримуємо IDs адмінів та учасників
            const adminIds = this.project.projectAdmins || [];
            const memberIds = this.project.projectMembers || [];

            // Завантажуємо дані про всіх користувачів
            const allUserIds = [...new Set([...adminIds, ...memberIds])]; // Уникнення дублювання
            const usersPromises = allUserIds.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    return {
                        id: userId,
                        ...userDoc.data(),
                        isAdmin: adminIds.includes(userId) // Визначаємо, чи користувач є адміном
                    };
                }
                return null;
            });

            // Очікуємо завершення всіх запитів
            this.membersList = (await Promise.all(usersPromises)).filter(Boolean); // Видаляємо null-значення
        } else {
            console.error('Проєкт не знайдено!');
        }
    },
    methods: {
        async addUserToProject() {
            this.errorMessage = ''; // Очищення помилок
            try {
                // Створюємо запит на пошук користувача за токеном
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('token', '==', this.newUserToken));
                const querySnapshot = await getDocs(q);

                // Перевіряємо, чи знайдено користувача
                if (querySnapshot.empty) {
                    throw new Error('Користувача з таким токеном не знайдено.');
                }

                // Отримуємо дані першого (і єдиного) знайденого користувача
                const userDoc = querySnapshot.docs[0];
                const userId = userDoc.id;
                const userData = userDoc.data();

                // Перевіряємо, чи користувач вже є в проєкті
                if (
                    this.project.projectMembers.includes(userId) ||
                    this.project.projectAdmins.includes(userId)
                ) {
                    throw new Error('Користувач вже є учасником цього проєкту.');
                }

                // Додаємо користувача до масиву `projectMembers` в базі даних
                const projectRef = doc(db, 'projects', this.$route.params.id);
                await updateDoc(projectRef, {
                    projectMembers: arrayUnion(userId)
                });

                // Додаємо ID проєкту до `activeProjects` користувача
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    activeProjects: arrayUnion(this.$route.params.id)
                });

                // Оновлюємо локальний стан (список учасників)
                this.membersList.push({
                    id: userId,
                    ...userData,
                    isAdmin: false // Новий користувач не є адміном
                });

                // Закриваємо модальне вікно
                this.showAddUserModal = false;
                this.newUserToken = '';
            } catch (error) {
                this.errorMessage = error.message;
            }
        }
    }
};
</script>

<style scoped>
.project-details-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.project-members {
    margin-top: 20px;
    text-align: center;
}

.member-item {
    display: flex;
    align-items: center;
    margin: 10px 0;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 10px;
}

.admin-tag {
    margin-left: 10px;
    font-style: italic;
    color: #f00;
}

.add-user-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.add-user-btn:hover {
    background-color: #0056b3;
}

/* Модальне вікно */
.modal-component-2 {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.modal-content-2 {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #888;
    text-align: center;
    min-width: 300px;
}

.input-token {
    width: 90%;
    padding: 10px;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.modal-buttons {
    margin-top: 10px;
}

.add-user-modal-btn {
    margin-right: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.add-user-modal-btn:hover {
    background-color: #0056b3;
}

.close-modal-btn {
    padding: 10px 20px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.close-modal-btn:hover {
    background-color: #a71d2a;
}

.error {
    color: red;
    margin-top: 10px;
}
</style>
