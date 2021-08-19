<template>

  <div>

    <div class="h-64 shadow-lg relative overflow-hidden">
      <div class="coverImage" style="background-image: url(https://www.incimages.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg)"></div>
      <h1 class="displayName">{{user.displayName}}</h1>
    </div>

    <div class="p-16 flex w-full">
      <div class="stickyUser w-1/6 relative">
        <div class="sticky top-32">
          <img :src="user.photoURL || require('@/assets/images/avatar.png')" class="w-2/3 rounded-2xl shadow-lg" :alt="user.displayName">
          <div class="mt-4 space-y-2 text-sm">
            <h6 class="font-semibold">{{user.displayName}}</h6>
            <p v-if="user.bio" class="pb-2">{{user.bio}}</p>
            <div v-if="user.location" :title="user.location" class="flex items-center"><i class="mr-1 text-xl el-icon-map-location"></i><span class="whitespace-nowrap overflow-ellipsis overflow-hidden">{{user.location}}</span></div>
            <div v-if="user.profession" :title="user.profession" class="flex items-center"><i class="mr-1 text-xl el-icon-suitcase"></i><span class="whitespace-nowrap overflow-ellipsis overflow-hidden">{{user.profession}}</span></div>
          </div>
        </div>
      </div>
      <el-timeline class="pl-16 w-4/6">
        <h2 class="font-bold mb-12" style="color: #303133; letter-spacing: -1px">All the posts {{ownProfile ? 'you' : 'the user' }} have</h2>

        <el-empty v-if="!posts.length" :description="(ownProfile ? 'You have' : user.displayName + ' has')+' not shared a post yet.'" class="text-lg text-gray-500" :image-size="100"></el-empty>
        <el-timeline-item v-else v-for="post in posts" :key="post.slug" :timestamp="new Date(post.createdAt.seconds * 1000).toLocaleString()" placement="top">
          
          <div clasS="flex flex-col mt-4 mb-12 ml-4">
            <div class="w-full flex ">
              <div class="flex-1 flex flex-col pr-8">
                <NuxtLink class="capitalize transition duration-300 transform hover:translate-x-1 hover:text-gray-500 limit-lines l-1 font-bold mb-2" style="letter-spacing: -1px" :title="post.title" :to="'/'+ user.username + '/' + post.slug"><h3>{{post.title}}</h3></NuxtLink>
                <p class="limit-lines l-3" style="font-size: 15px">{{post.description}}</p>
              </div>
              <NuxtLink :title="post.title" class="w-48 h-32 shadow rounded-md overflow-hidden" :to="'/'+ user.username + '/' + post.slug">
                <div class="postImageAnimation w-full h-full bg-cover" style="background-image: url(https://www.incimages.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg)"></div>
              </NuxtLink>
            </div>
            <div class="flex mt-2">
              <div class="flex flex-1 items-center pr-8 space-x-2">
                <span class="tag">tags</span>
                <span class="tag">are</span>
                <span class="tag">not</span>
                <span class="tag">ready</span>
                <span class="tag">yet</span>
              </div>
              <div class="w-48 flex justify-evenly items-center text-sm text-gray-600 px-4">
                <div class="flex items-center space-x-1"><span>123</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-yellow-50 hover:text-yellow-700 el-icon-star-off"></span></div>
                <NuxtLink :to="'/'+ user.username + '/' + post.slug + '#comments'" class="flex items-center space-x-1 space-x-reverse flex-row-reverse"><span>12</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-blue-50 hover:text-blue-700 el-icon-chat-line-square"></span></NuxtLink>
              </div>
            </div>

          </div>
          
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
  computed:{
    authUser(){
      return this.$store.getters['user/getUser'];
    },
    ownProfile(){
      if(this.authUser == null){
        return false
      }else {
        return this.authUser.username == this.$route.params.username
      }
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

.limit-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  &.l-1{
    -webkit-line-clamp: 1;
  }
  &.l-2{
    -webkit-line-clamp: 2;
  }
  &.l-3{
    -webkit-line-clamp: 3;
  }
}

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