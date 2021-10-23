<template>
  <div class="md:w-10/12 xl:w-2/3 mx-auto xl:px-8">

    <div class="font-semibold relative space-x-20 xl:space-x-0">
      <span class="text-4xl absolute top-1/2 xl:-left-4 transform -translate-y-1/2 xl:-translate-x-full p-4 rounded-full isax-people text-purple-700 bg-purple-50"></span>
      <h1>Your Feed</h1>
    </div>

    <hr class="my-8">

    <el-empty v-if="!posts.length" description="You are not following anyone or the ones you follow has not shared a post yet." :image-size="100"></el-empty>
    <ListPosts v-else :usersP="users" :postsP="posts" :limit="limit" moreDispatchPath="post/fetchFollowedUsersPostsMore" :followedList="followedList"/>
    
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
