<template>

  <div class="p-16 postView flex">
    <div class="w-1/6 relative pr-8">
      <div v-if="ownPost" class="sticky top-32">
        <div v-if="!editMode" class="flex flex-col space-x-0 space-y-2">
          <el-button class="w-full" @click="openEditMode()" type="warning">Enter edit mode</el-button>
          <el-button class="w-full" type="danger" @click="openDeleteModal()">Delete This Post</el-button>
        </div>
        <div v-else class="flex flex-col space-x-0 space-y-2">
          <el-button class="w-full" type="primary" @click="closeEditMode()">Live Preview</el-button>
          <el-button class="w-full" @click="togglePublishedStatus()" type="info" :plain="!publishedP">{{publishedP ? 'Published' : 'Unpublished'}}</el-button>
        </div>
      </div>
    </div>
    <div class="w-2/3 px-8">
      <h1 class="overflow-hidden overflow-ellipsis font-semibold capitalize" style="letter-spacing: -1px;">{{post.title}}</h1>
      <div>
        <div class="text-sm text-gray-600 flex justify-between">
          <div title="Publish date" class="flex items-center"><span class="text-lg isax-calendar-2 mr-1"></span><span>{{getTime(post.createdAt)}}</span></div>
          <div v-if="post.createdAt != post.updatedAt" class="flex items-center" title="Last update date"><span class="text-lg isax-calendar-edit mr-1"></span><span>{{getTime(post.updatedAt)}}</span></div>
        </div>
      </div>
      <p v-if="!editMode" class="my-4 overflow-hidden overflow-ellipsis" style="line-height: 1.5rem; font-size: 16px">{{descriptionInput}}</p>
      <el-input 
        v-else
        class="descriptionInput"
        type="textarea" 
        :autosize="{minRows: 1, maxRows: 6}"
        v-model="descriptionInput"
        :maxlength="descriptionLimit"
        show-word-limit
      ></el-input>
      <div v-if="!editMode" class="w-full h-80 rounded-lg shadow-lg overflow-hidden">
        <div class="postImageAnimation w-full h-full bg-cover" :style="`background-image: url(${newPostImageURL || post.postImageURL})`"></div>
      </div>
      <div v-else class="relative">
        <el-upload
          class="post-image-uploader"
          action=""
          :show-file-list="false"
          :http-request="handlePostImageSuccess"
          :before-upload="beforePostImageUpload">
          <div class="w-full h-80 rounded-lg shadow-lg overflow-hidden">
            <div class="postImageAnimation w-full h-full bg-cover" :style="`background-image: url(${newPostImageURL || post.postImageURL})`"></div>
          </div>
          <div v-if="!newPostImageURL" class=" post-image-uploader-icon">
            <span class="isax-add"></span>
          </div>
        </el-upload>
        <div v-if="newPostImageFile" @click="removePostImage" class="rounded-tr-lg rounded-bl-lg overflow-hidden removeImageBtn absolute py-4 px-8 top-0 right-0 absolute text-white space-x-2 cursor-pointer select-none flex items-center w-max">
          <div class="z-10 relative">
            <span class="isax-trash text-lg"></span>
            <span>Remove Post Image</span>
          </div>
        </div>
      </div>
      <div class="flex justify-between py-3">
        <ul class="flex items-center text-sm pr-8 space-x-2">
          <li v-for="tag in post.tags" :key="tag.slug">
            <NuxtLink :to="'/tag/' + tag.slug" class="tag">{{tag.name}}</NuxtLink>
          </li>
        </ul>
        <div class="flex items-center space-x-4">
          <div :class="{'text-red-700': hasAlreadyLiked}" class="flex items-center space-x-1"><Loading v-if="likeLoading"/><span v-else>{{post.likes.length}}</span><span @click="likePost()" :class="{'bg-red-50': hasAlreadyLiked}" class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-red-50 hover:text-red-700 isax-heart"></span></div>
          <a href="#comments" class="flex items-center space-x-1"><span>{{post.commentCount}}</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-blue-50 hover:text-blue-700 isax-messages-3"></span></a>
          <span @click="addToBookmarks()" :class="{'text-yellow-700 bg-yellow-50': hasAlreadyBookmarked, 'isax-archive-add': !bookmarkLoading}" class="flex items-center justify-center text-2xl p-3 rounded-full cursor-pointer transition duration-300 hover:bg-yellow-50 hover:text-yellow-700"><Loading v-if="bookmarkLoading" /></span>
        </div>
      </div>
      <div class="flex w-max py-3 items-center space-x-2">
        <img :src="user.photoURL || require('assets/images/avatar.png')" class="rounded-full w-14 h-14 shadow-lg"/>
        <div class="flex flex-col">
          <NuxtLink :title="'@'+user.username" class="font-semibold transition duration-300 transform hover:translate-x-1" :to="'/'+ user.username">
           {{user.displayName}}
          </NuxtLink>
          <span class="text-sm">{{user.profession}}</span>
        </div>
      </div>
      <client-only>
        <div class="mt-8" v-loading="editorLoading">
          <quill-editor
            :class="{'contentInput': editMode}"
            contentType="html"
            ref="editor"
            :disabled='!editMode'
          />
        </div>
      </client-only>
      <hr class="my-8">
      <h2 id="comments" class="font-semibold mb-4">Comments</h2>
      <div class="flex-1 space-y-2 mb-4">
        <el-input 
          type="textarea" 
          placeholder="What are your thoughts?."
          v-model="commentContent"
          :autosize="{ minRows: 4}"
          autocomplete="off"
          :maxlength="commentLimit"
          show-word-limit
        ></el-input>
        <div class="flex">
          <span class="flex-1"></span>
          <el-button @click="addComment()" type="primary" >Add Comment</el-button>
        </div>
      </div>
      <Comments :key="forceUpdate" v-if="post.commentCount > 0" :parent="post.slug" :postOwnerId="post.uid" :post="post" />
      <el-empty v-else description="No comment found, be the first!" :image-size="100"></el-empty>
    </div>
    <div class="w-1/6 relative pl-8">
      <div v-if="ownPost && hasPostChanged" class="sticky top-32 space-x-0 space-y-2">
        <el-button class="w-full" type="danger" @click="resetChanges()">Reset Changes</el-button>
        <el-button class="w-full" type="success" @click="saveChanges()">Save Changes</el-button>
      </div>
    </div>
  </div>

</template>

<script>
import { metaData, toCapitalize} from '@/helpers/meta-tags';

export default {
  head(){
    return {
      title: toCapitalize(this.post.title),
      meta: metaData({
        title: toCapitalize(this.post.title),
        description: this.post.description,
        image: this.post.postImageURL,
        imageAlt: toCapitalize(this.post.title),
      })
    }
  },
  data(){
    return {
      timeOptions: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      likeLoading: false,
      bookmarkLoading: false,
      editMode: false,
      saveLoading: false,
      hasPostChanged: false,
      titleLimit: 64,
      descriptionLimit: 300,
      editorLoading: false,
      commentContent: '',
      commentLimit: 300,
      commentLoading: false,
      forceUpdate: 0,
      newPostImageFile: null,
      newPostImageURL: null,
      publishedP: null,
    }
  },
  methods:{
    togglePublishedStatus(){
      this.publishedP = !this.publishedP
    },
    async openDeleteModal(){
      this.$prompt(`Please enter the post slug<br> <b class="block text-red-500 overflow-hidden overflow-ellipsis">${this.post.slug}</b>`, 'Confirm Delete', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        inputValidator: (input) => input == this.post.slug,
        inputErrorMessage: 'Slug is not correct.'
      }).then(async ({ value }) => {

        await this.$store.dispatch('post/deletePost', {ownerId: this.post.uid, slug: this.post.slug})

        this.$message.error('Post deleted successfully!');
        this.$router.push('/'+ this.authUser.username);
        
      }).catch((err) => {
        console.log(err);
        this.$message.info('Deleting post canceled.');       
      });
    },
    async addComment(){
      
      if(this.authUser){
        if(!this.commentLoading){
          this.commentLoading = true;
          if(this.commentContent.length <= this.commentLimit){
            if(this.commentContent.length > 0 ){
              const commentData = {
                uid: this.authUser.uid,
                parentId: this.$route.params.postSlug,
                content: this.commentContent,
                updateHistory: [{editedAt: Date.now(), content: this.commentContent}],
                upVotes: [],
                downVotes: [],
                voteCount: 0,
                replyCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
              
              await this.$store.dispatch('comment/addComment', {postOwnerId: this.user.uid, slug: this.$route.params.postSlug, commentData: commentData})
              
              this.commentContent = '';
              this.forceUpdate += 1;
              this.post.commentCount += 1;

            }else {
              this.$message.error('You should type something.')
            }
          }else {
            this.$message.error('You can\'t break the rules.')
          }
          this.commentLoading = false;
        }else {
          this.$message.warning('Slow Down !!!')
        }
      }else {
        this.$message.warning('You have to login to send a comment.');
      }
    },
    async saveChanges(){
      if(!this.saveLoading){
        this.saveLoading = true

        if(this.descriptionInput.length > 0 && this.descriptionInput.length <= this.descriptionLimit){
          const postData = {
            updatedAt: Date.now(),
            description: this.descriptionInput,
            content: this.$refs.editor.quill.getContents().ops,
            published: this.publishedP
          }
          await this.$store.dispatch('post/updatePost', {postData: postData, uid: this.post.uid, slug: this.post.slug, newPostImageFile: this.newPostImageFile});
          this.hasPostChanged = false;
          this.$message.success('Post Updated Successfully')
          this.$router.go();
        }else {
          this.$message.error('One of the post fields is not valid.')
        }

        this.saveLoading = false;
      }else {
        this.$message.warning('Slow Down !!!')
      }
    },
    resetChanges(){
      this.descriptionInput = this.post.description;
      this.$refs.editor.quill.setContents(this.post.content);
      this.hasPostChanged = false;
      this.newPostImageFile = null;
      this.newPostImageURL = null;
      this.publishedP = this.post.published;
    },
    closeEditMode(){
      this.editMode = false
      const contentInput = JSON.stringify(this.$refs.editor.quill.getContents().ops)
      if(this.descriptionInput != this.post.description || this.originalContent != contentInput || this.newPostImageFile || this.publishedP != this.post.published){
        // There are changes in the post
        this.hasPostChanged = true
      }
    },
    openEditMode(){
      this.hasPostChanged = false;
      this.editMode = true
      this.$message.warning({
        dangerouslyUseHTMLString: true,
        message: `A quick reminder, you can not change the post title or slug! <br> 
                  If you want to change them, delete your post and create another one.`,
      });
    },
    getTime(time){
      return new Date(time).toLocaleDateString('en-US', this.timeOptions)
    },
    async likePost(){
      if(this.authUser){
        if(!this.likeLoading){
          this.likeLoading = true;
          const postData = {ownerId: this.user.uid, slug: this.post.slug, uid: this.authUser.uid}
          
          if(this.hasAlreadyLiked) {
            await this.$store.dispatch('post/dislikePost', postData)
            this.post.likes.splice(this.post.likes.indexOf(this.authUser.uid), 1)
          }else {
            await this.$store.dispatch('post/likePost', postData)
            this.post.likes.push(this.authUser.uid);
          }
          this.likeLoading = false;
        }else {
          this.$message.warning('Slow Down !!!')
        }
      }else {
        this.$message.warning('You have to login to like a post.')
      }
    },
    async addToBookmarks(){
      if(this.authUser){
        if(!this.bookmarkLoading){
          this.bookmarkLoading = true;
          const bookmarkData = { uid: this.post.uid, slug: this.post.slug, createdAt: Date.now() }
          const postData = { bookmarkData: bookmarkData, uid: this.authUser.uid}
          
          if(this.hasAlreadyBookmarked){
            await this.$store.dispatch('post/removeBookmark', {bookmarkData: this.hasAlreadyBookmarked, uid: this.authUser.uid} );
            this.$message.success('Post deleted from your bookmarks.');
          }else {
            await this.$store.dispatch('post/addBookmark', postData);
            this.$message.success('Post successfully added to your bookmarks.');
          }
          this.bookmarkLoading = false;
        }else {
          this.$message.warning('Slow Down !!!')
        }
      }else {
        this.$message.warning('You have to login to bookmark a post.')
      }
    },
    handlePostImageSuccess(res) {
      const img = new Image();
      img.src = URL.createObjectURL(res.file);
      const _this = this;
      img.onload = function(){
        if(this.width > 1920 || this.height > 1080){
          _this.$message.error('Post image resolution can not exceed 1920x1080')
        }else {
          _this.newPostImageURL = this.src
          _this.newPostImageFile = res.file;
        }
      }
    },
    beforePostImageUpload(file) {
      const isJPG = (file.type === 'image/jpeg') || (file.type === 'image/png');
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
      this.newPostImageURL = null;
      this.newPostImageFile = null;
    }
  },
  watch:{
  },
  computed: {
    authUser(){
      return this.$store.getters['user/getUser'];
    },
    hasAlreadyBookmarked(){
      let exists = false;
      if(this.authUser){
        exists = this.authUser.bookmarks.filter(b => (b.uid == this.post.uid && b.slug == this.post.slug))[0]
      }
      return exists;
    },
    hasAlreadyLiked(){
      let exists = false;
      if(this.authUser){
        exists = this.post.likes.includes(this.authUser.uid);
      }
      return exists;
    },
    ownPost(){
      if(this.authUser == null){
        return false
      }else {
        return this.authUser.uid == this.post.uid
      }
    },
  },
  mounted(){
    this.publishedP = this.post.published
    this.editorLoading = true;
    setTimeout(() => {

      this.$refs.editor.quill.setContents(this.post.content)
      this.originalContent = JSON.stringify(this.$refs.editor.quill.getContents().ops)
      this.editorLoading = false;
    }, 1000);
  },
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const fetchUser = await context.store.dispatch('user/fetchUserId', context.route.params.username)
    const authUser = context.store.getters['user/getUser'];

    if(fetchUser.exists){

      const user = (await context.store.dispatch('user/fetchUser', fetchUser.data().uid)).data();
      const post = await context.store.dispatch('post/fetchPost', {uid: user.uid, slug: context.route.params.postSlug});
      
      if(post.exists){

        // If the post is not published, it could only be visited by post owner
        if(post.data().published || (authUser && authUser.uid == post.data().uid)){
          const commentCount = await context.store.dispatch('comment/fetchCommentCount', { postOwnerId: user.uid, slug: post.data().slug })
          return { user, post: {...post.data(), commentCount }, descriptionInput: post.data().description }

        }else {
          context.redirect('/') // or redirect to 404 page
        }

      }else {
        context.redirect('/') // or redirect to 404 page
      }

    }else {
      context.redirect('/') // or redirect to 404 page
    }

    
  }

}

</script>


<style lang="scss">


.ql-editor{
  padding: 0;
  font-size: 16px;
  border-radius: 4px;
}
.el-loading-parent--relative {
  .ql-editor{
    opacity: 0;
  }
}

.postView {
  color: #303133;
}

.contentInput {
  .ql-editor {
    outline: 1px dashed red;
    outline-offset: 12px 
  }
}

.descriptionInput {
  textarea {
    color: #303133;
    background: transparent;
    border: none;
    padding: 0;
    overflow-y: hidden;
    outline: 1px dashed red;
    outline-offset: 10px 
  }
}
.descriptionInput {
  textarea {
    font-size: 16px;
    line-height: 1.5rem; 
    @apply py-4
  }
}

.removeImageBtn:before {
  content: "";
  z-index: 1;
  opacity: .5;
  @apply w-full h-full -ml-8 bg-red-500 absolute;

}
</style>