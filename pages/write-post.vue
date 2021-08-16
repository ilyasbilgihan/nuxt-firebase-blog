<template>

  <div>
    <h1 class="text-4xl font-semibold mb-4">Write Post</h1>

    <el-form label-position="top" class="my-4">

      <el-form-item label="Post Title">
        <el-input
          type="text"
          placeholder="My awesome post title"
          v-model="postTitle"
          autocomplete="off"
          :maxlength="postTitleLimit"
          show-word-limit
          clearable
        ></el-input>
      </el-form-item>
      <div class="text-sm -mt-2 mb-2">
        <span class="font-semibold">Slug:</span> <span :class="{'text-green-500': available}" class="text-red-500">"{{postSlug}}" is {{available ? 'available.' : 'not available for you. '}} </span>
      </div>

      <el-form-item label="Description Text">
        <el-input 
          type="textarea" 
          placeholder="A short, interesting summary of your post."
          v-model="descriptionText"
          autocomplete="off"
          maxlength="200"
          show-word-limit
        ></el-input>
      </el-form-item>

      <el-form-item label="Post Content">
        <client-only>
          <editor ref="content" height="500px" initialEditType="wysiwyg" :options="editorOptions" />
        </client-only>
      </el-form-item>

      <el-button type="primary" @click="submitPost" >Submit Post</el-button>

    </el-form>

  </div>

</template>


<script>
import kebab from 'lodash.kebabcase'


export default {
  data() {
    return {
      postTitle: null,
      postSlug: null,
      postTitleLimit: 70,
      timeout: null,
      available: false,
      descriptionText: null,
      editorOptions :  {
        language: 'en-US',
        useCommandShortcut: true,
        usageStatistics: true,
        hideModeSwitch: false,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          ['scrollSync'],
        ]
      },
    }
  },
  methods: {
    onTitleChange(){
      this.postSlug = kebab(this.postTitle)

      if (this.timeout){
        clearTimeout(this.timeout); 
      }

      if(this.postTitle.length <= this.postTitleLimit && this.postSlug.length > 0){

        this.timeout = setTimeout(() => {

          this.$store.dispatch('post/fetchPost',{uid: this.user.uid, slug: this.postSlug}).then(res => {
            if(!res.exists){
              this.available = true
            }else {
              this.available = false
            }
          });

        }, 400); // checking delay

      }else {
        this.available = false;
      }

    },
    submitPost(){
      const content = this.$refs.content.invoke('getMarkdown');

      if(this.available && this.descriptionText.length < 200 && this.descriptionText.length > 0 && content.length){

        const postData = {
          uid: this.user.uid,
          title: this.postTitle,
          slug: this.postSlug,
          likeCount: 0,
          createdAt: new Date(Date.now()),
          updatedAt:  new Date(Date.now()),
          description: this.descriptionText,
          content: content
        }
        this.$store.dispatch('post/addPost', postData);

      }

    }
    
  },
  computed: {
    user(){
      return this.$store.getters['user/getUser'];
    }
  },
  watch: {
    postTitle(e){
      this.onTitleChange()
    }
  },

}
</script>