<template>
    <div v-if="user">
      <h1 class="text-2xl">Account Page</h1>
	  <div>{{user.username}}</div>
    </div>
</template>

<script>


export default {
  mounted(){
  },
  computed:{
    user(){
	  return this.$store.getters['auth/getUser'];
	}
  }
}
</script>
