import { firestore } from '../plugins/firebase'
import firebase from 'firebase/app'


export const actions = {

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
    
    if(data.commentData.parentId != data.slug){
      await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentData.parentId}`).update({
        replyCount: firebase.firestore.FieldValue.increment(1),
      });
    }
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}`).update({
      commentCount: firebase.firestore.FieldValue.increment(1),
    })
  },
  async editComment({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentId}`).update({
      content: data.newContent,
      updateHistory: firebase.firestore.FieldValue.arrayUnion({editedAt: data.updatedAt, content: data.newContent}),
      updatedAt: data.updatedAt,
    });
  },
  async deleteCommentTemporarily({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentId}`).update({
      content: 'Message deleted.',
      uid: 'deleted',
      updatedAt: new Date(Date.now()),
    });
  },
  async deleteCommentAbsolute({}, data){
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.commentId}`).delete();
    if(data.parentId != data.slug){
      await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}/comments/${data.parentId}`).update({
        replyCount: firebase.firestore.FieldValue.increment(-1),
      });
    }
    await firestore.doc(`users/${data.postOwnerId}/posts/${data.slug}`).update({
      commentCount: firebase.firestore.FieldValue.increment(-1),
    })
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