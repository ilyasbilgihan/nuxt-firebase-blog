import { firestore, storage } from '../plugins/firebase'
import firebase from 'firebase/app'
import Cookie from 'js-cookie'


export const state = () => ({
  user: null,
  backupUsername: null,
});

export const getters = {
  getUser(state) {
    return state.user
  },
  getBackupUsername(state) {
    return state.backupUsername
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
  },
  deleteBookmark(state, data){
    const afterDelete = state.user.bookmarks.filter(b => !(b.uid == data.uid && b.slug == data.slug));
    state.user.bookmarks = afterDelete;
    Cookie.set('user_data', JSON.stringify(state.user), { secure: true })
  },
  pushBookmark(state, data){
    const afterPush = [data, ...state.user.bookmarks]
    state.user.bookmarks = afterPush;
    Cookie.set('user_data', JSON.stringify(state.user), { secure: true })
  },
  setBackupUsername(state, username){
    state.backupUsername = username;
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
    const previousRef = firestore.doc(`usernames/${previousUsername}`);
    const previousExists = (await previousRef.get()).exists
    if(previousExists){
      await previousRef.delete();
    }
	
    // update the user's data with new username and decrease the username change limit
    await firestore.doc(`users/${state.user.uid}`).update({
      username: chosenName,
      usernameChangeLimit: firebase.firestore.FieldValue.increment(-1),
    });

    // set new username to 'usernames' db
    await firestore.doc(`usernames/${chosenName}`).set({
      uid: state.user.uid
    });

    commit('updateUsername', chosenName);
    commit('updateUsernameChangeLimit', state.user.usernameChangeLimit - 1)
    Cookie.set('user_data', JSON.stringify(state.user), { secure: true })

  },
  async fetchUser({}, uid){
    const user = await firestore.doc(`users/${uid}`).get();
    return user
  },
  async updateUser({ commit, state }, { updatedUser, ppFile, unchangedPP, coverImageFile }){
    
    const storageRef = storage.ref();
    
    if(ppFile != null){

      const ppRes = await storageRef.child(`profile-pictures/${state.user.uid}.jpg`).put(ppFile);
      updatedUser.photoURL = (await ppRes.ref.getDownloadURL());

    }else if (!updatedUser.photoURL && unchangedPP != null) {
      
      await storageRef.child(`profile-pictures/${state.user.uid}.jpg`).delete()

    }
    if(coverImageFile){
      const coverImageRes = await storageRef.child(`cover-images/${state.user.uid}.jpg`).put(coverImageFile);
      updatedUser.coverImageURL = (await coverImageRes.ref.getDownloadURL());
    }

    await firestore.doc(`users/${state.user.uid}`).update(updatedUser);

    commit('setUser', {user: updatedUser, info: 'user updated from account settings'}) // mutate our state.user

  },
  async follow({ state, commit }, uid){
    
    await firestore.doc(`users/${state.user.uid}`).update({
      followed: firebase.firestore.FieldValue.arrayUnion(uid)
    });
    await firestore.doc(`users/${uid}`).update({
      followers: firebase.firestore.FieldValue.arrayUnion(state.user.uid)
    });
    const updatedUser = JSON.parse(JSON.stringify(state.user));
    updatedUser.followed.push(uid);
    commit('setUser', {user: updatedUser, info: 'user updated - follow'}) // mutate our state.user

  },
  async unfollow({ state, commit }, uid){

    await firestore.doc(`users/${state.user.uid}`).update({
      followed: firebase.firestore.FieldValue.arrayRemove(uid)
    });
    await firestore.doc(`users/${uid}`).update({
      followers: firebase.firestore.FieldValue.arrayRemove(state.user.uid)
    });
    const updatedUser = JSON.parse(JSON.stringify(state.user));
    updatedUser.followed.splice(updatedUser.followed.indexOf(uid), 1);
    commit('setUser', {user: updatedUser, info: 'user updated - unfollow'}) // mutate our state.user

  }
}