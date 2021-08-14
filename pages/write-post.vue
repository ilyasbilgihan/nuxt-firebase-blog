<template>
  <div>
    <h1 class="text-2xl mb-4">Write Post</h1>

    <client-only>
      <editor ref="editor" />
    </client-only>

  </div>
</template>

<script>


export default {
  computed: {
    user(){
      return this.$store.getters['auth/getUser'];
    }
  },
  mounted(){
  }
}
</script>
