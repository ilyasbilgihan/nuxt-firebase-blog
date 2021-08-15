import { firestore, storage } from '../plugins/firebase'
import firebase from 'firebase/app'
import Cookie from 'js-cookie'


export const state = () => ({
  user: null
});

export const getters = {
  getUser(state) {
    return state.user
  }
}

export const mutations = {
  setUser(state, payload){
    console.log(payload.info) // commit message for debug
    state.user = payload.user

    if (payload.user != null){
      Cookie.set('user_data', JSON.stringify(payload.user), { secure: true })
    }

  },
  updateUsername(state, chosenName){
    state.user.username = chosenName
  },
  updateUsernameChangeLimit(state, left){
    state.user.usernameChangeLimit = left;
  }
}

export const actions = {
  
  async checkUsername({ dispatch }, chosenName){
    return !( (await dispatch('fetchUserId', chosenName)).exists ) // exists => taken, not exists => available
  },
  async fetchUserId({}, chosenName){
    const user = await firestore.doc(`usernames/${chosenName}`).get();
    return user
  },
  async changeUsername({ commit, state }, chosenName){

    const user = await firestore.doc(`users/${state.user.uid}`).get();
    if(user.data().usernameChangeLimit == 0){ // just incase control the limit
      console.log('You have no rights to change your username')
      Cookie.set('user_data', JSON.stringify(state.user), { secure: true }) // must be a cookie bug, update with current user state.
      return
    }

    // delete previous username
    const previousUsername = user.data().username;
    await firestore.doc(`usernames/${previousUsername}`).delete();

    // set new username to 'usernames' db
    await firestore.doc(`usernames/${chosenName}`).set({
      uid: state.user.uid
    });

    // update the user's data with new username and decrease the username change limit
    await firestore.doc(`users/${state.user.uid}`).update({
      username: chosenName,
      usernameChangeLimit: firebase.firestore.FieldValue.increment(-1)
    });

    commit('updateUsername', chosenName);
    commit('updateUsernameChangeLimit', state.user.usernameChangeLimit - 1)
    Cookie.set('user_data', JSON.stringify(state.user), { secure: true })

  },
  async fetchUser({}, uid){
    const user = await firestore.doc(`users/${uid}`).get();
    return user
  },
  async updateUser({ commit, state }, { updatedUser, ppFile }){
    
    const storageRef = storage.ref();
    
    if(ppFile != null){

      const ppRes = await storageRef.child(`profile-pictures/${state.user.username}.jpg`).put(ppFile);
      updatedUser.photoURL = (await ppRes.ref.getDownloadURL());

    }else if (!updatedUser.photoURL) {

      try {
        await storageRef.child(`profile-pictures/${state.user.username}.jpg`).delete()
      } catch (error) {
        // throws an unnecessary error - ignore it.
      }

    }

    await firestore.doc(`users/${state.user.uid}`).update(updatedUser);

    commit('setUser', {user: updatedUser, info: 'user updated from account settings'}) // mutate our state.user

  },
}