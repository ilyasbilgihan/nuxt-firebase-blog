<template>
  <div>

    <div class="grid grid-cols-6 h-16 bg-blue-50 border border-b border-blue-100 items-center">

      <span class="ml-auto mr-8 font-semibold">LOGO</span> <!-- Dropdown logo end -->

      <ul class="flex space-x-4 col-span-4">
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
        <li v-if="user"><NuxtLink to="/secret/random-slug-here">Secret Page</NuxtLink></li>
      </ul>  <!-- Header menu end -->

      <div>

        <span v-if="!user" @click="login()" class="cursor-pointer">Login</span>

        <div v-else class="flex items-center w-10">
          <el-dropdown trigger="click" @command="handleDropdown">

            <span class="el-dropdown-link flex items-center rounded-full w-full cursor-pointer overflow-hidden">
              <img :src="user.photoURL || require('@/assets/images/avatar.png')" :alt="user.displayName">
            </span> <!-- Dropdown trigger end -->

            <el-dropdown-menu slot="dropdown" class="w-40">
              <el-dropdown-item command="profile" icon="el-icon-view">Public Profile</el-dropdown-item>
              <el-dropdown-item divided command="writePost" icon="el-icon-edit">Write Post</el-dropdown-item>
              <el-dropdown-item command="account" icon="el-icon-user">Account</el-dropdown-item>
              <el-dropdown-item divided command="logout"><span class="text-red-500">Logout</span></el-dropdown-item>
            </el-dropdown-menu> <!-- Dropdown menu end -->

          </el-dropdown>  <!-- Dropdown end -->
        </div>

      </div>  <!-- Header rigt end -->

    </div> <!-- Header end -->


    <div id="main" class="w-2/3 mx-auto my-16">

      <SelectUsername v-if="user && !(user.username)"/>
      <Nuxt v-else />

    </div>  <!-- Main(View) end -->


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
      watchAuthState: 'auth/watchAuthState',
    }),
    handleDropdown(command) {

      if( command == 'logout' )
        this.logout();
      if ( command == 'account')
        this.$router.push('/account')
      if ( command == 'writePost')
        this.$router.push('/write-post')
      if ( command == 'profile' && this.user.username)
        this.$router.push('/' + this.user.username)
    }
    
  },
  mounted() {
    this.watchAuthState();
  },
  computed:{
    user(){
      return this.$store.getters['user/getUser'];
    },
  },
}


</script>


<style>


pre.ql-syntax{ /* Atom one dark theme override */
  color:#abb2bf!important; 
  background:#282c34!important;
  overflow-x: auto!important;
}

.el-tabs__item.is-left {
  text-align: left!important;
  padding-right: 100px;
  padding-left: 0;
}

.el-tab-pane {
  padding-left: 50px;
}

label {
  padding: 0!important;
  @apply font-semibold
}
.el-form-item {
  margin-bottom: 11px!important;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  width: 120px;
  height: 120px;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.avatar {
  display: block;
}

</style>