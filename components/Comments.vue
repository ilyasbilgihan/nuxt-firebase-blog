<template>

  <div class="comment">
    <div class="" v-for="comment in comments" :key="comment.commentId">
      <CommentInside :comment="comment" :postOwnerId="postOwnerId" :post="post" />
    </div>
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
    post: Object,
  },
  async fetch(){
    
    const comments = await this.$store.dispatch('post/fetchComments', {postOwnerId: this.postOwnerId, slug: this.$route.params.postSlug, parent: this.parent})
    this.comments = comments;

  }
})
</script>
