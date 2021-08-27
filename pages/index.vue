<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold relative">
        <span class="absolute top-1/2 -left-4 transform -translate-y-1/2 -translate-x-full p-4 rounded-full el-icon-discover text-purple-700 bg-purple-50"></span>
        Discover Posts
      </h1>

      <hr class="my-8">

      <el-empty v-if="!posts.length" description="No one has shared a post yet, be the first!" :image-size="100"></el-empty>
      <ListPosts v-else :usersP="users" :postsP="posts" :limit="limit" moreDispatchPath="post/fetchAllPostsMore" />

    </div>

  </div>
</template>

<script>
const LIMIT = 3;

export default {
  head(){
    return {
      title: `Discover Posts`,
    }
  },
  data(){
    return {
      limit: LIMIT,
    }
  },

  async asyncData(context){

    const { posts, users } = await context.store.dispatch('post/fetchAllPosts', {limit: LIMIT, cacheUsers: []});
    return { posts, users }
    
  }

}
</script>
