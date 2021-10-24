<template>

  <div class="">

    <div class="-mx-8 -mt-8 sm:-mx-16 sm:-mt-16 h-64 shadow-lg relative overflow-hidden">
      <div class="coverImage postImageAnimation" :style="`background-image: url(${coverImageURL || (user.coverImageURL || require('@/assets/images/cover-default.jpg'))})`"></div>
      <h1 class="displayName">{{user.displayName}}</h1>
      <div v-if="ownProfile" class="absolute bottom-0 right-0 p-8 flex items-center justify-center text-white z-10">

        <client-only>
          <el-upload
            v-if="!this.coverImageURL"
            action=""
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            >
            <el-tooltip effect="dark" content="Change cover image" placement="left">
              <el-button size="small" type="warning" class="w-12 h-12" circle plain>
                <span class="isax-gallery-edit text-lg"></span>
              </el-button>
            </el-tooltip>
          </el-upload>
          <div v-else class="flex space-x-2">
            <el-tooltip effect="dark" content="Discard changing" placement="left">
              <el-button @click="discardChanging()" size="small" type="danger" class="w-12 h-12" circle plain>
                <span class="isax-gallery-remove text-lg"></span>
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="Accept changing" placement="top">
              <el-button @click="acceptChanging()" size="small" type="success" class="w-12 h-12" circle plain>
                <span class="isax-gallery-tick text-lg"></span>
              </el-button>
            </el-tooltip>
          </div>
        </client-only>

      </div>
    </div>
    <!-- Cover image end -->

    <div class="py-8 sm:py-16 flex flex-col xl:flex-row md:w-10/12 md:mx-auto xl:mx-0 xl:w-auto">

      <div class="w-full xl:w-1/6 xl:relative">
        <div class="xl:sticky xl:top-32 flex xl:flex-col gap-4 xl:gap-x-0 mb-8 xl:mb-0 ">
          <div class="w-1/2 sm:w-3/12 lg:w-1/6 xl:w-3/4">
            <img :src="user.photoURL || require('@/assets/images/avatar.png')" class="rounded-2xl shadow-lg" :alt="user.displayName">
            <div class="flex sm:hidden mt-4 gap-x-2 lg:block space-x-1 lg:space-x-0 lg:space-y-1 xl:space-y-0">
              <div v-if="user.location" :title="user.location" class="flex items-center flex-1 whitespace-nowrap overflow-ellipsis overflow-hidden"><i class="mr-1 text-xl isax-location"></i><span class="overflow-ellipsis overflow-hidden">{{user.location}}</span></div>
              <div v-if="user.profession" :title="user.profession" class="flex items-center flex-1 whitespace-nowrap overflow-ellipsis overflow-hidden"><i class="mr-1 text-xl isax-briefcase"></i><span class="overflow-ellipsis overflow-hidden">{{user.profession}}</span></div>
            </div>
          </div>
          <div class="flex justify-between sm:justify-center flex-col w-1/2 sm:flex-row xl:flex-col sm:w-9/12 lg:w-5/6 xl:w-auto gap-2 sm:gap-4 sm:items-center xl:items-start">
            <div class="sm:w-1/2 lg:w-2/3 xl:w-auto">
              <h6 class="hidden sm:block font-semibold">{{user.displayName}}</h6>
              <p v-if="user.bio" class="pt-2 sm:pt-0 limit-lines l-5">{{user.bio}}</p>
            </div>
            <div class="sm:w-1/2 lg:w-1/3 xl:w-full">
              <div class="hidden sm:flex gap-x-2 lg:block space-x-1 lg:space-x-0 lg:space-y-1 xl:space-y-0">
                <div v-if="user.location" :title="user.location" class="flex items-center flex-1 whitespace-nowrap overflow-ellipsis overflow-hidden"><i class="mr-1 text-xl isax-location"></i><span class="overflow-ellipsis overflow-hidden">{{user.location}}</span></div>
                <div v-if="user.profession" :title="user.profession" class="flex items-center flex-1 whitespace-nowrap overflow-ellipsis overflow-hidden"><i class="mr-1 text-xl isax-briefcase"></i><span class="overflow-ellipsis overflow-hidden">{{user.profession}}</span></div>
              </div>
              
              <div class="flex flex-col items-center xl:items-start">
                <div class="flex space-x-4 sm:pt-2" :class="{'pb-2' : !ownProfile}">
                  <div class="space-x-1 flex flex-col items-center sm:block"><Loading v-if="followLoading" /><strong v-else>{{user.followers.length}}</strong><span>followers</span></div>
                  <div class="space-x-1 flex flex-col items-center sm:block"><strong>{{user.followed.length}}</strong><span>followed</span></div>
                </div>
                <div v-if="!ownProfile">
                  <el-button @click="toggleFollow()" type="success" size="medium" round :plain="hasAlreadyFollowed">{{hasAlreadyFollowed ? 'Unfollow' : 'Follow'}}</el-button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div class="xl:w-2/3 xl:mx-0 xl:px-8">

        <div class="flex flex-col sm:flex-row mb-12 sm:items-center justify-between space-y-3 sm:space-y-0">
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
import { metaData, toCapitalize } from '@/helpers/meta-tags';
const LIMIT = 3;

export default {
  head(){
    return {
      title: `${toCapitalize(this.user.displayName)}'s rofile`,
      meta: metaData({
        title: `${toCapitalize(this.user.displayName)}'s profile`,
        description: `Public profile page of ${toCapitalize(this.user.displayName)}.`,
        image: this.user.photoURL || require('@/assets/images/avatar.png'),
        imageAlt: toCapitalize(this.user.displayName),
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
        this.$message.warning('You have to login to follow someone');
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
        this.$router.go();
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