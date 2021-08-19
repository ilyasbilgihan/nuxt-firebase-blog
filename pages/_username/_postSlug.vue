<template>

  <div class="p-16">
	  
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
          <div class="flex items-center space-x-1"><span>123</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-yellow-50 hover:text-yellow-700 el-icon-star-off"></span></div>
          <a href="#comments" class="flex items-center space-x-1"><span>12</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-blue-50 hover:text-blue-700 el-icon-chat-line-square"></span></a>
          <span class="text-2xl p-3 rounded-full cursor-pointer transition duration-300 hover:bg-red-50 hover:text-red-700 el-icon-collection-tag"></span>
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
      timeOptions: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
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

</style>