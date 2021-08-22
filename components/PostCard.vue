<template>

  <div clasS="flex flex-col mt-4 mb-12 ml-4">
    <div class="w-full flex ">
      <div class="flex-1 flex flex-col pr-8">
        <NuxtLink v-if="showAuthor" :to="'/' + user.username" :title="'@'+ user.username" class="mb-1 author flex w-max items-center space-x-2">
          <img :src="user.photoURL || require('@/assets/images/avatar.png')" class="rounded-full shadow h-7 w-7 overflow-hidden" :alt="post.displayName">
          <span class="text-xs font-semibold text-gray-700 transition duration-300 transform">{{user.displayName}} </span>
        </NuxtLink>
        <NuxtLink class="card-title capitalize transition duration-300 transform hover:translate-x-1 hover:text-gray-500 limit-lines l-1 font-bold mb-2" style="letter-spacing: -1px;" :title="post.title" :to="'/'+ user.username + '/' + post.slug"><h3>{{post.title}}</h3></NuxtLink>
        <p :class="{'l-2': showAuthor, 'l-3': !showAuthor}" class="limit-lines" style="font-size: 15px">{{post.description}}</p>
      </div>
      <NuxtLink :title="post.title" class="w-48 h-32 shadow rounded-md overflow-hidden" :to="'/'+ user.username + '/' + post.slug">
        <div class="postImageAnimation w-full h-full bg-cover" style="background-image: url(https://www.incimages.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg)"></div>
      </NuxtLink>
    </div>
    <div class="flex mt-2">
      <ul class="flex space-x-2 items-center flex-1 pr-8">
        <li class="tag">tags</li>
        <li class="tag">are</li>
        <li class="tag">not</li>
        <li class="tag">ready</li>
        <li class="tag">yet</li>
      </ul>
      <div class="w-48 flex space-x-5 items-center text-sm text-gray-600 px-4">
        <div :class="{'text-red-700': hasAlreadyLiked}" class="flex justify-end flex-1 items-center space-x-1"><span v-html="likeLoading ? loadingElement : post.likes.length"></span><span @click="likePost()" :class="{'bg-red-50': hasAlreadyLiked}" class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-red-50 hover:text-red-700 el-icon-star-off"></span></div>
        <NuxtLink :to="'/'+ user.username + '/' + post.slug + '#comments'" class="pt-0.5 flex justify-end flex-1 items-center space-x-1 space-x-reverse flex-row-reverse"><span>12</span><span class="text-xl p-2 rounded-full cursor-pointer transition duration-300 hover:bg-blue-50 hover:text-blue-700 el-icon-chat-line-square"></span></NuxtLink>
      </div>
    </div>
  </div>

</template>


<script>
export default {
  data(){
    return {
      likeLoading: false,
      loadingElement: '<span class="el-icon-loading"></span>'
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
    }
  },
  props: {
    user: Object,
    post: Object,
    authUser: Object,
    showAuthor: {
      type: Boolean,
      default: false
    }
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
}

.author:hover {
  span {
    @apply translate-x-1
  }
}

</style>