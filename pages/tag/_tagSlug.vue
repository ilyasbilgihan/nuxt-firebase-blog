<template>
  <div class="p-16">

    <div class="w-2/3 mx-auto px-8">
      <h1 class="font-semibold relative">
        <span class="absolute top-1/2 -left-4 transform -translate-y-1/2 -translate-x-full p-4 rounded-full el-icon-price-tag text-green-700 bg-green-50"></span>
        {{$route.params.tagSlug}}
      </h1>

      <hr class="my-8">

      <ListPosts :users="users" :posts="posts" />
      
    </div>

  </div>
</template>

<script>


export default {
  data(){
    return {
    }
  },

  async asyncData(context){
    
    const posts = await context.store.dispatch('post/fetchPostsWithTag', {limit: 5, tag: context.route.params.tagSlug});
    const users = {}

    for(let i = 0; i < posts.length; i++){

      if(users[posts[i].uid] == undefined){
        const user = await context.store.dispatch('user/fetchUser', posts[i].uid);
        users[posts[i].uid] = user.data();
      }

    }
    if(posts.length == 0){
      context.redirect('/');
    }
    return { posts, users }
    
  }

}
</script>
