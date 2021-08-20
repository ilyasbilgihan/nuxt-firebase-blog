import { firestore } from '../plugins/firebase'
import firebase from 'firebase/app'

export const actions = {

  async fetchPost({}, {uid, slug}){
    const post = await firestore.doc(`users/${uid}/posts/${slug}`).get();
    return post
  },
  async fetchUserPosts({}, uid){

    let posts = []
    const snapshot = await firestore.doc(`users/${uid}`).collection('posts').orderBy('createdAt', 'desc').get();
    snapshot.forEach((post) =>{
      posts.push(post.data())
    })
    return posts
    
  },
  async addPost({}, postData){
    await firestore.doc(`users/${postData.uid}/posts/${postData.slug}`).set(postData);
  },
  async dislikePost({}, postData){
    await firestore.doc(`users/${postData.ownerId}/posts/${postData.slug}`).update({
      likes: firebase.firestore.FieldValue.arrayRemove(postData.uid)
    });
  },
  async likePost({}, postData){
    await firestore.doc(`users/${postData.ownerId}/posts/${postData.slug}`).update({
      likes: firebase.firestore.FieldValue.arrayUnion(postData.uid)
    });
  },
  async removeBookmark({}, postData){
    await firestore.doc(`users/${postData.uid}`).update({
      bookmarks: firebase.firestore.FieldValue.arrayRemove(postData.bookmarkData)
    });
    this.commit('user/deleteBookmark', postData.bookmarkData)
  },
  async addBookmark({}, postData){
    await firestore.doc(`users/${postData.uid}`).update({
      bookmarks: firebase.firestore.FieldValue.arrayUnion(postData.bookmarkData)
    });
    this.commit('user/pushBookmark', postData.bookmarkData)
  }

}