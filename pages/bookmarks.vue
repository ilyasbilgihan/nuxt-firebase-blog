<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold">Your Bookmarks</h1>

      <hr class="my-8">

      <el-empty v-if="!posts.length" description="You don't have any bookmarks yet. Add some!" :image-size="100"></el-empty>
      <el-timeline v-else>

        <el-timeline-item v-for="post in posts" :key="post.slug" :timestamp="getDate(post)" placement="top">
          
          <PostCard :authUser="authUser" :user="users[post.uid]" :post="post" :show-author="true"></PostCard>
          
        </el-timeline-item>

      </el-timeline>
    </div>

  </div>
</template>

<script>


export default {
  data(){
    return {
      timeOptions: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    }
  },
  methods:{
    getLocale(time){
      return new Date(time.seconds * 1000).toLocaleDateString('en-US', this.timeOptions);
    },
    getDate(post){
      const createdAt = this.getLocale(post.createdAt);
      const updatedAt = this.getLocale(post.updatedAt);
      let string = `Published at: ${createdAt}`
      if(post.createdAt.seconds != post.updatedAt.seconds){
        string = `Last update: ${updatedAt}`
      }
      return string
    }
  },
  computed: {
    authUser(){
      return this.$store.getters['user/getUser']
    }
  },
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const authUser = context.store.getters['user/getUser'];
    const bookmarks = JSON.parse(JSON.stringify(authUser.bookmarks))
    const posts = [];
    const users = {};
    bookmarks.sort(compare)
    for(let i = 0; i < bookmarks.length; i++){

      if(users[bookmarks[i].uid] === undefined){
        const user = await context.store.dispatch('user/fetchUser', bookmarks[i].uid);
        users[bookmarks[i].uid] = user.data();
      }
      const post = await context.store.dispatch('post/fetchPost', {uid: bookmarks[i].uid, slug: bookmarks[i].slug});
      posts.push(post.data())
    }
    return { posts, users}

  }
}

function compare( a, b ) {
  if ( a.createdAt.seconds > b.createdAt.seconds ){
    return -1;
  }
  if ( a.createdAt.seconds < b.createdAt.seconds ){
    return 1;
  }
  return 0;
}
</script>
