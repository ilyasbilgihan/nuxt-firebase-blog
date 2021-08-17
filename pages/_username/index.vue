<template>

  <div>

    <h3 class="text-4xl font-semibold">Public User Page - {{user.username}}</h3>
    <div class="flex mt-4">
      <img class="w-40 rounded-full border border-gray-100 shadow-lg" :src="user.photoURL || require('@/assets/images/avatar.png')" alt="">
      <div class="flex flex-col justify-between py-4 ml-8">
        <div>{{user.displayName}} - {{user.profession}}</div>
        <div>{{user.email}}</div>
        <div>{{user.location}}</div>
        <div>{{user.bio}}</div>
      </div>
    </div>

    <hr class="my-8">

    <h3 class="text-3xl font-semibold mb-4">Posts</h3>
    <el-timeline>
      <el-timeline-item v-for="post in posts" :key="post.slug" :timestamp="new Date(post.createdAt.seconds * 1000).toLocaleString()" placement="top">
        
        <NuxtLink :to="'/'+ user.username + '/' + post.slug">
        <el-card>

          <h4 class="font-semibold">{{post.title}}</h4>
          <p>{{post.description}}</p>

        </el-card>
        </NuxtLink>
        
      </el-timeline-item>
    </el-timeline>
	
  </div>

</template>

<script>

export default {
  head(){
    return {
      title: `${this.user.displayName}'s profile`,
    }
  },
  
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const fetchUser = await context.store.dispatch('user/fetchUserId', context.route.params.username)
    if(fetchUser.exists){
      const user = (await context.store.dispatch('user/fetchUser', fetchUser.data().uid)).data();
      const posts = (await context.store.dispatch('post/fetchUserPosts', user.uid));


      return { user, posts }
    }else {
      context.redirect('/') // or redirect to 404 page
    }
  }

}

</script>