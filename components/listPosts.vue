<template>
  <el-timeline>

    <el-timeline-item v-for="post in posts" :key="post.slug" :timestamp="getDate(post)" placement="top">
      
      <PostCard :user="users[post.uid]" :post="post" :show-author="showAuthor"></PostCard>
        
    </el-timeline-item>
    <div v-if="posts.length != 0" class="flex flex-col items-center select-none font-semibold">
      <div v-if="moreLoading" class="h-24 w-full flex items-center justify-center"><i class="el-icon-loading"></i></div>
      <el-button v-if="!endOfThePosts" @click="fetchMore()" type="info" size="medium" round plain>See More</el-button>
      <div v-else class="text-gray-400">You have reached the end!</div>
    </div>

  </el-timeline>
</template>


<script>


export default {
  data(){
    return {
      timeOptions: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      endOfThePosts: false,
      moreLoading: false,
      users: this.usersP,
      posts: this.postsP
    }
  },
  methods:{
    getLocale(time){
      return new Date(time.seconds * 1000).toLocaleDateString('en-US', this.timeOptions);
    },
    getDate(post){
      const createdAt = this.getLocale(post.createdAt);
      const updatedAt = this.getLocale(post.updatedAt);
      let string = `Published at: ${createdAt}`
      if(post.createdAt.seconds != post.updatedAt.seconds){
        string = `Last update: ${updatedAt}`
      }
      return string
    },
    async fetchMore(){
      if(!this.moreLoading){
        this.moreLoading = true;

        const last = this.posts[this.posts.length-1].createdAt
        const { posts: newPosts, users: newUsers } = await this.$store.dispatch(this.moreDispatchPath, { last: last, limit: this.limit, cacheUsers: Object.keys(this.users), followedList: this.followedList, tag: this.tag, uid: this.uid });
        
        this.users = Object.assign(this.users, newUsers)
        this.posts = this.posts.concat(newPosts);
        if(newPosts.length < this.limit){
          this.endOfThePosts = true;
        }

        this.moreLoading = false;

      }else {
        this.$message.warning('Slow Down !!!');
      }
    }
  },
  props: {
    postsP: Array,
    usersP: Object,
    showAuthor: {
      type: Boolean,
      default: true,
    },
    moreDispatchPath: String,
    followedList: Array,
    tag: String,
    limit: Number,
    uid: String,
  }
}
</script>
