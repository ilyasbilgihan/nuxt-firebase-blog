<template>
  <el-timeline>

    <el-timeline-item v-for="post in posts" :key="post.slug" :timestamp="getDate(post)" placement="top">
      
      <PostCard :user="users[post.uid]" :post="post" :show-author="showAuthor"></PostCard>
        
    </el-timeline-item>

  </el-timeline>
</template>


<script>

export default {
  data(){
    return {
      timeOptions: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
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
    }
  },
  props: {
    posts: Array,
    users: Object,
    showAuthor: {
      type: Boolean,
      default: true,
    }
  }
}
</script>
