import { firestore } from '../plugins/firebase'
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
  async addPost({}, postData){
    await firestore.doc(`users/${postData.uid}/posts/${postData.slug}`).set(postData);
  },
  async updatePost({}, data){
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
  async fetchComments({}, data){
    let comments = []
    const snapshot = await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}`).collection('comments').where('parentId', '==', data.parent).orderBy('voteCount', 'desc').orderBy('createdAt','desc').get();
    snapshot.forEach((comment) =>{
      comments.push({commentId: comment.id, ...JSON.parse(JSON.stringify(comment.data()))})
    })
    return comments
  },
  async addComment({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}`).collection('comments').add(data.commentData);
    
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentData.parentId}`).update({
      replyCount: firebase.firestore.FieldValue.increment(1),
    });
  },
  async upVoteComment({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentId}`).update({
      upVotes: firebase.firestore.FieldValue.arrayUnion(data.authUserId),
      downVotes: firebase.firestore.FieldValue.arrayRemove(data.authUserId),
      voteCount: firebase.firestore.FieldValue.increment(data.inc),
    })
  },
  async downVoteComment({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentId}`).update({
      downVotes: firebase.firestore.FieldValue.arrayUnion(data.authUserId),
      upVotes: firebase.firestore.FieldValue.arrayRemove(data.authUserId),
      voteCount: firebase.firestore.FieldValue.increment(data.inc),
    })
  },
  async resetUpVote({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentId}`).update({
      upVotes: firebase.firestore.FieldValue.arrayRemove(data.authUserId),
      voteCount: firebase.firestore.FieldValue.increment(-1),
    })
  },
  async resetDownVote({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentId}`).update({
      downVotes: firebase.firestore.FieldValue.arrayRemove(data.authUserId),
      voteCount: firebase.firestore.FieldValue.increment(1),
    })
  }

}