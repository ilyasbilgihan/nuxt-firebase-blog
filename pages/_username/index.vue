<template>

  <div>

    <div class="h-64 shadow-lg relative overflow-hidden">
      <div class="coverImage" style="background-image: url(https://www.incimages.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg)"></div>
      <h1 class="displayName">{{user.displayName}}</h1>
    </div>
    <!-- Cover image end -->

    <div class="p-16 flex w-full">

      <div class="stickyUser w-1/6 relative">
        <div class="sticky top-32">
          <img :src="user.photoURL || require('@/assets/images/avatar.png')" class="w-2/3 rounded-2xl shadow-lg" :alt="user.displayName">
          <div class="mt-4 space-y-2 text-sm">
            <h6 class="font-semibold">{{user.displayName}}</h6>
            <p v-if="user.bio" class="pb-2">{{user.bio}}</p>
            <div v-if="user.location" :title="user.location" class="flex items-center"><i class="mr-1 text-xl el-icon-map-location"></i><span class="whitespace-nowrap overflow-ellipsis overflow-hidden">{{user.location}}</span></div>
            <div v-if="user.profession" :title="user.profession" class="flex items-center"><i class="mr-1 text-xl el-icon-suitcase"></i><span class="whitespace-nowrap overflow-ellipsis overflow-hidden">{{user.profession}}</span></div>
            <div class="flex space-x-4 pt-2">
              <div class="space-x-1"><strong v-if="!followLoading">{{user.followers.length}}</strong><span v-else class="el-icon-loading"></span><span>followers</span></div>
              <div class="space-x-1"><strong>{{user.followed.length}}</strong><span>followed</span></div>
            </div>
            <div v-if="!ownProfile">
              <el-button @click="toggleFollow()" type="success" size="medium" round :plain="hasAlreadyFollowed">{{hasAlreadyFollowed ? 'Unfollow' : 'Follow'}}</el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- User info end -->

      <div class="pl-16 w-4/6">

        <div class="flex mb-12 items-center justify-between">
          <h2 class="font-bold" style="color: #303133; letter-spacing: -1px">All the posts {{ownProfile ? 'you have' : 'the user has' }}</h2>
          <div v-if="ownProfile" class="flex space-x-2">
            <el-button @click="published = (!published ? true : published)" type="primary" size="small" round :plain="!published">Published</el-button>
            <el-button @click="published = (published ? false : published)" type="primary" size="small" round :plain="published">Unpublished</el-button>
          </div>
          <!-- Show Published/Unpublished post buttons end -->
        </div>
        <!-- Profile title end -->

        <div v-if="published">
          <el-empty v-if="!posts.length" :description="(ownProfile ? 'You have' : user.displayName + ' has')+' not shared a post yet.'" class="text-lg text-gray-500" :image-size="100"></el-empty>
          <ListPosts key="published" v-else :usersP="users" :postsP="posts" :showAuthor="false" :limit="limit" moreDispatchPath="post/fetchUserPostsMore" :uid="user.uid" />  
        </div>
        <!-- Published posts end -->
        <div v-else>
          <el-empty v-if="!unpPosts.length" description="You don't have an unpublished post yet." class="text-lg text-gray-500" :image-size="100"></el-empty>
          <ListPosts key="unpublished" v-else :usersP="users" :postsP="unpPosts" :showAuthor="false" :limit="limit" moreDispatchPath="post/fetchUnpUserPostsMore" :uid="user.uid" />  
        </div>
        <!-- Unpublished posts end -->

      </div>

    </div>
	
  </div>

</template>

<script>
const LIMIT = 3;

export default {
  head(){
    return {
      title: `${this.user.displayName}'s profile`,
    }
  },
  data(){
    return {
      followLoading: false,
      limit: LIMIT,
      published: true,
    }
  },
  methods:{
    async toggleFollow(){
      if(this.authUser){
        
        if(!this.followLoading){
          this.followLoading = true;

          if(this.hasAlreadyFollowed){
            await this.$store.dispatch('user/unfollow', this.user.uid);
            this.user.followers.splice(this.user.followers.indexOf(this.authUser.uid), 1);
          }else {
            await this.$store.dispatch('user/follow', this.user.uid);
            this.user.followers.push(this.authUser.uid);
          }

          this.followLoading = false;

        }else {
          this.$message.warning('Slow Down !!!');
        }

      }else {
        this.$message.error('You have to login to follow someone');
      }
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
    },
    hasAlreadyFollowed(){
      if(this.authUser == null){
        return false
      }else {
        return this.authUser.followed.includes(this.user.uid);
      }
    }
  },

  
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const fetchUser = await context.store.dispatch('user/fetchUserId', context.route.params.username)
    if(fetchUser.exists){
      const user = (await context.store.dispatch('user/fetchUser', fetchUser.data().uid)).data();
      const { posts, users } = await context.store.dispatch('post/fetchUserPosts', {uid: user.uid, limit: LIMIT, cacheUsers: []});
      const { posts: unpPosts } = await context.store.dispatch('post/fetchUserUnpPosts', {uid: user.uid, limit: LIMIT, cacheUsers: []});

      return { user, posts, users, unpPosts }
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