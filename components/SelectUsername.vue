<template>
  <div class="flex justify-center flex-col items-center">
    <h1 class="my-6 text-2xl">Please define a username.</h1>
    <form @submit.prevent="lastCheck()" class="flex flex-col space-y-3 w-1/5 items-center">
      
      <div :class="info[1]" class="custom-input relative w-full">
        <input v-model="chosenName" class="border-current outline-none bg-transparent relative border rounded-lg py-2 px-4 w-full" type="text" required :pattern="pattern">
        <span :class="{'move-top': chosenName}" class="left-0 top-0 px-2 m-2">Username</span>
        <div class="error text-xs bg-white px-2 mr-2 -mt-3">{{ info[0] }}</div>
      </div>
      
	  <div class="w-full flex h-8 space-x-2 justify-center">
	    <div v-if="cancelChangingUsername" @click="undoUsername" class="text-red-500 rounded-md font-semibold w-1/3 flex justify-center items-center hover:bg-red-50 cursor-pointer">Cancel</div>
	    <button :disabled="!available || loading" type="submit" class="bg-blue-500 hover:bg-blue-400 text-white rounded-md w-1/3">Apply</button>
	  </div>
    </form>
	
	
  </div>
</template>

<script>

import { mapActions } from 'vuex';
import Cookie from 'js-cookie';

export default {
  data(){
    return {
      chosenName: null,
      pattern: '^[a-z0-9]([_-](?![_-])|[a-z0-9]){4,14}[a-z0-9]$',
      regExp: new RegExp(/^[a-z0-9]([_-](?![_-])|[a-z0-9]){4,14}[a-z0-9]$/),
      timeout: null,
      available: false,
      valid: false,
      loading: false
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
      return this.$store.getters['auth/getUser'];
    },
	cancelChangingUsername(){
	  const userCookie = JSON.parse(Cookie.get('user_data')).username;
	  return userCookie
	}
  },
  methods:{
    ...mapActions({
      changeUsername: 'auth/changeUsername',
      checkUsername: 'auth/checkUsername'
    }),
    lastCheck(){
      if(this.valid && this.available && !this.loading){
        this.changeUsername(this.chosenName);
      }
    },
	undoUsername(){
	  this.$store.commit('auth/updateUsername', this.cancelChangingUsername)
	},
    onChange() {
      if (this.timeout){
        clearTimeout(this.timeout); 
      }

      if(this.regExp.test(this.chosenName)){
        this.valid = true
        this.loading = true

        this.timeout = setTimeout(() => {

          if(this.regExp.test(this.chosenName)){
            this.checkUsername(this.chosenName).then(res => {
              this.available = res
              this.loading = false
            });
          }

        }, 400); // delay
        
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