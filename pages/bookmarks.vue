<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold relative"><span class="absolute top-1/2 -left-4 transform -translate-y-1/2 -translate-x-full p-4 rounded-full el-icon-collection-tag text-yellow-700 bg-yellow-50"></span>Your Bookmarks</h1>

      <hr class="my-8">

      <el-empty v-if="!posts.length" description="You don't have any bookmarks yet. Add some!" :image-size="100"></el-empty>
      <ListPosts v-else :users="users" :posts="posts" />
    </div>

  </div>
</template>

<script>


export default {
  
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

      const post = await context.store.dispatch('post/fetchPost', {uid: bookmarks[i].uid, slug: bookmarks[i].slug});
      
      if(post.exists){
        posts.push(post.data())

        if(users[bookmarks[i].uid] == undefined){
          const user = await context.store.dispatch('user/fetchUser', bookmarks[i].uid);
          users[bookmarks[i].uid] = user.data();
        }
      }else {
        const bookmarkData = authUser.bookmarks.filter(b => (b.uid == bookmarks[i].uid && b.slug == bookmarks[i].slug))[0];
        await context.store.dispatch('post/removeBookmark', {uid: authUser.uid, bookmarkData: bookmarkData});
      }

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
