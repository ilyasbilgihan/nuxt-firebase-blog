<template>
  <div class="md:w-10/12 xl:w-2/3 mx-auto xl:px-8">

    <div class="font-semibold relative space-x-20 xl:space-x-0">
      <span class="text-4xl absolute top-1/2 xl:-left-4 transform -translate-y-1/2 xl:-translate-x-full p-4 rounded-full isax-clipboard text-green-700 bg-green-50"></span>
      <h1>{{$route.params.tagSlug}}</h1>
    </div>

    <hr class="my-8">

    <el-empty v-if="!posts.length" description="Tag not found, ERROR" :image-size="100"></el-empty>
    <ListPosts v-else :usersP="users" :postsP="posts" :limit="limit" moreDispatchPath="post/fetchPostsWithTagMore" :tag="$route.params.tagSlug" />

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
