<template>
  <div class="flex justify-center flex-col items-center">

    <h3 class="mt-16 mb-4">Please define a username.</h3>

    <form @submit.prevent="submitChanging()" class="flex flex-col space-y-3 w-64 items-center">
      
      <div :class="info[1]" class="custom-input relative w-full">
        <input v-model="chosenName" class="border-current outline-none bg-transparent relative border rounded-lg py-2 px-4 w-full" type="text" required :pattern="pattern">
        <span :class="{'move-top': chosenName}" class="left-0 top-0 px-2 m-2 select-none">Username</span>
        <!-- label end -->
        <div class="error text-xs bg-white px-2 mr-2 -mt-3 select-none">{{ info[0] }}</div>
        <!-- info message end -->
      </div>
      <!-- Input end -->
      
      <div class="w-full flex h-9 space-x-4 justify-center">
        <div v-if="backupUsername != null" @click="cancelChanging" class="text-red-500 rounded-md font-semibold w-1/3 flex justify-center items-center hover:bg-red-50 cursor-pointer">Cancel</div>
        <button :disabled="!available || loading || submitLoading" type="submit" class="bg-blue-500 hover:bg-blue-400 text-white rounded-md w-1/3">Apply</button>
      </div>
      <!-- Cancel, apply buttons end -->

    </form>
    <div v-if="submitLoading" class="flex flex-col items-center space-y-1"> 
      <Loading class="mt-4 text-xl"/>
      <span>Please wait</span>
    </div>
	
  </div>
</template>

<script>

import { mapActions } from 'vuex';

export default {
  data(){
    return {
      chosenName: null,
      pattern: '^[a-z0-9]([_-](?![_-])|[a-z0-9]){4,14}[a-z0-9]$',
      regExp: new RegExp(/^[a-z0-9]([_-](?![_-])|[a-z0-9]){4,14}[a-z0-9]$/),
      timeout: null,
      available: false,
      valid: false,
      loading: false,
      submitLoading: false,
    }
  },
  watch: {
    chosenName(){
      this.onChange();
    }
  },
  computed: {
    info(){
      return this.loading 
        ? ['Checking...', 'text-yellow-500']
        : (this.valid)
          ? (this.available)
            ? ['Available', 'text-green-500']
            : ['Taken', 'text-red-500']
          : (this.chosenName)
            ? ['Invalid username!', 'text-red-500']
            : ['', 'text-gray-600']
    },
    user(){
      return this.$store.getters['user/getUser'];
    },
    backupUsername(){
      return this.$store.getters['user/getBackupUsername'];;
    }
  },
  methods:{
    ...mapActions({
      changeUsername: 'user/changeUsername',
      checkUsername: 'user/checkUsername'
    }),
    async submitChanging(){

      if(this.valid && this.available && !this.loading){

        this.submitLoading = true;
        await this.changeUsername(this.chosenName);
        this.submitLoading = false;

      }
      
    },
    cancelChanging(){
      this.$store.commit('user/updateUsername', this.backupUsername)
    },
    onChange() {

      if (this.timeout){
        clearTimeout(this.timeout); 
      }

      if(this.regExp.test(this.chosenName)){

        this.valid = true   // username pass the test, its valid
        this.loading = true // activate loading status

        this.timeout = setTimeout(() => {

          this.checkUsername(this.chosenName).then(res => {
            this.available = res
            this.loading = false
          });

        }, 400); // checking delay
        
      }else {
        this.available = false
        this.loading = false
        this.valid = false
      }
      
    },
  }
}
</script>


<style scoped lang="scss">

.custom-input{

  input {
    transition: .4s border-color;
    
    &:focus + span, & + .move-top{
      transform: translateY(calc(-50% - 0.5rem)) scale(.75);
      z-index: 0;
      background-color: white;
    }
    & + span {
      position: absolute;
      transform-origin: center left;
      z-index: -1;
      transition: .4s all;
    }
    
  }
  
  .error {
    opacity: 1;
    position: absolute;
    right: 0;
    transition: .4s opacity, .4s color;
  }
  
}

</style>