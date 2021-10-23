<template>

    <client-only>
      <el-form label-position="top" class="md:w-10/12 xl:w-2/3 mx-auto xl:px-8">

        <div class="font-semibold relative space-x-20 xl:space-x-0 mb-8">
          <span class="text-4xl absolute top-1/2 xl:-left-4 transform -translate-y-1/2 xl:-translate-x-full p-4 rounded-full isax-edit-2 text-pink-700 bg-pink-50"></span>
          <h1>Write A Post</h1>
        </div>

        <!-- buggy for now -->
        <el-alert
          v-if="mobileWarning"
          style="margin-bottom:16px!important"
          title="It seems you are on mobile"
          type="info"
          description="It is highly recommended you to write your posts on the desktop."
          show-icon>
        </el-alert>
        

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
        <el-form-item label="Define a few tags (max 5)" required>
          <el-input-tag v-model="tags" size="medium" type="info"></el-input-tag>
        </el-form-item>
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
            :http-request="handlePostImageSuccess"
            :before-upload="beforePostImageUpload">
            <div v-if="postImageURL" class="w-full h-80 rounded-lg shadow-lg overflow-hidden">
              <div class="postImageAnimation w-full h-full bg-cover" :style="`background-image: url(${postImageURL})`"></div>
            </div>
            <div v-else class=" post-image-uploader-icon">
              <span class="isax-add"></span>
            </div>
          </el-upload>
          <div v-if="postImageFile" @click="removePostImage" class="text-red-500 space-x-2 cursor-pointer select-none flex items-center w-max">
            <span class="isax-trash text-lg"></span>
            <span>Remove Post Image</span>
          </div>
        </el-form-item>
        <el-form-item label="Post Content" style="margin-bottom: 0!important" required>
        </el-form-item>
        <div id="write-post" class="mb-4">
          <quill-editor
            ref="editor"
            v-model="content"
          />
        </div>
        <el-form-item label="Published" class="flex space-x-2 items-center">
          <el-switch
            v-model="published"
            active-color="#13ce66">
          </el-switch>
        </el-form-item>

        <div class="flex items-center space-x-2">

          <el-button type="primary" @click="submitDialog = true">Submit Post</el-button>
          <Loading v-if="loading" class="text-xl"/>

        </div>

        <el-dialog
          title="Warning"
          :visible.sync="submitDialog"
          :width="submitDialogSize"
          center
          >
          <div style="text-align: center">You will not have a chance to change the post's title or slug.</div>
          <span slot="footer" class="space-y-2 dialog-footer">
            <el-button @click="submitDialog = false">Cancel</el-button>
            <el-button type="primary" style="margin-left:0" @click="submitPost()">I Understand</el-button>
          </span>
        </el-dialog>
      </el-form>

      
    </client-only>

</template>


<script>
import kebab from 'lodash.kebabcase'


export default {
  head(){
    return {
      title: `Write A Post`,
    }
  },
  data() {
    return {
      postTitle: "",
      postSlug: null,
      postTitleLimit: 70,
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
      tags: ["use","comma","between","tags"],
      tagLimit: 5,
      published: true,
      submitDialog: false,
      mobileWarning: false,
      submitDialogSize: "40%"

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
      this.tags = [];
      this.postImageURL = null;
      this.postImageFile = null;
    },
    isContentValid(content){
      
      if(content.ops.length == 1){
        return content.ops[0].insert.replaceAll("\n","").length != 0
      }else {
        return true
      }
    },
    async submitPost(){
      this.submitDialog = false;
      this.loading = true;
      const content = this.$refs.editor.quill.getContents();
      const isContentValid = this.isContentValid(content);

      if(!this.checkingSlug && this.available ){

        if(this.processedTags.length > 0){

          if(this.descriptionText.length <= this.descriptionLimit && this.descriptionText.length > 0){

            if(this.postImageFile){

              if(isContentValid){

                const postData = {
                  uid: this.user.uid,
                  title: this.postTitle,
                  slug: this.postSlug,
                  likes: [],
                  createdAt: Date.now(),
                  updatedAt:  Date.now(),
                  description: this.descriptionText,
                  content: content.ops,
                  published: this.published,
                  tags: this.processedTags,
                  tagSlugs: this.processedTags.map((tag)=>tag.slug), // for query
                }

                await this.$store.dispatch('post/addPost', {postImageFile: this.postImageFile, postData: postData});
                this.resetFields();
                this.$message.success('Post succesfully added, redirecting...');
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
          this.$message.error('Your have to define a few tags.');
        }
      }else {
        this.$message.error('Post title/slug is not valid.');
      }
      this.loading = false;
      
    },
    test(res, file,a){
      console.log(res,file,a)
    },
    handlePostImageSuccess(res) {
      const img = new Image();
      img.src = URL.createObjectURL(res.file);
      const _this = this;
      img.onload = function(){
        if(this.width > 1920 || this.height > 1080){
          _this.$message.error('Post image resolution can not exceed 1920x1080')
        }else {
          _this.postImageURL = this.src
          _this.postImageFile = res.file;
        }
      }
    },
    beforePostImageUpload(file) {
      const isJPG = (file.type === 'image/jpeg') || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('Post image must be JPG or PNG format!');
      }
      else if (!isLt2M) {
        this.$message.error('Post image size can not exceed 2MB!');
      }
      return isJPG && isLt2M;
    },
    removePostImage(){
      this.postImageURL = null;
      this.postImageFile = null;
    },
    
  },
  computed: {
    user(){
      return this.$store.getters['user/getUser'];
    },
    processedTags(){
      const kebabTags = this.tags.map((tag)=>{
        return {slug: kebab(tag), name: tag}
      })
      const filteredTags = kebabTags.reduce((acc, cur)=>{
        if(!acc.some((r) => r.slug == cur.slug)){
          return [...acc, {slug: cur.slug, name: cur.name}]
        }else {
          return acc
        }
      },[])
      return filteredTags
    }
  },
  mounted(){
    this.mobileWarning = window.innerWidth < 640
    this.submitDialogSize = window.innerWidth > 1024 ? "40%" : "80%"
    window.addEventListener('resize', () => {
      this.submitDialogSize = window.innerWidth > 1024 ? "40%" : "80%"
    })
  },
  watch: {
    postTitle(e){
      this.onTitleChange()
    },
    tags(tags){
      if(tags.length > this.tagLimit){
        this.$message.error('You can\'t add more tag.');
        tags.splice(this.tagLimit, 1)
      }
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
    &:hover {
      border-color: #c0c4cc!important;
    }
    &:focus-within {
      border-color: #409eff!important;
    }
  }
  .ql-editor.ql-blank::before {
    font-size: 14px;
    color: #C0C4CC!important;
    font-style: normal!important;
  }
}

</style>