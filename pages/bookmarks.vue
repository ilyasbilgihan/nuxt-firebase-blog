<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold">Your Bookmarks</h1>

      <hr class="my-8">

      <el-empty v-if="!posts.length" description="You don't have any bookmarks yet. Add some!" :image-size="100"></el-empty>
      <el-timeline v-else>

        <el-timeline-item v-for="post in posts" :key="post.slug" :timestamp="new Date(post.createdAt.seconds * 1000).toLocaleString()" placement="top">
          
          <PostCard :authUser="authUser" :user="users[post.uid]" :post="post" :show-author="true"></PostCard>
          
        </el-timeline-item>

      </el-timeline>
    </div>

  </div>
</template>

<script>


export default {
  data(){
  },
  mounted(){
  },
  computed: {
    authUser(){
      return this.$store.getters['user/getUser']
    }
  },
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const authUser = context.store.getters['user/getUser'];
    const posts = [];
    const users = {};
    for(let i = 0; i < authUser.bookmarks.length; i++){

      if(users[authUser.bookmarks[i].uid] === undefined){
        const user = await context.store.dispatch('user/fetchUser', authUser.bookmarks[i].uid);
        users[authUser.bookmarks[i].uid] = user.data();
      }
      const post = await context.store.dispatch('post/fetchPost', authUser.bookmarks[i]);
      posts.push(post.data())
    }
    return { posts, users}

  }
}

</script>
