<template>
    <div class="spin isax-notification-circle text-xm"></div>
</template>

<script>

export default {
  name: 'Loading',
}
</script>

<style scoped>

.spin {
  animation: loading 0.5s infinite linear;
}

@keyframes loading {
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(360deg)
  }
}

</style>