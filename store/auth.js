import { auth, provider, firestore, storage } from '../plugins/firebase'
import firebase from 'firebase/app'
import Cookie from 'js-cookie'


export const state = () => ({
  user: null
})

export const mutations = {
  setUser(state, payload) {
    console.log(payload.info) // commit message for debug
    state.user = payload.user
  },
  updateUsername(state, chosenName){
    state.user.username = chosenName
  },
  updateChangeLimit(state, left){
    state.user.usernameChangeLimit = left;
  }
} 

export const getters = {
  getUser(state) {
    return state.user
  }
}

export const actions = {
  login() {

    auth.signInWithPopup(provider).then(res => {
      console.log("Succesfully logged in.");
    }).catch(err => {
      console.log("An error accured during the login process =>", err.message)
    })

  },
  logout(){

    console.log('Successfully logged out.')
    this.$router.go() // to trigger 'authControl' middleware
    auth.signOut()
    Cookie.remove('user_data');

  },
  onStateChanged({ commit, dispatch }) {

    auth.onAuthStateChanged(user => {

      console.log("Auth state controlling => user", user == null ? 'not found' : `(${user.uid}) found.` )

      if(user == null){

        commit('setUser', {user: null, info: 'Signed out / no user'})

      }else { // the user must be already logged in or have just logged in.

        firestore.doc(`users/${user.uid}`).get().then(async (snapshot) => {

          if(!snapshot.exists){ // if we have not setted a user to our 'users db' with this 'user data'

            let userData = {
              displayName: user.displayName,
              photoURL: user.photoURL,
              email: user.email,
              username: null,
              uid: user.uid,
              usernameChangeLimit: 4,
              bio: '',
              profession: '',
              location: ''
            }
            const setUser = await firestore.doc(`users/${user.uid}`).set(userData); // set user to our 'users db'
            commit('setUser', {user: userData, info: 'new user - must set a username'}) // mutate our state.user
            Cookie.set('user_data', JSON.stringify(userData), { secure: true })

          }else { // we already have setted this user to our 'users db'
          
            firestore.doc(`users/${user.uid}`).get().then(userRes => { // then get the current user's 'user data' from our 'users db'
              let info = userRes.data().username == null ? ' - must set a username': '';
              commit('setUser', {user: userRes.data(), info: 'not a new user' + info}) // mutate our state.user with 'userRes'
              Cookie.set('user_data', JSON.stringify(userRes.data()), { secure: true })


            })
  
          }

        });

      }


    })
  },
  async checkUsername({ commit, dispatch }, chosenName){
    return !(await dispatch('fetchUserId', chosenName)).exists
  },
  async fetchUserId({commit}, chosenName){
    const user = await firestore.doc(`usernames/${chosenName}`).get();
    return user
  },
  async changeUsername({ commit, state }, chosenName){

    const user = await firestore.doc(`users/${state.user.uid}`).get();
    if(user.data().usernameChangeLimit == 0){
      console.log('You have no rights to change your username')
      Cookie.set('user_data', JSON.stringify(state.user), { secure: true })
      return
    }

    const from = user.data().username;

    await firestore.doc(`usernames/${from}`).delete();

    await firestore.doc(`usernames/${chosenName}`).set({
      uid: state.user.uid
    });

    await firestore.doc(`users/${state.user.uid}`).update({
      username: chosenName,
      usernameChangeLimit: firebase.firestore.FieldValue.increment(-1)
    });

    commit('updateUsername', chosenName);
    commit('updateChangeLimit', state.user.usernameChangeLimit - 1)

    Cookie.set('user_data', JSON.stringify(state.user), { secure: true })

  },
  async fetchUser({ commit }, uid){
    const user = await firestore.doc(`users/${uid}`).get();
    return user
  },
  async updateUser({ commit, state }, {updatedUser, ppFile}){

    
    const storageRef = storage.ref();

    if(ppFile != null){
      const ppRes = await storageRef.child(`profile-pictures/${state.user.username}.jpg`).put(ppFile);
      updatedUser.photoURL = (await ppRes.ref.getDownloadURL())
    }else if (!updatedUser.photoURL) {

      try {
        await storage.ref(`profile-pictures/${state.user.username}.jpg`).delete()
      } catch (error) {
        
      }
      

    }

    await firestore.doc(`users/${state.user.uid}`).update(updatedUser);

    commit('setUser', {user: updatedUser, info: 'user updated from account settings'}) // mutate our state.user
    Cookie.set('user_data', JSON.stringify(state.user), { secure: true })
    

  }
}