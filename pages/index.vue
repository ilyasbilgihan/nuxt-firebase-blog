<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold relative">
        <span class="absolute top-1/2 -left-4 transform -translate-y-1/2 -translate-x-full p-4 rounded-full el-icon-discover text-purple-700 bg-purple-50"></span>
        Discover Posts
      </h1>

      <hr class="my-8">

      <el-empty v-if="!feed.length" description="No one has shared a post yet, be the first!" :image-size="100"></el-empty>
      <ListPosts v-else :users="users" :posts="feed" />

    </div>

  </div>
</template>

<script>


export default {
  data(){
    return {
    }
  },
  mounted(){
  },

  async asyncData(context){
    const feed = await context.store.dispatch('post/fetchFeed', 5);
    const users = {}

    for(let i = 0; i < feed.length; i++){

      if(users[feed[i].uid] == undefined){
        const user = await context.store.dispatch('user/fetchUser', feed[i].uid);
        users[feed[i].uid] = user.data();
      }
    }
    return { feed, users }
    
  }

}
</script>
