<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold relative">
        <span class="absolute top-1/2 -left-4 transform -translate-y-1/2 -translate-x-full p-4 rounded-full isax-save-2 text-yellow-700 bg-yellow-50"></span>
        Your Bookmarks
      </h1>

      <hr class="my-8">

      <el-empty v-if="!posts.length" description="You don't have any bookmarks yet. Add some!" :image-size="100"></el-empty>
      <ListPosts v-else :usersP="users" :postsP="posts" :limit="limit" moreDispatchPath="post/fetchSomeBookmarkedPosts" :bookmarks="bookmarks"/>
    
    </div>

  </div>
</template>

<script>
const LIMIT = 3;

export default {
  head(){
    return {
      title: `Your Bookmarks`,
    }
  },
  data(){
    return {
      limit: LIMIT,
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
    bookmarks.sort(compare)
    const { posts, users } = await context.store.dispatch('post/fetchSomeBookmarkedPosts', {bookmarks, limit: LIMIT, last: 0, cacheUsers: []})
    
    return { posts, users, bookmarks}

  }
}

function compare( a, b ) {
  if ( a.createdAt > b.createdAt ){
    return -1;
  }
  if ( a.createdAt < b.createdAt ){
    return 1;
  }
  return 0;
}
</script>
