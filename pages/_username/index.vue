<template>

  <div>

    <div class="h-64 shadow-lg relative overflow-hidden">
      <div class="coverImage" style="background-image: url(https://www.incimages.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg)"></div>
      <h1 class="displayName">{{user.displayName}}</h1>
    </div>

    <div class="p-16 flex">
      <div class="stickyUser w-1/6 relative">
        <div class="sticky top-16">
          <img :src="user.photoURL || require('@/assets/images/avatar.png')" class="w-2/3 rounded-2xl shadow-lg" :alt="user.displayName">
          <div class="mt-4 space-y-2 text-sm">
            <div class="font-semibold text-base">{{user.displayName}}</div>
            <p v-if="user.bio" class="pb-2">{{user.bio}}</p>
            <div v-if="user.location" :title="user.location" class="flex items-center"><i class="mr-1 text-xl el-icon-map-location"></i><span class="whitespace-nowrap overflow-ellipsis overflow-hidden">{{user.location}}</span></div>
            <div v-if="user.profession" :title="user.profession" class="flex items-center"><i class="mr-1 text-xl el-icon-suitcase"></i><span class="whitespace-nowrap overflow-ellipsis overflow-hidden">{{user.profession}}</span></div>
          </div>
        </div>
      </div>
      <el-timeline class="flex-1 pl-8">
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

<style lang="scss" scoped>

.displayName {
  display: inline-block;
  @apply text-3xl text-white absolute bottom-0 select-none p-8 pr-28;
  z-index: 2;
  &:before {
    content: '';
    @apply bg-gradient-to-r from-black via-gray-900 to-transparent;
    opacity: .2;
    z-index: -1;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
}

.coverImage {
  @apply w-full h-64;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -2;
}

.stickyUser {
  color: #303133
}

</style>