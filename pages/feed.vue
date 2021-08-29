<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold relative">
        <span class="absolute top-1/2 -left-4 transform -translate-y-1/2 -translate-x-full p-4 rounded-full el-icon-share text-pink-700 bg-pink-50"></span>
        Your Feed
      </h1>

      <hr class="my-8">

      <el-empty v-if="!posts.length" description="You are not following anyone or the ones you follow has not shared a post yet." :image-size="100"></el-empty>
      <ListPosts v-else :usersP="users" :postsP="posts" :limit="limit" moreDispatchPath="post/fetchFollowedUsersPostsMore" :followedList="followedList"/>
      
    </div>

  </div>
</template>

<script>
const LIMIT = 3;

export default {
  head(){
    return {
      title: `Your Feed`,
    }
  },
  data(){
    return {
      limit: LIMIT
    }
  },

  async asyncData(context){
    
    const authUser = await context.store.getters['user/getUser']
    const followedList = [...authUser.followed];

    if(followedList.length != 0){
      
      const { posts, users } = await context.store.dispatch('post/fetchFollowedUsersPosts', {followedList, cacheUsers: [], limit: LIMIT})
      return { posts, users, followedList }

    }else {
      return { posts: [], users: {}, followedList }
    }
    
  }

}

</script>
