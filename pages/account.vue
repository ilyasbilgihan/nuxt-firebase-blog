<template>
  <div v-if="user" class="md:w-10/12 xl:w-2/3 mx-auto xl:px-8">

    <div class="font-semibold relative space-x-20 xl:space-x-0 mb-8">
      <span class="text-4xl absolute top-1/2 xl:-left-4 transform -translate-y-1/2 xl:-translate-x-full p-4 rounded-full isax-user-edit text-gray-700 bg-gray-100"></span>
      <h1>Account Details</h1>
    </div>

    <el-tabs :tab-position="tabPosition">

      <el-tab-pane label="Profile">

        <h3>Public profile</h3>
        <hr class="mt-4 mb-8">

        <el-form :model="user" label-position="top" class="mt-4">
          <el-form-item label="Profile Picture">
            <div class="flex items-center">
              <el-tooltip class="item" effect="dark" content="Click to upload a new profile picture" placement="right">
                <el-upload
                  class="avatar-uploader "
                  action=""
                  :show-file-list="false"
                  :http-request="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload">
                  <img v-if="user.photoURL || ppURL" :src="ppURL || user.photoURL" class="avatar">
                  <i v-else class="isax-add avatar-uploader-icon"></i>
                </el-upload>
              </el-tooltip>

              <div v-if="user.photoURL || ppURL" @click="removePP()" class="select-none ml-10 flex justify-center items-center rounded-md text-red-600 cursor-pointer"><i class="mr-2 text-xl isax-trash"></i>Remove Image</div>
              <div v-else-if="unchangedPP" @click="restorePP()" class="select-none ml-10 flex items-center justify-center rounded-md text-reblued-600 cursor-pointer"><i class="mr-2 text-xl isax-undo"></i>Restore Current</div>
              
            </div>

          </el-form-item>
          <el-form-item 
            label="Display Name" 
            prop="displayName"
            :rules="[
              {required: true, message: 'Display name is required', trigger: 'blur'},
              {max: 25, message: 'You should follow the rules', trigger: 'blur' }
            ]"
          >
            <el-input 
              v-model="user.displayName"
              autocomplete="off"
              :maxlength="25"
              show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item label="Location">
            <el-input 
              v-model="user.location"
              autocomplete="off"
              :maxlength="25"
              show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item label="Profession">
            <el-input 
              v-model="user.profession"
              autocomplete="off"
              :maxlength="25"
              show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item label="Bio">
            <el-input type="textarea" 
            v-model="user.bio"
            autocomplete="off"
            :maxlength="150"
            :autosize="{ minRows: 3, maxRows: 6}"
            show-word-limit>
            </el-input>
          </el-form-item>
        </el-form>

        <div class="flex items-center mt-6 sm:mt-4">
          <el-button @click="updatePublicProfile()" class="w-full sm:w-auto" type="primary">Save changes</el-button>
          <Loading v-if="loadingUpdate" class="ml-4 text-sm text-gray-800"/>
        </div>
        
      </el-tab-pane> <!-- Public profile settings tab -->

      <el-tab-pane label="Account">

        <div class="space-y-16">

          <section>
            <h3>Change username ({{user.usernameChangeLimit}} left)</h3>
            <hr class="mt-4 mb-8">
            <p class="text-sm mb-4">After changing your username, your old username becomes available for anyone else to claim. Most references to your posts under the old username automatically change to the new username. However, some links to your profile won't automatically redirect.</p>
            <el-button :disabled="user.usernameChangeLimit == 0" @click="changeUsername()" type="primary">Change username</el-button>
          </section>

          <section>
            <h3>Export account data</h3>
            <hr class="mt-4 mb-8">
            <p class="text-sm mb-4">Export all your posts and profile metadata for <NuxtLink class="font-semibold" :to="user.username">@{{user.username}}</NuxtLink>. Exports will be available for 7 days.</p>
            <el-button @click="exportData()" type="primary">Export Data</el-button>
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
          :width="deleteModalWidth"
          center
          >
          <div style="text-align: center">Are you sure you want to delete your account?</div>
          <span slot="footer" class="space-y-2 dialog-footer">
            <el-button @click="deleteAccountDialog = false">Cancel</el-button>
            <el-button type="primary" style="margin-left:0" @click="deleteConfirmed()">I am sure!</el-button>
          </span>
        </el-dialog>
      
      </el-tab-pane>

    </el-tabs>
    
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
      ppFile: null,
      ppURL: null,
      unchangedPP: null,
      loadingUpdate: false,
      limitSmall: 25,
      limitBio: 150,
      tabPosition: null,
      deleteModalWidth: '40%'
    }
  },
  methods: {
    changeUsername(){
      if(this.user.usernameChangeLimit != 0){
        this.$store.commit('user/setBackupUsername', this.user.username)
        this.$store.commit('user/updateUsername', null)
      }
    },
    deleteConfirmed(){
      this.deleteAccountDialog = false
      alert('Deleting account is not allowed. Please contact "ilyasbilgihan@gmail.com"')
    },
    exportData(){
      alert('export data')
    },
    async updatePublicProfile(){
      
      if(!this.loadingUpdate){
        this.loadingUpdate = true;

        if(this.user.displayName){

          if(this.user.displayName.length <= this.limitSmall && this.user.bio.length <= this.limitBio && this.user.profession.length <= this.limitSmall && this.user.location.length <= this.limitSmall){
            
            await this.$store.dispatch('user/updateUser', {updatedUser: JSON.parse(JSON.stringify(this.user)), ppFile: this.ppFile, unchangedPP: this.unchangedPP});
            this.$message.success('Profile updated successfully.');
            this.$router.go();

          }else {
            this.$message.error('You can\'t break the rules.');
          }
        }else {
          this.$message.error('You should type something in display name field.');
        }

        this.loadingUpdate= false;
      }else {
        this.$message.warning('Slow Down !!!');
      }
    },
    handleAvatarSuccess(res) {
      const img = new Image();
      img.src = URL.createObjectURL(res.file);
      const _this = this;
      img.onload = function(){
        if(this.width != 460 && this.height != 460){
          _this.$message.error('Avatar picture resolution must be 460x460')
        }else {
          _this.ppURL = this.src
          _this.ppFile = res.file;
        }
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = (file.type === 'image/jpeg') || (file.type === 'image/png');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('Avatar picture must be JPG or PNG format!');
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
  mounted(){
    this.user = JSON.parse(JSON.stringify((this.$store.getters['user/getUser'])))
    this.unchangedPP = this.user && this.user.photoURL

    this.tabPosition = window.innerWidth > 1024 ? "left" : "top"
    this.deleteModalWidth = window.innerWidth > 1024 ? "40%" : "80%"
    window.addEventListener('resize', () => {
      this.tabPosition = window.innerWidth > 1024 ? "left" : "top"
      this.deleteModalWidth = window.innerWidth > 1024 ? "40%" : "80%"
    })
  }
}
</script>


<style lang="scss" scoped>

h3 {
  @apply font-semibold mb-2
}

</style>