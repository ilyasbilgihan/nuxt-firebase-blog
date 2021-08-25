import { firestore, storage } from '../plugins/firebase'
import firebase from 'firebase/app'

export const actions = {

  async fetchPost({}, {uid, slug}){
    const post = await firestore.doc(`users/${uid}/posts/${slug}`).get();
    return post
  },
  async fetchUserPosts({}, uid){

    let posts = []
    const snapshot = await firestore.doc(`users/${uid}`).collection('posts').orderBy('updatedAt', 'desc').get();
    snapshot.forEach((post) =>{
      posts.push(post.data())
    })
    return posts
    
  },
  async addPost({}, data){
    const storageRef = storage.ref();
    const postImageRef = await storageRef.child(`post-images/${data.postData.uid}-${data.postData.slug}.jpg`).put(data.postImageFile);
    data.postData.postImageURL = (await postImageRef.ref.getDownloadURL());

    await firestore.doc(`users/${data.postData.uid}/posts/${data.postData.slug}`).set(data.postData);
  },
  async deletePost({}, data){
    const storageRef = storage.ref();

    await deleteCollection(`users/${data.ownerId}/posts/${data.slug}/comments`);
    await firestore.doc(`users/${data.ownerId}/posts/${data.slug}`).delete();
    await storageRef.child(`post-images/${data.ownerId}-${data.slug}.jpg`).delete();

  },
  async updatePost({}, data){
    
    if(data.newPostImageFile != null){
      const storageRef = storage.ref();
      const newPostImageRef = await storageRef.child(`post-images/${data.uid}-${data.slug}.jpg`).put(data.newPostImageFile);
      data.postData.postImageURL = (await newPostImageRef.ref.getDownloadURL());
    }

    await firestore.doc(`users/${data.uid}/posts/${data.slug}`).update(data.postData);
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
  },

}

const deleteCollection = async (path) => {
  firestore.collection(path).get().then(async query => {
    query.forEach(async (snapshot) => {
      await snapshot.ref.delete()
    });
  });
}