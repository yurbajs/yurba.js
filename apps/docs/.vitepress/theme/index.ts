import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import SidebarSelect from './components/SidebarSelect.vue';
import './custom.css';

export default {
    extends: DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'sidebar-nav-before': () => h(SidebarSelect)
        });
    }
};