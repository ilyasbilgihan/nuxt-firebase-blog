import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'

import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/atom-one-dark.css'

import 'quill/dist/quill.bubble.css' // for bubble theme
import 'quill/dist/quill.core.css' // import styles

Vue.use(VueQuillEditor, {
  // Some Quill options...
  theme: 'bubble',
  placeholder: 'Select your text and see the magic',
  modules: {
    syntax: { highlight: text => hljs.highlightAuto(text).value },
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      [{ 'align': '' },{ 'align': 'center' },{ 'align': 'right' },{ 'align': 'justify' }],
      ['blockquote', 'code-block'],
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    
    
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      ['link', 'image', 'video', 'code-block'],
      ['clean']                                         // remove formatting button
    ]
  }
})