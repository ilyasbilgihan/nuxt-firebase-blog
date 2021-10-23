<template>
  <div class="md:w-10/12 xl:w-2/3 mx-auto xl:px-8">

    <div class="font-semibold relative space-x-20 xl:space-x-0">
      <span class="text-4xl absolute top-1/2 xl:-left-4 transform -translate-y-1/2 xl:-translate-x-full p-4 rounded-full isax-discover-1 text-purple-700 bg-purple-50"></span>
      <h1>Discover Posts</h1>
    </div>

    <hr class="my-8">

    <el-empty v-if="!posts.length" description="No one has shared a post yet, be the first!" :image-size="100"></el-empty>
    <ListPosts v-else :usersP="users" :postsP="posts" :limit="limit" moreDispatchPath="post/fetchAllPostsMore" />

  </div>
</template>

<script>
const LIMIT = 3;

export default {
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
