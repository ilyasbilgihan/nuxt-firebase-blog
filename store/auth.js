import { auth, provider, firestore } from '../plugins/firebase'
import Cookie from 'js-cookie'


export const state = () => ({
})

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
    auth.signOut()
    Cookie.remove('user_data');
    this.$router.go() // to trigger 'authControl' middleware

  },
  watchAuthState({}) {

    auth.onAuthStateChanged(user => {

      console.log("Auth state controlling => user", user == null ? 'not found' : `(${user.uid}) found.` )

      if(user == null){

        this.commit('user/setUser', {user: null, info: 'Signed out / no user'})

      }else { // the user must be already logged in or have just logged in.

        firestore.doc(`users/${user.uid}`).get().then(async (snapshot) => {

          if(!snapshot.exists){ // new user

            let userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              username: null,
              usernameChangeLimit: 4,
              bio: '',
              profession: '',
              location: '',
			  customPP: false
            }
            await firestore.doc(`users/${user.uid}`).set(userData); // set user to our 'users db'
            this.commit('user/setUser', {user: userData, info: 'new user - must define a username'}) // mutate our state.user

          }else { // we already have setted this user to our 'users db' - existing user - not a new user
            firestore.doc(`users/${user.uid}`).get().then(userRes => { // then get the user's 'user data' from our 'users db'
          
              let info = userRes.data().username == null ? ' - must set a username': '';
              this.commit('user/setUser', {user: userRes.data(), info: 'not a new user' + info}) // mutate our state.user with 'userRes'

            })
          }

        });

      }


    })

  },
  
}