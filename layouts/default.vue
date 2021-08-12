<template>
  <div>
    <div class="flex h-16 bg-blue-50 border border-b border-blue-100 items-center px-32">
      <span class="mr-16 font-semibold">LOGO</span>
      <ul class="flex space-x-4 flex-1">
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
        <li><NuxtLink to="/random-page">Random Page</NuxtLink></li>
      </ul>
      <div>
        <span v-if="!user" class="cursor-pointer">Login</span>
        <div v-else class="flex items-center space-x-4">
          <NuxtLink class="rounded-full w-10 overflow-hidden" to="/account">
            <img src="@/assets/images/avatar.png" alt="Username here">
          </NuxtLink>
          <span class="text-red-500 cursor-pointer">Logout</span>
        </div>
      </div>
    </div>
    <div class="p-8">

      <Nuxt />

    </div>
  </div>
</template>

<script>


export default {
  data(){
    return {
	  user: true,
    }
  }
}
</script>

<style>

</style>