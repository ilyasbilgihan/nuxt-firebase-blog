<template>
  <div>

    <div class="px-8 sm:px-16 h-16 shadow-md bg-white bg-opacity-75 backdrop-blur backdrop-filter z-10 sticky top-0">

      <div class="h-full md:w-10/12 xl:w-2/3 mx-auto flex justify-between sm:justify-legacy items-center xl:px-8">

        <span class="font-semibold">LOGO</span> <!-- Logo end -->

        <ul class="hidden sm:flex space-x-4 flex-1 px-8">
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li v-if="user"><NuxtLink to="/feed">My Feed</NuxtLink></li>
        </ul>  <!-- Header menu end -->

        <div class="hidden sm:block">

          <span v-if="!user" @click="login()" class="cursor-pointer">Login</span>

          <div v-else class="flex items-center w-10">
            <el-dropdown trigger="click" @command="handleDropdown">

              <span class="el-dropdown-link flex items-center rounded-full w-full cursor-pointer overflow-hidden shadow">
                <img :src="user.photoURL || require('/assets/images/avatar.png')" :alt="user.displayName">
              </span> <!-- Dropdown trigger end -->

              <el-dropdown-menu slot="dropdown" class="w-40">
                <el-dropdown-item command="profile"><div class="dd-item"><span class="isax-profile-circle"></span><span>Public Profile</span></div></el-dropdown-item>
                <el-dropdown-item divided command="writePost"><div class="dd-item"><span class="isax-edit-2"></span><span>Write A Post</span></div></el-dropdown-item>
                <el-dropdown-item command="bookmarks"><div class="dd-item"><span class="isax-save-2"></span><span>Bookmarks</span></div></el-dropdown-item>
                <el-dropdown-item command="account"><div class="dd-item"><span class="isax-user-edit"></span><span>Account</span></div></el-dropdown-item>
                <el-dropdown-item divided command="logout"><div class="dd-item text-red-600"><span class="isax-logout"></span><span>Logout</span></div></el-dropdown-item>
              </el-dropdown-menu> <!-- Dropdown menu end -->

            </el-dropdown>  <!-- Dropdown end -->
          </div>

        </div>  <!-- Header rigt end -->

        <div class="flex sm:hidden hamburger p-5 cursor-pointer -mr-5" @click="hamburgerDrawer = true">
          <span class="isax-menu-1 text-2xl"></span>
        </div>
      </div>

    </div> <!-- Header end -->


    <div id="main" class="p-8 sm:p-16">

      <SelectUsername v-if="user && !(user.username)"/>
      <Nuxt v-else />

    </div>  <!-- Main(View) end -->

    <el-drawer
      title="Navigation"
      :visible.sync="hamburgerDrawer"
      direction="rtl"
      size="72%">

      <div class="mb-8">

        <span v-if="!user" @click="login()" class="cursor-pointer ml-8">Login</span>
        <NuxtLink v-else :to="'/' + this.user.username" class="px-8 py-4 flex space-x-2 items-center">
          <span class="flex h-10 items-center rounded-full w-10 cursor-pointer overflow-hidden shadow">
            <img :src="user.photoURL || require('/assets/images/avatar.png')" :alt="user.displayName">
          </span>
          <span class="font-semibold">{{user.displayName}}</span>
        </NuxtLink>
        <ul class="flex-row space-y-2 px-8">
          <hr class="my-4">
          <li><NuxtLink to="/" class="menu-item"><span class="isax-home"></span><span>Home</span></NuxtLink></li>
          <li v-if="user"><NuxtLink to="/feed" class="menu-item"><span class="isax-people"></span><span>My Feed</span></NuxtLink></li>
          <li v-if="user"><NuxtLink to="/write-post" class="menu-item"><span class="isax-edit-2"></span><span>Write Post</span></NuxtLink></li>
          <li v-if="user"><NuxtLink to="/bookmarks" class="menu-item"><span class="isax-save-2"></span><span>Bookmarks</span></NuxtLink></li>
          <li v-if="user"><NuxtLink to="/account" class="menu-item"><span class="isax-user-edit"></span><span>Account</span></NuxtLink></li>
          <br>
          <li v-if="user"><a @click="logout()" class="menu-item text-red-600"><span class="isax-logout"></span><span>Logout</span></a></li>
        </ul>  <!-- Header menu end -->  
        
      </div>
      

    </el-drawer>  <!-- Comment Edit History end -->

  </div>
</template>

<script>

import { mapActions } from 'vuex'

export default {
  head(){
    return {
      meta: [
        { hid: 'og:url', name: 'og:url', content: this.$route.path },
        { hid: 'twitter:url', name: 'twitter:url', content: this.$route.path }
      ]
    }
  },
  data(){
    return {
      hamburgerDrawer: false
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
      if ( command == 'bookmarks')
        this.$router.push('/bookmarks')
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


<style lang="scss">

.limit-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;  
  box-orient: vertical;
  overflow: hidden;
  &.l-1{
    -webkit-line-clamp: 1;
  }
  &.l-2{
    -webkit-line-clamp: 2;
  }
  &.l-3{
    -webkit-line-clamp: 3;
  }
  &.l-4{
    -webkit-line-clamp: 4;
  }
  &.l-5{
    -webkit-line-clamp: 5;
  }
}

body.el-popup-parent--hidden {
  padding: 0 !important;
  overflow: initial !important;
}

#el-drawer__title {
  span{
    @apply font-semibold text-gray-800 text-xl pt-4;
  }
}
.menu-item {
  @apply flex items-center space-x-2
}


.el-loading-mask {
  background-color: #fdfdfd!important;
  .el-loading-spinner {
    display: flex;
    justify-content: center;
  }
}

.ql-editor {
  color: #303133;
  line-height: 1.5;
  font-family: 'Quicksand', sans-serif!important;
}

pre.ql-syntax{ /* Atom one dark theme override */
  color:#abb2bf!important; 
  background:#282c34!important;
  overflow-x: auto!important;
}

h1{
  font-size: 2.375rem!important;
  line-height: 3rem!important;
}
h2{
  font-size: 1.875rem!important;
  line-height: 2.4375rem!important;
}
h3{
  font-size: 1.5rem!important;
  line-height: 2.025rem!important;
}
h4 {
  font-size: 1.25rem!important;
  line-height: 1.75rem!important;
}
h5 {
  font-size: 1.125rem!important;
  line-height: 1.63125rem!important;
}
h6 {
  font-size: 1rem!important;
  line-height: 1.5rem!important;
}

.el-tabs__item.is-left {
  text-align: left!important;
  padding-right: 100px;
  padding-left: 0;
}

.el-tabs--left .el-tab-pane {
  padding-left: 50px;
}

.el-tabs--top .el-tabs__header {
  margin-bottom: 45px;
}

.is-top {
  .el-tabs__nav-prev {
    padding-right: 12px;
    font-size: 16px
  }
  .el-tabs__nav-next {
    padding-left: 12px;
    font-size: 16px
  }
  .el-tabs__nav-scroll {
    margin: 0 8px
  }
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
  width: 96px;
  height: 96px;
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

.el-timeline-item{
  &.updated{
    .el-timeline-item__timestamp{
      &:before{
        
        content: "\e994";
      }
    }
  }
  .el-timeline-item__timestamp{
    font-size: 14px!important;
    display: flex;
    align-items: center;

    &:before{
      font-family: 'iconsax';
      content: "\e991";
      line-height: 1!important;
      @apply text-lg mr-1;
    }
  }

}


.postImageAnimation {
  transition: 500ms background-position;
  will-change: background-position;
  background-size: cover;
  background-position: center;
  &:hover {
    background-position: bottom right!important;
  }
}

.tag {
  @apply shadow transition duration-300 rounded-2xl bg-gray-100 px-4 py-1 cursor-pointer hover:bg-gray-200
}

.post-image-uploader {
  @apply h-80 w-full rounded-lg transition duration-300 relative;

  .el-upload{
    display: block!important;
  }
  &:hover {
    .post-image-uploader-icon {
      color: #409EFF;
      border-color: #409EFF;
    }
  }
  .post-image-uploader-icon {
    @apply absolute text-4xl text-gray-500 inset-0 flex items-center justify-center transition duration-300 border-2 border-dashed rounded-lg;
  }
}

.input-tag-wrapper {
  display: flex!important;
  flex-wrap: wrap;
  align-items: center;
  padding: 2px 8px!important;
  &:hover {
    border-color: #c0c4cc!important;
  }
  &:focus-within {
    border-color: #409eff!important;
  }
  .tag-input {
    flex: 1;
    padding-left: 15px!important;
  }
  span {
    user-select: none;
    line-height: 28px;
    padding: 0 10px 0 16px!important;
    font-size: 14px;
    border: none!important;
    color: #303133!important;
    margin-right: 8px!important;
    @apply shadow transition cursor-default duration-300 rounded-2xl bg-gray-100 hover:bg-gray-200;
    i {
      top: inherit!important;
      vertical-align: inherit!important;
      transform: scale(1)!important;
    }
  }
}
</style>