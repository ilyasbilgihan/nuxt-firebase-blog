<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold relative">
        <span class="absolute top-1/2 -left-4 transform -translate-y-1/2 -translate-x-full p-4 rounded-full isax-clipboard text-green-700 bg-green-50"></span>
        {{$route.params.tagSlug}}
      </h1>

      <hr class="my-8">

      <el-empty v-if="!posts.length" description="Tag not found, ERROR" :image-size="100"></el-empty>
      <ListPosts v-else :usersP="users" :postsP="posts" :limit="limit" moreDispatchPath="post/fetchPostsWithTagMore" :tag="$route.params.tagSlug" />

    </div>

  </div>
</template>

<script>
const LIMIT = 2;

export default {
  head(){
    return {
      title: `Posts tagged with ${this.$route.params.tagSlug}`,
    }
  },
  data(){
    return {
      limit: LIMIT,
    }
  },

  async asyncData(context){
    
    const { posts, users } = await context.store.dispatch('post/fetchPostsWithTag', {limit: LIMIT, tag: context.route.params.tagSlug, cacheUsers: []});

    if(posts.length == 0){
      context.redirect('/');
    }

    return { posts, users }
    
  }

}
</script>
