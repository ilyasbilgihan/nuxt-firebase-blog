<template>
  <div v-if="user">
    
    <!-- <div>Go to your public profile page -> <b><NuxtLink :to="user.username">{{user.username}}</NuxtLink></b></div> -->
    <!-- <hr class="my-4"> -->
    <div>
      <h2 class="text-4xl font-semibold mb-8">Settings</h2>
      <el-tabs tab-position="left" class="pr-8">
        <el-tab-pane label="Profile">

          <h3>Public profile</h3>
          <hr class="mt-4 mb-8">

          <div class="flex items-center">
            <el-tooltip class="item" effect="dark" content="Click to upload image" placement="right">
              <el-upload
                class="avatar-uploader flex rounded-full"
                action=""
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload">
                <img v-if="user.photoURL || ppURL" :src="ppURL || user.photoURL" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-tooltip>
            
            <div v-if="user.photoURL || ppURL" @click="removePP" class="ml-6 flex justify-center rounded-md text-red-600 cursor-pointer">Remove Image</div>
          </div>
          
          <el-form label-position="top" class="mt-4">
            <el-form-item label="Display Name">
              <el-input v-model="user.displayName"></el-input>
            </el-form-item>
            <el-form-item label="Location">
              <el-input v-model="user.location"></el-input>
            </el-form-item>
            <el-form-item label="Profession">
              <el-input v-model="user.profession"></el-input>
            </el-form-item>
            <el-form-item label="Bio">
              <el-input type="textarea" v-model="user.bio"></el-input>
            </el-form-item>
          </el-form>
          <div class="flex items-center mt-4">
            <div @click="updatePublicProfile" class="inline-block hover:bg-blue-800 w-40 py-2 flex justify-center bg-blue-900 text-white rounded-md cursor-pointer">Save changes</div>
            <span class="ml-4" v-html="result"></span>
          </div>
          
        </el-tab-pane>
        <el-tab-pane label="Account">

          <div class="space-y-16">

            <section>
              <h3>Change username ({{user.usernameChangeLimit}} left)</h3>
              <hr class="mt-4 mb-8">
              <p class="text-sm">After changing your username, your old username becomes available for anyone else to claim. Most references to your posts under the old username automatically change to the new username. However, some links to your profile won't automatically redirect.</p>
              <button :disabled="user.usernameChangeLimit == 0" @click="changeUsername" class="disabled:opacity-50 disabled:cursor-not-allowed disabled:cursor-not-allowed mt-4 hover:bg-blue-800 w-40 py-2 flex justify-center bg-blue-900 text-white rounded-md cursor-pointer">Change username</button>
            </section>

            <section>
              <h3>Export account data</h3>
              <hr class="mt-4 mb-8">
              <p class="text-sm">Export all your posts and profile metadata for <NuxtLink class="font-semibold" :to="user.username">@{{user.username}}</NuxtLink>. Exports will be available for 7 days.</p>
              <div @click="exportData" class="mt-4 hover:bg-blue-800 w-40 py-2 flex justify-center bg-blue-900 text-white rounded-md cursor-pointer">Export data</div>
            </section>

          </div>  
        
        </el-tab-pane>
        <el-tab-pane label="Notification" disabled>Notification settings here</el-tab-pane>
        <el-tab-pane label="Delete Account">
          <h3 class="text-red-600">Delete account</h3>
          <hr class="mt-4 mb-8">
          <p class="text-sm">Once you delete your account, there is no going back. Please be certain.</p>
          <div @click="centerDialogVisible = true" class="transition-colors duration-400 mt-4 hover:bg-red-600 hover:text-white px-8 py-2 flex justify-center bg-gray-200 font-semibold text-red-600 rounded-md cursor-pointer">Delete account</div>
          
          <el-dialog
            title="Warning"
            :visible.sync="centerDialogVisible"
            width="30%"
            center
            >
            <span>Are you sure you want to do this?</span>
            <span slot="footer" class="dialog-footer">
              <el-button @click="centerDialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="deleteConfirmed">Confirm</el-button>
            </span>
          </el-dialog>
        
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- <ul class="space-y-1">
      <li><a href="">Change profile picture.</a></li>
      <li><a href="">Change fullname.</a></li>
      <li v-if="user.usernameChangeLimit != 0"><a class="cursor-pointer" @click.prevent="changeUsername">Change username ({{user.usernameChangeLimit}} left)</a></li>
    </ul> -->
    <!-- <NuxtLink :to="user.username"><b>View Public Profile</b> for user "{{user.username}}"</NuxtLink> -->



    
  </div>
</template>

<script>

export default {
  head(){
    return {
      title: `Account Settings`,
    }
  },
  data(){
    return {
      user: JSON.parse(JSON.stringify((this.$store.getters['auth/getUser']))),
      centerDialogVisible: false,
      result: '',
      ppFile: null,
      ppURL: null
    }
  },
  methods: {
    changeUsername(){
      if(this.user.usernameChangeLimit != 0){
        this.$store.commit('auth/updateUsername', null)
      }
    },
    deleteConfirmed(){
      this.centerDialogVisible = false
      alert('delete confirmed')
    },
    exportData(){
      alert('export data')
    },
    async updatePublicProfile(){
      this.result = '<span class="el-icon-loading"></span>'
      await this.$store.dispatch('auth/updateUser', {updatedUser: JSON.parse(JSON.stringify(this.user)), ppFile: this.ppFile});
      this.result = 'Saved'
      setTimeout(() => {
        this.result = ''
      }, 2000);
    },
    handleAvatarSuccess(res, file) {
      const img = new Image();
      img.src = URL.createObjectURL(file.raw);
      const _this = this;
      img.onload = function(){
        if(this.width != 460 && this.width != 460){
          _this.$message.error('Avatar picture resolution must be 460x460')
        }else {
          _this.ppURL = this.src
          _this.ppFile = file.raw;
        }
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('Avatar picture must be JPG format!');
      }
      else if (!isLt2M) {
        this.$message.error('Avatar picture size can not exceed 2MB!');
      }
      return isJPG && isLt2M;
    },
    removePP(){
      this.user.photoURL = ''
      this.ppURL = null
      this.ppFile = null
    }
  },
  computed: {
  },
}
</script>

<style lang="scss">

.el-tabs__item.is-left {
  text-align: left!important;
  padding-right: 100px;
  padding-left: 0;
}

.el-tab-pane {
  padding-left: 50px;
}

h3 {
  @apply text-2xl font-semibold mb-2
}

label {
  padding: 0!important;
}
.el-form-item {
  margin-bottom: 0!important;
}



.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  display: block;
  width: 120px;
  height: 120px;
}

</style>