<template>
  <div>
    
    <div v-if="user">
      <!-- <div>Go to your public profile page -> <b><NuxtLink :to="user.username">{{user.username}}</NuxtLink></b></div> -->
      <!-- <hr class="my-4"> -->
      <h3 class="text-3xl mb-4">Account Settings</h3>
      <ul class="space-y-1">
        <li><a href="">Change profile picture.</a></li>
        <li><a href="">Change fullname.</a></li>
        <li v-if="user.usernameChangeLimit != 0"><a class="cursor-pointer" @click.prevent="changeUsername">Change username ({{user.usernameChangeLimit}} left)</a></li>
      </ul>
	  <hr class="my-8" />
	  <NuxtLink :to="user.username"><b>View Public Profile</b> for user "{{user.username}}"</NuxtLink>

    </div>

    
  </div>
</template>

<script>

export default {
  head(){
    return {
      title: `Account Details`
    }
  },
  data(){
    return {
    }
  },
  methods: {
    changeUsername(){
      this.$store.commit('auth/updateUsername', null)
    }
  },
  computed: {
    user(){
      return this.$store.getters['auth/getUser'];
    }
  },
}
</script>
