<template>
  <div>


    <h1 class="text-2xl">Public User Page - {{user.username}}</h1>
    <div>{{user.displayName}}</div>
    <div>{{user.email}}</div>
    <hr class="my-4">
    <ul>
      <li>Blog</li>
      <li>Query</li>
      <li>Here</li>
    </ul>
    <hr class="my-4">
    <!-- only visible for its owner -->
    <div v-if="authUser && (authUser.username == $route.params.username)">
      <client-only>
        <editor ref="editor" />
      </client-only>
    </div>
    <div @click="click">asd</div>
	
	
  </div>
</template>

<script>

export default {
  head(){
    return {
      title: `${this.user.displayName}'s profile`,
    }
  },
  methods:{
    click(){
      console.log(this.$refs.editor.invoke('getMarkdown'))
    }
  },
  computed: {
    authUser(){
      return this.$store.getters['auth/getUser'];
    }
  },
  
  async asyncData(context) { // fetch the user before mounted

    const fetchUser = await context.store.dispatch('auth/fetchUserId', context.route.params.username)
    if(fetchUser.exists){
      const user = (await context.store.dispatch('auth/fetchUser', fetchUser.data().uid)).data();
      return { user }
    }else {
      context.redirect('/') // or redirect to 404 page
    }
  }

}
</script>