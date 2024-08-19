<template>
    <div class="settings-container">
        <!-- Поля для редагування імені та професії -->
        <div class="input-group">
            <label for="username">Ім'я:</label>
            <input v-model="userName" :disabled="!isEditingName" @keyup.enter="saveName" placeholder="Ім'я"
                id="username">
            <button @click="toggleEditingName">{{ isEditingName ? 'Зберегти' : 'Редагувати' }}</button>
            <span v-if="isEditingName && nameError" class="error">{{ nameError }}</span>
        </div>
        <div class="input-group">
            <label for="profession">Професія:</label>
            <input v-model="userProfession" :disabled="!isEditingProfession" @keyup.enter="saveProfession"
                placeholder="Професія" id="profession">
            <button @click="toggleEditingProfession">{{ isEditingProfession ? 'Зберегти' : 'Редагувати' }}</button>
        </div>
        <div class="input-group">
            <button @click="openPasswordModal">Змінити пароль</button>
        </div>

        <!-- Відображення аватара -->
        <div class="input-group">
            <label>Ваш аватар:</label>
            <img :src="avatarURL" alt="Аватар" class="avatar">
        </div>

        <!-- Поле для завантаження аватара -->
        <div class="input-group">
            <label for="avatar">Завантажити аватар:</label>
            <input type="file" @change="confirmAvatarUpload">
        </div>

        <!-- Список технологій -->
        <div class="input-group">
            <label>Знані технології:</label>
            <div class="tech-column">
                <div v-for="(tech, index) in userTechnologies" :key="index" class="tech-item">
                    <input v-model="tech.name" :disabled="!tech.isEditing" @keyup.enter="saveTechnology(index)">
                    <button @click="toggleEditingTechnology(index)">{{ tech.isEditing ? 'Зберегти' : 'Редагувати'
                        }}</button>
                    <button @click="removeTechnology(index)">Видалити</button>
                </div>
                <div class="add-tech">
                    <input v-model="newTechnology" placeholder="Додати технологію" @keyup.enter="addTechnology">
                    <button @click="addTechnology">Додати</button>
                    <span v-if="techError" class="error">{{ techError }}</span>
                </div>
            </div>
        </div>

        <!-- Модальне вікно для зміни пароля -->
        <div v-if="showPasswordModal" class="modal-overlay">
            <div class="modal-content">
                <h3>Змінити пароль</h3>
                <input v-model="oldPassword" type="password" placeholder="Старий пароль">
                <input v-model="newPassword" type="password" placeholder="Новий пароль">
                <input v-model="confirmPassword" type="password" placeholder="Підтвердіть новий пароль">
                <div v-if="passwordError" class="error">{{ passwordError }}</div>
                <div class="modal-buttons">
                    <button @click="changePassword">Змінити</button>
                    <button @click="closePasswordModal">Скасувати</button>
                </div>
            </div>
        </div>

        <!-- Модальне вікно для підтвердження завантаження аватара -->
        <div v-if="showAvatarModal" class="modal-overlay">
            <div class="modal-content">
                <h3>Підтвердити заміну аватара</h3>
                <p>Ви дійсно хочете замінити поточний аватар? Це дію не можна буде відмінити.</p>
                <div class="modal-buttons">
                    <button @click="confirmAvatarReplace">Так</button>
                    <button @click="cancelAvatarReplace">Скасувати</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db, storage } from '../../firebase/init.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default {
    data() {
        return {
            user: null,
            userName: '',
            userProfession: '',
            userTechnologies: [],
            newTechnology: '',
            isEditingName: false,
            isEditingProfession: false,
            nameError: '',
            techError: '',
            showPasswordModal: false,
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            passwordError: '',
            avatarURL: '',
            avatarFile: null,
            showAvatarModal: false,
            newAvatarFile: null,
        };
    },
    created() {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            this.user = user;
            const userRef = doc(db, 'users', user.uid);
            getDoc(userRef).then((userDoc) => {
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    this.userName = userData.username || '';
                    this.userProfession = userData.profession || '';
                    this.userTechnologies = userData.technologies ? userDoc.data().technologies.map(tech => ({ name: tech, isEditing: false })) : [];
                    this.avatarURL = userData.avatarURL || '';
                }
            });
        } else {
            this.$router.push({ name: 'Login' });
        }
    },
    methods: {
        confirmAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.newAvatarFile = file;
                this.showAvatarModal = true;
            }
        },
        async confirmAvatarReplace() {
            if (this.newAvatarFile) {
                try {
                    // Видалення старого аватара, якщо він не є стандартним
                    if (this.avatarURL && !this.avatarURL.includes('default-avatar.png')) {
                        const oldAvatarRef = ref(storage, this.avatarURL);
                        await deleteObject(oldAvatarRef).catch(error => {
                            if (error.code !== 'storage/object-not-found') {
                                throw error;
                            }
                        });
                    }

                    // Завантаження нового аватара
                    const downloadURL = await this.uploadAvatar(this.newAvatarFile, this.user.uid);
                    const userRef = doc(db, 'users', this.user.uid);
                    await updateDoc(userRef, { avatarURL: downloadURL });
                    this.avatarURL = downloadURL;
                    alert("Аватар успішно завантажено");
                } catch (error) {
                    console.error("Помилка завантаження аватара:", error);
                    alert("Помилка завантаження аватара");
                } finally {
                    this.showAvatarModal = false;
                    this.newAvatarFile = null;
                }
            }
        },
        cancelAvatarReplace() {
            this.showAvatarModal = false;
            this.newAvatarFile = null;
        },
        async uploadAvatar(file, userId) {
            if (!file) {
                throw new Error("Файл не вибрано");
            }

            const storageRef = ref(storage, `user-avatars/${userId}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        },
        toggleEditingName() {
            if (this.isEditingName) {
                this.saveName();
            } else {
                this.isEditingName = true;
            }
        },
        toggleEditingProfession() {
            if (this.isEditingProfession) {
                this.saveProfession();
            } else {
                this.isEditingProfession = true;
            }
        },
        saveName() {
            if (!this.userName.trim()) {
                this.nameError = "Ім'я не може бути пустим";
                return;
            }

            this.nameError = '';
            const userRef = doc(db, 'users', this.user.uid);
            updateDoc(userRef, { username: this.userName }).then(() => {
                updateProfile(this.user, { displayName: this.userName }).then(() => {
                    this.isEditingName = false;
                });
            });
        },
        saveProfession() {
            const userRef = doc(db, 'users', this.user.uid);
            updateDoc(userRef, { profession: this.userProfession });
            this.isEditingProfession = false;
        },
        toggleEditingTechnology(index) {
            if (this.userTechnologies[index].isEditing) {
                this.saveTechnology(index);
            } else {
                this.userTechnologies[index].isEditing = true;
            }
        },
        saveTechnology(index) {
            if (!this.userTechnologies[index].name.trim()) {
                this.techError = 'Поле не може бути пустим';
                return;
            }
            this.userTechnologies[index].isEditing = false;
            this.updateTechnologiesInDb();
        },
        addTechnology() {
            if (!this.newTechnology.trim()) {
                this.techError = 'Поле не може бути пустим';
                return;
            }

            this.techError = '';
            this.userTechnologies.push({ name: this.newTechnology, isEditing: false });
            this.newTechnology = '';
            this.updateTechnologiesInDb();
        },
        removeTechnology(index) {
            this.userTechnologies.splice(index, 1);
            this.updateTechnologiesInDb();
        },
        updateTechnologiesInDb() {
            const userRef = doc(db, 'users', this.user.uid);
            const technologies = this.userTechnologies.map(tech => tech.name);
            updateDoc(userRef, { technologies });
        },
        openPasswordModal() {
            this.showPasswordModal = true;
        },
        closePasswordModal() {
            this.showPasswordModal = false;
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.passwordError = '';
        },
        changePassword() {
            if (this.newPassword !== this.confirmPassword) {
                this.passwordError = 'Новий пароль і підтвердження пароля не співпадають';
                return;
            }
            if (this.oldPassword === this.newPassword) {
                this.passwordError = 'Новий пароль не може бути таким же, як старий';
                return;
            }

            const auth = getAuth();
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, this.oldPassword);

            reauthenticateWithCredential(user, credential).then(() => {
                updatePassword(user, this.newPassword).then(() => {
                    this.closePasswordModal();
                }).catch((error) => {
                    this.passwordError = 'Помилка при зміні пароля: ' + error.message;
                });
            }).catch((error) => {
                this.passwordError = 'Невірний старий пароль: ' + error.message;
            });
        },
    }
};

</script>

<style scoped>
.settings-container {
    padding: 20px;
}

.input-group {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.input-group label {
    width: 150px;
}

input {
    margin-right: 10px;
    padding: 5px;
}

button {
    padding: 5px 10px;
    cursor: pointer;
}

.error {
    color: red;
    font-size: 12px;
    margin-left: 10px;
}

.tech-column {
    display: flex;
    flex-direction: column;
}

.tech-item {
    margin-bottom: 10px;
}

.add-tech {
    margin-top: 10px;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}
</style>
