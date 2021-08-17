import { firestore } from '../plugins/firebase'

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
  }

}