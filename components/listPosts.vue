<template>
  <el-timeline>

    <el-timeline-item v-for="post in posts" :key="post.slug" :timestamp="getDate(post)" placement="top">
      
      <PostCard :user="users[post.uid]" :post="post" :showAuthor="showAuthor"></PostCard>
        
    </el-timeline-item>
    <div v-if="posts.length != 0" class="flex flex-col items-center select-none font-semibold text-gray-400">
      <div v-if="moreLoading" class="h-24 w-full flex items-center justify-center"><i class="text-2xl el-icon-loading"></i></div>
      <el-button v-if="!endOfThePosts && posts.length >= limit" @click="fetchMore()" type="info" size="medium" round plain>See More</el-button>
      <div v-else-if="posts.length >= limit" class="text-lg">You have reached the end!</div>
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
      return new Date(time).toLocaleDateString('en-US', this.timeOptions);
    },
    getDate(post){
      const createdAt = this.getLocale(post.createdAt);
      const updatedAt = this.getLocale(post.updatedAt);
      let string = `Published at: ${createdAt}`
      if(post.createdAt != post.updatedAt){
        string = `Last update: ${updatedAt}`
      }
      return string
    },
    async fetchMore(){
      if(!this.moreLoading){
        this.moreLoading = true;

        let last;
        if(this.uid){
          // In user profile page, we order the posts by their updateAt fields.
          last = this.posts[this.posts.length-1].updatedAt

        }else if(this.bookmarks){
          // In bookmarks page, we do not order posts, they are already sorted by the date their added (bookmarks.vue:38)
          last = this.posts.length;

        }else {
          // In other pages, we order the posts by their createdAt fields.
          last = this.posts[this.posts.length-1].createdAt
        }
        
        const moreData = {
          last: last,
          limit: this.limit,
          cacheUsers: Object.keys(this.users),
          followedList: this.followedList,
          tag: this.tag,
          uid: this.uid,
          bookmarks: this.bookmarks,
        }
        const { posts: newPosts, users: newUsers } = await this.$store.dispatch(this.moreDispatchPath, moreData);
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
    bookmarks: Array,
  }
}
</script>
