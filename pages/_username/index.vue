<template>

  <div>

    <div class="h-64 shadow-lg relative overflow-hidden">
      <div class="coverImage postImageAnimation" :style="`background-image: url(${coverImageURL || (user.coverImageURL || require('@/assets/images/cover-default.jpg'))})`"></div>
      <h1 class="displayName">{{user.displayName}}</h1>
      <div v-if="ownProfile" class="absolute bottom-0 right-0 p-8 flex items-center justify-center text-white">

        <el-upload
          v-if="!this.coverImageURL"
          action=""
          :show-file-list="false"
          :on-success="handleCoverSuccess"
          :before-upload="beforeCoverUpload"
          >
          <el-tooltip effect="dark" content="Change cover image" placement="left">
            <el-button size="small" type="warning" class="w-12 h-12" circle plain>
              <span class="el-icon-picture-outline text-lg"></span>
            </el-button>
          </el-tooltip>
        </el-upload>
        <div v-else class="flex space-x-2">
          <el-tooltip effect="dark" content="Discard changing" placement="left">
            <el-button @click="discardChanging()" size="small" type="danger" class="w-12 h-12" circle plain>
              <span class="el-icon-close text-lg"></span>
            </el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="Accept changing" placement="top">
            <el-button @click="acceptChanging()" size="small" type="success" class="w-12 h-12" circle plain>
              <span class="el-icon-check text-lg"></span>
            </el-button>
          </el-tooltip>
        </div>

      </div>
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
import metaData from '@/lib/meta-tags';
const LIMIT = 3;

export default {
  head(){
    return {
      title: `${this.user.displayName}'s rofile`,
      meta: metaData({
        title: `${this.user.displayName}'s profile`,
        description: `Public profile page of ${this.user.displayName}.`,
        image: this.user.photoURL || require('@/assets/images/avatar.png'),
        imageAlt: this.user.displayName,
        url: this.$route.path
      })
    }
  },
  data(){
    return {
      followLoading: false,
      limit: LIMIT,
      published: true,
      coverImageURL: null,
      coverImageFile: null,
      coverLoading: false,
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
    },
    discardChanging(){
      this.coverImageURL = null;
      this.coverImageFile = null;
    },
    async acceptChanging(){
      if(!this.coverLoading){
        this.coverLoading = true;
        await this.$store.dispatch('user/updateUser', {updatedUser: JSON.parse(JSON.stringify(this.authUser)), coverImageFile: this.coverImageFile});
        this.$message.success('Cover image changed successfully.');
        this.coverLoading = false;
      }else {
        this.$message.warning('Slow Down !!!');
      }
    },
    handleCoverSuccess(res, file) {
      const img = new Image();
      img.src = URL.createObjectURL(file.raw);
      const _this = this;
      img.onload = function(){
        if(this.width > 1920 || this.height > 1080){
          _this.$message.error('Cover image resolution can not exceed 1920x1080')
        }else {
          _this.coverImageURL = this.src
          _this.coverImageFile = file.raw;
        }
      }
    },
    beforeCoverUpload(file) {
      const isJPG = (file.type === 'image/jpeg') || (file.type === 'image/png');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('Cover image must be JPG or PNG format!');
      }
      else if (!isLt2M) {
        this.$message.error('Cover image size can not exceed 2MB!');
      }
      return isJPG && isLt2M;
    },
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
  z-index: -2;
}

.stickyUser {
  color: #303133
}

</style>