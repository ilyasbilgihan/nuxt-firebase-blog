import Vue from 'vue'

import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Editor, Viewer } from '@toast-ui/vue-editor'

Vue.component('editor', Editor)
Vue.component('viewer', Viewer)