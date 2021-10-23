<template>

  <div clasS="flex flex-col mt-4 mb-12 ml-4">

    <div class="w-full flex flex-col lg:flex-row">

      <div class="flex-1 flex flex-col lg:pr-8">
        <NuxtLink v-if="showAuthor" :to="'/' + user.username" :title="'@'+ user.username" class="hidden mb-1 author md:flex w-max items-center space-x-2">
          <img :src="user.photoURL || require('assets/images/avatar.png')" class="rounded-full shadow h-7 w-7 overflow-hidden" :alt="user.displayName">
          <span class="text-xs font-semibold text-gray-700 transition duration-300 transform">{{user.displayName}} </span>
        </NuxtLink>
        <!-- Post owner end (not visible always)-->

        <NuxtLink class="limit-lines card-title capitalize transition duration-300 transform hover:translate-x-1 hover:text-gray-500 l-1 font-bold mb-2" style="letter-spacing: -1px;" :title="post.title" :to="'/'+ user.username + '/' + post.slug"><h3>{{post.title}}</h3></NuxtLink>
        <!-- Post title end -->

        <p  class="l-3 h-0 lg:h-auto limit-lines" style="font-size: 15px">{{post.description}}</p>
        <!-- Post description end -->

      </div>
      <!-- Post image end -->

      <div class="lg:w-48 flex flex-col sm:flex-row sm:items-center lg:block">
        <p class="l-4 sm:pt-0 sm:mr-6 sm:flex-1 h-auto lg:h-0 limit-lines" style="font-size: 15px">{{post.description}}</p>
        <NuxtLink :title="post.title" class="mt-2 sm:mt-0 lg:w-48 flex flex-col sm:flex-row sm:items-center lg:block" :to="'/'+ user.username + '/' + post.slug">
         <div class="w-full h-32 sm:w-42 lg:w-48 sm:h-28 lg:h-32 shadow rounded-md postImageAnimation bg-cover" :style="`background-image: url(${post.postImageURL})`"></div>
        </NuxtLink>
      </div>      
      <!-- Post image end -->
      
    </div>
    <!-- Post card main end -->

    <div class="flex justify-between sm:px-0 flex-row lg:flex-row mt-3 sm:mt-2">
      <ul class="hidden md:flex space-x-2 items-center flex-1 pr-8">
        <li v-for="tag in post.tags" :key="tag.slug">
          <NuxtLink :to="'/tag/' + tag.slug" class="tag">{{tag.name}}</NuxtLink>
        </li>
      </ul>
      <!-- Post tags end -->

      <NuxtLink :to="'/' + user.username" :title="'@'+ user.username" class="md:hidden author flex w-max items-center space-x-2">
        <img :src="user.photoURL || require('assets/images/avatar.png')" class="rounded-full shadow h-7 w-7 overflow-hidden" :alt="user.displayName">
        <span class="text-xs font-semibold text-gray-700 transition duration-300 transform">{{user.displayName}} </span>
      </NuxtLink>
      <!-- Post owner(mobile) end -->

      <div class="w-auto sm:w-42 lg:w-48 flex space-x-2 sm:space-x-5 items-center text-sm text-gray-600 sm:px-4">
        <div :class="{'text-red-700': hasAlreadyLiked}" class="flex justify-end flex-1 items-center space-x-1"><Loading v-if="likeLoading"/><span v-else>{{post.likes.length}}</span><span @click="likePost()" :class="{'bg-red-50': hasAlreadyLiked}" class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-red-50 hover:text-red-700 isax-heart"></span></div>
        <NuxtLink :to="'/'+ user.username + '/' + post.slug + '#comments'" class="flex flex-row justify-end flex-1 items-center space-x-1 space-x-reverse flex-row-reverse"><span>{{post.commentCount}}</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-blue-50 hover:text-blue-700 isax-messages-3"></span></NuxtLink>
      </div>
      <!-- Post like, comment buttons end -->

    </div>
    <!-- Post details end -->

  </div>

</template>


<script>
export default {
  data(){
    return {
      likeLoading: false,
      user: this.userP,
      post: this.postP
    }
  },
  methods: {
    async likePost(){

      if(this.authUser){

        if(!this.likeLoading){
          this.likeLoading = true;

          const postData = {ownerId: this.user.uid, slug: this.post.slug, uid: this.authUser.uid}
          
          if(this.hasAlreadyLiked) {

            await this.$store.dispatch('post/dislikePost', postData)
            this.post.likes.splice(this.post.likes.indexOf(this.authUser.uid), 1)

          }else {

            await this.$store.dispatch('post/likePost', postData)
            this.post.likes.push(this.authUser.uid);

          }
          this.likeLoading = false;

        }else {
          this.$message.warning('Slow Down !!!')
        }
      }else {
        this.$message.warning('You have to login to like a post.')
      }
    },
  },
  computed: {
    hasAlreadyLiked(){
      let exists = false;
      if(this.authUser){
        exists = this.post.likes.includes(this.authUser.uid);
      }
      return exists;
    },
    authUser(){
      return this.$store.getters['user/getUser']
    }
  },
  props: {
    userP: Object,
    postP: Object,
    showAuthor: Boolean,
  },

  async fetch(){
    const commentCount = await this.$store.dispatch('comment/fetchCommentCount', { postOwnerId: this.userP.uid, slug: this.postP.slug })
    this.post = {...this.postP, commentCount}

  }
}
</script>

<style lang="scss" scoped>

.card-title {
  width: fit-content;
  width: webkit-fit-content;
  width: intrinsic;
}

.limit-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;  
  box-orient: vertical;
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
  &.l-4{
    -webkit-line-clamp: 4;
  }
}

.author:hover {
  span {
    @apply translate-x-1
  }
}

</style>