import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';


import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'

const vuetify = createVuetify({
    components: {
        ...components,
        ...labsComponents
    }
});
const app = createApp(App);

app.use(router);
app.use(vuetify);

app.mount('#app');