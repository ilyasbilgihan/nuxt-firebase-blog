<template>

  <div class="px-16 py-16">

    <el-form label-position="top" class="w-2/3 px-8 mx-auto my-4">

      <h1 class="font-semibold mb-4">Write Post</h1>

      <el-form-item label="Post Title" required>
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
      <el-form-item label="Description Text" required>
        <el-input 
          type="textarea" 
          placeholder="A short, interesting summary of your post."
          v-model="descriptionText"
          :autosize="{ minRows: 6}"
          autocomplete="off"
          :maxlength="descriptionLimit"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="Post Image" required>
        <el-upload
          class="post-image-uploader"
          action=""
          :show-file-list="false"
          :on-success="handlePostImageSuccess"
          :before-upload="beforePostImageUpload">
          <div v-if="postImageURL" class="w-full h-80 rounded-lg shadow-lg overflow-hidden">
            <div class="postImageAnimation w-full h-full bg-cover" :style="`background-image: url(${postImageURL})`"></div>
          </div>
          <div v-else class=" post-image-uploader-icon">
            <span class="el-icon-plus"></span>
          </div>
        </el-upload>
        <div v-if="postImageFile" @click="removePostImage" class="text-red-500 space-x-2 cursor-pointer select-none flex items-center w-max">
          <span class="el-icon-delete text-lg"></span>
          <span>Remove Post Image</span>
        </div>
      </el-form-item>
      <el-form-item label="Post Content" style="margin-bottom: 0!important" required>
      </el-form-item>
      <div id="write-post" class="mb-4">
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
      postTitle: "",
      postSlug: null,
      postTitleLimit: 64,
      descriptionLimit: 300,
      timeout: null,
      checkingSlug: false,
      available: false,
      descriptionText: "",
      loading: false,
      content: '',
      commentCount: 0,
      postImageURL: null,
      postImageFile: null,
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
    isContentValid(content){
      
      if(content.ops.length == 1){
        return content.ops[0].insert.replaceAll("\n","").length != 0
      }else {
        return true
      }
    },
    async submitPost(){
      
      if(!this.loading){
        this.loading = true;
        const content = this.$refs.editor.quill.getContents();
        const isContentValid = this.isContentValid(content);

        if(!this.checkingSlug && this.available ){

          if(this.descriptionText.length <= this.descriptionLimit && this.descriptionText.length > 0){

            if(this.postImageFile){

              if(isContentValid){
                const postData = {
                  uid: this.user.uid,
                  title: this.postTitle,
                  slug: this.postSlug,
                  likes: [],
                  createdAt: new Date(Date.now()),
                  updatedAt:  new Date(Date.now()),
                  description: this.descriptionText,
                  content: content.ops,
                  commentCount: 0,
                }
                await this.$store.dispatch('post/addPost', {postImageFile: this.postImageFile, postData: postData});
                this.$message.success('Post succesfully added, redirecting...');
                this.resetFields();
                setTimeout(() => {
                  this.$router.push(`/${this.user.username}/${postData.slug}`)
                }, 2000);

              }else {
                this.$message.error('Post content is not valid.');
              }
            }else {
              this.$message.error('You have to select a post image.');
            }
          }else {
            this.$message.error('Description text is not valid.');
          }
        }else {
          this.$message.error('Post title/slug is not valid.');
        }

        this.loading = false;

      }else {
        this.$message.warning('Slow Down !!!');
      }

    },
    handlePostImageSuccess(res, file) {
      const img = new Image();
      img.src = URL.createObjectURL(file.raw);
      const _this = this;
      img.onload = function(){
        if(this.width > 1920 && this.height > 1080){
          _this.$message.error('Post image resolution can not exceed 1920x1080')
        }else {
          _this.postImageURL = this.src
          _this.postImageFile = file.raw;
        }
      }
    },
    beforePostImageUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('Post image must be JPG format!');
      }
      else if (!isLt2M) {
        this.$message.error('Post image size can not exceed 2MB!');
      }
      return isJPG && isLt2M;
    },
    removePostImage(){
      this.postImageURL = null;
      this.postImageFile = null;
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
  .ql-editor {
    border: 1px solid #DCDFE6;
    min-height: 400px;
    border-radius: 4px;
    padding: 5px 15px;
    font-size: 16px;
  }
  .ql-editor.ql-blank::before {
    font-size: 14px;
    color: #C0C4CC!important;
    font-style: normal!important;
  }
}

</style>