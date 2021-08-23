<template>

  <div class="p-16 postView flex">
    <div class="w-1/6 relative pr-8">
      <div v-if="ownPost" class="sticky top-32">
        <el-button v-if="!editMode" class="w-full" @click="openEditMode()" type="warning">Enter edit mode</el-button>
        <el-button v-else class="w-full" type="primary" @click="closeEditMode()">Live Preview</el-button>
      </div>
    </div>
    <div class="w-2/3 px-8">
      <h1 v-if="!editMode" class="overflow-hidden overflow-ellipsis font-semibold capitalize" style="letter-spacing: -1px;">{{titleInput}}</h1>
      <el-input
        v-else
        class="titleInput"
        type="textarea"
        :autosize="{minRows: 1, maxRows: 3}"
        v-model="titleInput"
        :maxlength="titleLimit"
        show-word-limit
      ></el-input>
      <div>
        <div class="text-sm text-gray-600 flex justify-between">
          <div title="Publish date"><span class="el-icon-time mr-1"></span>{{getTime(post.createdAt)}}</div>
          <div v-if="post.createdAt.seconds != post.updatedAt.seconds" title="Last update date"><span class="el-icon-refresh-left mr-1"></span>{{getTime(post.updatedAt)}}</div>
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
      <div class="w-full h-80 rounded-lg shadow-lg overflow-hidden">
        <div class="postImageAnimation w-full h-full bg-cover" style="background-image: url(https://www.incimages.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg)"></div>
      </div>
      <div class="flex justify-between py-3">
        <ul class="flex items-center text-sm pr-8 space-x-2">
          <li class="tag">tags</li>
          <li class="tag">are</li>
          <li class="tag">not</li>
          <li class="tag">ready</li>
          <li class="tag">yet</li>
        </ul>
        <div class="flex items-center space-x-4">
          <div :class="{'text-red-700': hasAlreadyLiked}" class="flex items-center space-x-1"><span v-html="likeLoading ? loadingElement : post.likes.length"></span><span @click="likePost()" :class="{'bg-red-50': hasAlreadyLiked}" class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-red-50 hover:text-red-700 el-icon-star-off"></span></div>
          <a href="#comments" class="flex items-center space-x-1"><span>{{post.commentCount}}</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-blue-50 hover:text-blue-700 el-icon-chat-line-square"></span></a>
          <span @click="addToBookmarks()" :class="{'text-yellow-700 bg-yellow-50': hasAlreadyBookmarked, 'el-icon-collection-tag': !bookmarkLoading}" class="flex items-center justify-center text-2xl p-3 rounded-full cursor-pointer transition duration-300 hover:bg-yellow-50 hover:text-yellow-700"><span :class="{'el-icon-loading': bookmarkLoading, }"></span></span>
        </div>
      </div>
      <div class="flex w-max py-3 items-center space-x-2">
        <img :src="user.photoURL || require('@/assets/images/avatar.png')" class="rounded-full w-14 h-14 shadow-lg"/>
        <div class="flex flex-col">
          <NuxtLink :title="'@'+user.username" class="font-semibold transition duration-300 transform hover:translate-x-1" :to="'/'+ user.username">
           {{user.displayName}}
          </NuxtLink>
          <span class="text-sm">{{user.profession}}</span>
        </div>
      </div>
      <div class="mt-8" v-loading="editorLoading">
        <client-only>
          <quill-editor
            :class="{'contentInput': editMode}"
            contentType="html"
            ref="editor"
            :disabled='!editMode'
          />
        </client-only>
      </div>
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
        <el-button class="w-full" type="success" @click="savePost()">Save Changes</el-button>
      </div>
    </div>
  </div>

</template>

<script>

export default {
  head(){

  },
  data(){
    return {
      timeOptions: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      loadingElement: '<span class="el-icon-loading"></span>',
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
    }
  },
  methods:{
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
                updateHistory: [{editedAt: new Date(Date.now()), content: this.commentContent}],
                upVotes: [],
                downVotes: [],
                voteCount: 0,
                replyCount: 0,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
              }
              
              await this.$store.dispatch('post/addComment', {postOwnerId: this.user.uid, slug: this.$route.params.postSlug, commentData: commentData})
              
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
        this.$message.error('You have to login to send a comment.');
      }
    },
    async savePost(){
      if(!this.saveLoading){
        this.saveLoading = true

        if(this.titleInput.length > 0 && this.titleInput.length <= this.titleLimit && this.descriptionInput.length > 0 && this.descriptionInput.length <= this.descriptionLimit){
          const postData = {
            title: this.titleInput,
            updatedAt: new Date(Date.now()),
            description: this.descriptionInput,
            content: this.$refs.editor.quill.getContents().ops
          }
          await this.$store.dispatch('post/updatePost', {postData: postData, uid: this.post.uid, slug: this.post.slug});
          this.hasPostChanged = false;
          this.$message.success('Post Updated Successfully')
          this.$router.go();
        }else {
          this.saveLoading = false;
          this.$message.error('One of the post fields is not valid.')
        }
      }else {
        this.$message.warning('Slow Down !!!')
      }
    },
    resetChanges(){
      this.titleInput = this.post.title;
      this.descriptionInput = this.post.description;
      this.$refs.editor.quill.setContents(this.post.content);
      this.hasPostChanged = false;
    },
    closeEditMode(){
      this.editMode = false
      const contentInput = JSON.stringify(this.$refs.editor.quill.getContents().ops)
      if(this.descriptionInput != this.post.description || this.titleInput != this.post.title || this.originalContent != contentInput){
        // There are changes in the post
        this.hasPostChanged = true
      }
    },
    openEditMode(){
      this.hasPostChanged = false;
      this.editMode = true
      this.$message.warning('A quick reminder, you can not change the post slug!')
    },
    getTime(time){
      return new Date(time.seconds * 1000).toLocaleDateString('en-US', this.timeOptions)
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
          const bookmarkData = { uid: this.post.uid, slug: this.post.slug, createdAt: new Date(Date.now()) }
          const postData = { bookmarkData: bookmarkData, uid: this.authUser.uid}
          
          if(this.hasAlreadyBookmarked){
            await this.$store.dispatch('post/removeBookmark', {bookmarkData: this.hasAlreadyBookmarked, uid: this.authUser.uid} );
            this.$message.error('Post deleted from your bookmarks.');
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
    this.editorLoading = true;
    setTimeout(() => {

      this.$refs.editor.quill.setContents(this.post.content)
      this.originalContent = JSON.stringify(this.$refs.editor.quill.getContents().ops)
      this.editorLoading = false;
    }, 1000);
  },
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const fetchUser = await context.store.dispatch('user/fetchUserId', context.route.params.username)

    if(fetchUser.exists){
      const user = (await context.store.dispatch('user/fetchUser', fetchUser.data().uid)).data();
      const post = await context.store.dispatch('post/fetchPost', {uid: user.uid, slug: context.route.params.postSlug});
      
      if(post.exists){

        return { user, post: post.data(), descriptionInput: post.data().description, titleInput: post.data().title }

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

.descriptionInput, .titleInput {
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
.titleInput {
  textarea {
    margin: 0;
    letter-spacing: -1px;
    text-transform: capitalize;
    font-size: 2.375rem;
    line-height: 3rem;
    @apply font-semibold
  }
}
</style>