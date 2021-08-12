<template>
  <div>
    <div class="flex h-16 bg-blue-50 border border-b border-blue-100 items-center px-32">
      <span class="mr-16 font-semibold">LOGO</span>
      <ul class="flex space-x-4 flex-1">
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
        <li v-if="user"><NuxtLink to="/secret/random-slug-here">Secret Page</NuxtLink></li>
      </ul>
      <div>
        <span v-if="!user" @click="login()" class="cursor-pointer">Login</span>
        <div v-else class="flex items-center space-x-4">
          <NuxtLink class="rounded-full w-10 overflow-hidden" to="/account">
            <img :src="user.photoURL" :alt="user.displayName">
          </NuxtLink>
          <span @click="logout()" class="text-red-500 cursor-pointer">Logout</span>
        </div>
      </div>
    </div>
    <div class="p-8">

      <SelectUsername v-if="user && !(user.username)"/>
      <Nuxt v-else />

    </div>
  </div>
</template>

<script>

import { mapActions } from 'vuex'

export default {
  data(){
    return {
    }
  },
  methods: {
    ...mapActions({
      login: 'auth/login',
      logout: 'auth/logout',
      watchAuthState: 'auth/onStateChanged',
    }),
    
  },
  mounted() {
    this.watchAuthState();
  },
  computed:{
    user(){
      return this.$store.getters['auth/getUser'];
    }
  },
}
</script>

<style>

</style>