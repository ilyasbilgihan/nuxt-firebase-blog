<template>

  <div>

    <h3 class="text-3xl font-semibold">{{post.title}}</h3>
    <hr class="my-6">
    <client-only>
      <quill-editor
        ref="editor"
      />
    </client-only>
	
  </div>

</template>

<script>

export default {
  head(){

  },
  updated(){
    this.$refs.editor.quill.setContents(this.post.content);
    this.$refs.editor.quill.enable(false);
  },
  async asyncData(context) { // fetch the user before mounted(before page loaded)

    const fetchUser = await context.store.dispatch('user/fetchUserId', context.route.params.username)

    if(fetchUser.exists){
      const user = (await context.store.dispatch('user/fetchUser', fetchUser.data().uid)).data();
      const post = await context.store.dispatch('post/fetchPost', {uid: user.uid, slug: context.route.params.postSlug});
      
      if(post.exists){

        return { user, post: post.data() }

      }else {
        context.redirect('/') // or redirect to 404 page
      }

    }else {
      context.redirect('/') // or redirect to 404 page
    }

    
  }

}

</script>


<style>

.ql-editor{
  color: #606266;
  line-height: 1.5;
  font-family: 'Quicksand', sans-serif!important;
  font-size: 16px;
  padding: 0;
}
</style>