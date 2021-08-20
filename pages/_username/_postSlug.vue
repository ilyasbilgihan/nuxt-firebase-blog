<template>

  <div class="p-16 postView">
    <div class="w-2/3 px-8 mx-auto">
      <h1 class="text-4xl font-semibold capitalize" style="letter-spacing: -1px;">{{post.title}}</h1>
      <div class="mt-1">
        <span class="text-sm text-gray-600"><span class="el-icon-time mr-1"></span>{{new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US',timeOptions)}}</span>
      </div>
      <p class="my-4" style="font-size: 16px">{{post.description}}</p>
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
          <a href="#comments" class="flex items-center space-x-1"><span>12</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-blue-50 hover:text-blue-700 el-icon-chat-line-square"></span></a>
          <span @click="addToBookmarks()" :class="{'text-yellow-700 bg-yellow-50': hasAlreadyBookmarked, 'el-icon-collection-tag': !bookmarkLoading}" class="flex items-center justify-center text-2xl p-3 rounded-full cursor-pointer transition duration-300 hover:bg-yellow-50 hover:text-yellow-700"><span :class="{'el-icon-loading': bookmarkLoading, }"></span></span>
        </div>
      </div>
      <div class="mt-8">
        <client-only>
          <quill-editor
            ref="editor"
          />
        </client-only>
      </div>
      <hr class="my-8">
      <h2 id="comments" class="font-semibold">Comments</h2>
      <el-empty description="No comment found, be the first!" :image-size="100"></el-empty>
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
    }
  },
  methods:{
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
          const bookmarkData = { uid: this.post.uid, slug: this.post.slug }
          const postData = { bookmarkData: bookmarkData, uid: this.authUser.uid}
          
          if(this.hasAlreadyBookmarked){
            await this.$store.dispatch('post/removeBookmark', postData );
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
  computed: {
    authUser(){
      return this.$store.getters['user/getUser'];
    },
    hasAlreadyBookmarked(){
      let exists = false;
      if(this.authUser){
        exists = this.authUser.bookmarks.some(b => (b.uid == this.post.uid && b.slug == this.post.slug))
      }
      return exists;
    },
    hasAlreadyLiked(){
      let exists = false;
      if(this.authUser){
        exists = this.post.likes.includes(this.authUser.uid);
      }
      return exists;
    }
  },
  updated(){
    this.$refs.editor.quill.setContents(this.post.content);
    this.$refs.editor.quill.enable(false);
  },
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const fetchUser = await context.store.dispatch('user/fetchUserId', context.route.params.username)

    if(fetchUser.exists){
      const user = (await context.store.dispatch('user/fetchUser', fetchUser.data().uid)).data();
      const post = await context.store.dispatch('post/fetchPost', {uid: user.uid, slug: context.route.params.postSlug});
      
      if(post.exists){

        return { user, post: post.data() }

      }else {
        context.redirect('/') // or redirect to 404 page
      }

    }else {
      context.redirect('/') // or redirect to 404 page
    }

    
  }

}

</script>


<style>

.ql-editor{
  color: #303133;
  line-height: 1.5;
  font-family: 'Quicksand', sans-serif!important;
  font-size: 16px;
  padding: 0;
}

.postView {
  color: #303133;
}
</style>