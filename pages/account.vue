<template>
  <div v-if="user">
    
    <div>

      <h2 class="text-4xl font-semibold mb-8">Settings</h2>
      <el-tabs tab-position="left" class="pr-8">

        <el-tab-pane label="Profile">

          <h3>Public profile</h3>
          <hr class="mt-4 mb-8">

          <div class="flex items-center">
            <el-tooltip class="item" effect="dark" content="Click to upload a new profile picture" placement="right">
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
            
            <div v-if="user.photoURL || ppURL" @click="removePP" class="select-none ml-6 flex justify-center items-center rounded-md text-red-600 cursor-pointer"><i class="mr-2 text-xl el-icon-delete"></i>Remove Image</div>
            <div v-else-if="unchangedPP" @click="restorePP" class="select-none ml-6 flex items-center justify-center rounded-md text-reblued-600 cursor-pointer"><i class="mr-2 text-xl el-icon-refresh-left"></i>Restore Current</div>
          
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
            <el-button @click="updatePublicProfile" type="primary">Save changes</el-button>
            <span class="ml-4 text-sm text-gray-800" v-html="result"></span>
          </div>
          
        </el-tab-pane> <!-- Public profile settings tab -->

        <el-tab-pane label="Account">

          <div class="space-y-16">

            <section>
              <h3>Change username ({{user.usernameChangeLimit}} left)</h3>
              <hr class="mt-4 mb-8">
              <p class="text-sm mb-4">After changing your username, your old username becomes available for anyone else to claim. Most references to your posts under the old username automatically change to the new username. However, some links to your profile won't automatically redirect.</p>
              <el-button :disabled="user.usernameChangeLimit == 0" @click="changeUsername" type="primary">Change username</el-button>
            </section>

            <section>
              <h3>Export account data</h3>
              <hr class="mt-4 mb-8">
              <p class="text-sm mb-4">Export all your posts and profile metadata for <NuxtLink class="font-semibold" :to="user.username">@{{user.username}}</NuxtLink>. Exports will be available for 7 days.</p>
              <el-button @click="exportData" type="primary">Export Data</el-button>
            </section>

          </div>  
        
        </el-tab-pane> <!-- Account settings tab -->

        <el-tab-pane label="Notifications" disabled>Notification settings here</el-tab-pane> <!-- Notifications settings tab -->

        <el-tab-pane label="Delete Account">

          <h3 class="text-red-600">Delete account</h3>
          <hr class="mt-4 mb-8">

          <p class="text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <el-button @click="deleteAccountDialog = true" type="danger" plain>Delete Account</el-button>

          <el-dialog
            title="Warning"
            :visible.sync="deleteAccountDialog"
            width="30%"
            center
            >
            <span>Are you sure you want to delete your account?</span>
            <span slot="footer" class="dialog-footer">
              <el-button @click="deleteAccountDialog = false">Cancel</el-button>
              <el-button type="primary" @click="deleteConfirmed">I am sure!</el-button>
            </span>
          </el-dialog>
        
        </el-tab-pane>

      </el-tabs>

    </div>
    
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
      user: null,
      deleteAccountDialog: false,
      result: '',
      ppFile: null,
      ppURL: null,
      unchangedPP: null
    }
  },
  methods: {
    changeUsername(){
      if(this.user.usernameChangeLimit != 0){
        this.$store.commit('user/updateUsername', null)
      }
    },
    deleteConfirmed(){
      this.deleteAccountDialog = false
      alert('delete confirmed')
    },
    exportData(){
      alert('export data')
    },
    async updatePublicProfile(){
      this.result = '<span class="el-icon-loading"></span>'
      if(!this.user.photoURL){
        this.unchangedPP = null
      }
      await this.$store.dispatch('user/updateUser', {updatedUser: JSON.parse(JSON.stringify(this.user)), ppFile: this.ppFile});
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
      this.user.photoURL = null
      this.ppURL = null
      this.ppFile = null
    },
    restorePP(){
      this.user.photoURL = this.unchangedPP
      this.ppURL = null
      this.ppFile = null
    }
  },
  computed: {
  },
  mounted(){
    this.user = JSON.parse(JSON.stringify((this.$store.getters['user/getUser'])))
    this.unchangedPP = this.user.photoURL
  }
}
</script>

<style lang="scss" scoped>


h3 {
  @apply text-2xl font-semibold mb-2
}

</style>