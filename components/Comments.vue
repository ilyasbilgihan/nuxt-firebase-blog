<template>

  <div>
    <div v-if="comments && comments.length > 0">
      <div class="" v-for="comment in comments" :key="comment.commentId">
        <CommentInside :comment="comment" :postOwnerId="postOwnerId" />
      </div>
    </div>
    <el-empty v-else-if="showEmpty" description="No comment found, be the first!" :image-size="100"></el-empty>
  </div>

</template>

<script>

export default({
  data(){
    return {
      comments: null,
    }
  },
  props: {
    parent: String,
    postOwnerId: String,
    showEmpty: {
      type: Boolean,
      default: false,
    }
  },
  async fetch(){
    
    const comments = await this.$store.dispatch('post/fetchComments', {postOwnerId: this.postOwnerId, slug: this.$route.params.postSlug, parent: this.parent})
    this.comments = comments;

  }
})
</script>
