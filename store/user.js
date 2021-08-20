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

    let newPpURL;
    if(user.data().customPP){
      newPpURL = await moveFirebaseFile(`profile-pictures/${user.data().username}.jpg`,`profile-pictures/${chosenName}.jpg`);
    }
	
    // update the user's data with new username and decrease the username change limit
    await firestore.doc(`users/${state.user.uid}`).update({
      username: chosenName,
      usernameChangeLimit: firebase.firestore.FieldValue.increment(-1),
      photoURL: newPpURL || user.data().photoURL
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
	    updatedUser.customPP = true;

    }else if (!updatedUser.photoURL) {

      updatedUser.customPP = false;
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


function moveFirebaseFile(currentPath, destinationPath) {

  return new Promise((resolve, reject) => {
    
    let oldRef = storage.ref().child(currentPath)

    oldRef.getDownloadURL().then(url => {

      // For now,
      // I use a CORS proxy (cors-anywhere) to avoid "Header 'access-control-allow-origin' missing" error.
      // It will be changed/fixed in the production.
      fetch('http://localhost:1111/'+url).then(async htmlReturn => { 
        let fileArray = new Uint8Array()
        const reader = htmlReturn.body.getReader()

        while (true) {
          const { value, done } = await reader.read();
          if (done){
            break;
          }
          fileArray = mergeTypedArrays(fileArray,value);
          
        }

        oldRef.delete()
              
        const task = await storage.ref().child(destinationPath).put(fileArray, { contentType: 'image/jpeg' });
        const newURL = await task.ref.getDownloadURL();
        resolve(newURL);

      })
    })

  });

}


function mergeTypedArrays(a, b) {
  var c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);

  return c;
}