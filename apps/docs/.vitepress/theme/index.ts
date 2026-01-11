import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import SidebarSelect from './components/SidebarSelect.vue';
import TypePreview from './components/TypePreview.vue';
import './custom.css';

export default {
    extends: DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'sidebar-nav-before': () => h(SidebarSelect),
            'layout-bottom': () => h(TypePreview)
        });
    }
};