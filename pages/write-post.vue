<template>

  <div class="px-40 py-20">
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
          :maxlength="descriptionLimit"
          show-word-limit
        ></el-input>
      </el-form-item>

      <el-form-item label="Post Content"></el-form-item>
      <div id="write-post" class="-mt-4">
        <client-only>
          <quill-editor
            ref="editor"
            v-model="content"
          />
        </client-only>
      </div>

      <div class="flex items-center space-x-2">

        <el-button type="primary" @click="submitPost">Submit Post</el-button>
        <div>
          <span v-if="loading" class="el-icon-loading"></span>
          <span v-else class="text-sm" v-html="result"></span>
        </div>

      </div>

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
      descriptionLimit: 300,
      timeout: null,
      checkingSlug: false,
      available: false,
      descriptionText: null,
      loading: false,
      result: '',
      content: '',
    }
  },
  methods: {
    onTitleChange(){
      this.postSlug = kebab(this.postTitle)
      this.checkingSlug = true

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
            this.checkingSlug = false;
          });

        }, 400); // checking delay

      }else {
        this.available = false;
        this.checkingSlug = false;
      }

    },
    resetFields(){
      this.postTitle = ''
      this.descriptionText = ''
      this.$refs.editor.quill.setContents();
    },
    async submitPost(){
      this.loading = true;
      
      const content = this.$refs.editor.quill.getContents();

      if(!this.checkingSlug && this.available && this.descriptionText.length < this.descriptionLimit && this.descriptionText.length > 0 ){

        const postData = {
          uid: this.user.uid,
          title: this.postTitle,
          slug: this.postSlug,
          likeCount: 0,
          createdAt: new Date(Date.now()),
          updatedAt:  new Date(Date.now()),
          description: this.descriptionText,
          content: content.ops
        }
        await this.$store.dispatch('post/addPost', postData);
        this.loading = false;
        this.result = 'Added, redirecting...';
        this.resetFields();
        setTimeout(() => {
          this.$router.push(`/${this.user.username}/${postData.slug}`)
        }, 2000);

      }else {
        this.loading = false;
        this.result = 'Make sure you fill in the fields properly.';
        this.resetFields();
        setTimeout(() => {
          this.result = ''
        }, 2000);
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


<style lang="scss">

#write-post {
  @apply mb-4;
  .ql-editor {
    border: 1px solid #DCDFE6;
    min-height: 400px;
    color: #606266;
    border-radius: 4px;
    line-height: 1.5;
    padding: 5px 15px;
    font-family: 'Quicksand', sans-serif;
  }
  .ql-editor.ql-blank::before {
    font-size: 14px;
    color: #C0C4CC!important;
    font-style: normal!important;
  }
}

</style>