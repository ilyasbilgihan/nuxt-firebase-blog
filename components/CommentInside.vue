<template>

  <div v-if="commentOwner" class="comment-container flex flex-col">

    <div class="flex items-center space-x-3 pt-2">

      <NuxtLink v-if="comment.uid != 'deleted'" :to="'/' + commentOwner.username" class="w-8 h-8 rounded-md shadow overflow-hidden">
        <img :src="commentOwner.photoURL || require('@/assets/images/avatar.png')" :alt="commentOwner.displayName">
      </NuxtLink>
      <div class="text-sm font-semibold">
        <NuxtLink v-if="comment.uid != 'deleted'" :to="'/' + commentOwner.username" class="inline-block transition duration-300 transform hover:translate-x-1">{{commentOwner.displayName}}</NuxtLink>
        <span v-else>{{commentOwner.displayName}}</span>
      </div>
      <!-- Comment owner details(profile-picture, display name)  end -->

      <div v-if="comment.uid != 'deleted'" class="flex space-x-2 items-center text-xs text-gray-500">
        <span :title="getTime(comment.createdAt)" >sent {{fromNow(comment.createdAt)}}</span>
        <div v-if="comment.createdAt != comment.updatedAt" class="p-0.5 bg-gray-400 rounded-full"></div>
        <span v-if="comment.createdAt != comment.updatedAt" :title="getTime(comment.updatedAt)">
          <span @click="toggleHistory()" class="underline cursor-pointer select-none hover:text-gray-600">edited</span>
          {{ fromNow(comment.updatedAt) }}
        </span>
      </div>
      <span v-else class="text-xs text-gray-500">Unknown</span> 
      <!-- Comment create, update information end -->

      <el-dropdown v-if="authUser && (authUser.uid == comment.uid)" size="small" trigger="click" placement="bottom-start" @command="handleMoreOption">
        <span class="el-dropdown-link">
          <span class="transition duration-300 hover:bg-gray-50 hover:shadow cursor-pointer p-1 rounded-full isax-more text-gray-500"></span>
        </span> <!-- Dropdown trigger end -->

        <el-dropdown-menu slot="dropdown" class="w-40">
          <el-dropdown-item command="editComment"><div class="dd-item"><span class="text-base" :class="!showEditArea ? 'isax-edit' : 'isax-eye'"></span><span>{{showEditArea ? 'Preview' : 'Edit'}} comment</span></div></el-dropdown-item>
          <el-dropdown-item divided command="deleteComment"><div class="dd-item text-red-600"><span class="text-base isax-trash"></span><span>Delete comment</span></div></el-dropdown-item>
        </el-dropdown-menu> <!-- Dropdown menu end -->
      </el-dropdown>  <!-- Comment settings dropdown end -->

    </div>  <!-- Comment Details (owner, created, updated, settings) end -->

    <div class="comment flex">

      <div class="commentLine">
        <span></span> <!-- the line -->
      </div> <!-- line container end -->

      <div class="flex-1 overflow-hidden pl-2">

        <p v-if="!showEditArea" class="py-2 text-sm overflow-hidden overflow-ellipsis" :class="{'text-xs line-through': comment.uid == 'deleted'}">{{comment.content}}</p>
        <div v-else class="space-y-1 mb-2">
          <el-input
            class=""
            type="textarea" 
            :autosize="{minRows: 2}"
            v-model="comment.content"
            :maxlength="replyLimit"
            show-word-limit
          ></el-input>
          <el-button @click="applyEdit()" size="small" type="warning" round>Apply Edit</el-button>
        </div>
        <!-- Comment content and content edit textarea end -->

        <div class="flex items-center space-x-1">
          <div :class="{'bg-green-50 text-green-700': hasAlreadyUpVoted}" @click="upVote()" class="flex w-8 h-8 text-lg justify-center items-center cursor-pointer transition duration-300 rounded-full hover:bg-green-50 hover:text-green-700"><span class="isax-arrow-up-2"></span></div>
          <span class="text-sm font-semibold text-gray-600 px-1">{{comment.voteCount}}</span>
          <div :class="{'bg-red-50 text-red-700': hasAlreadyDownVoted}" @click="downVote()" class="flex w-8 h-8 text-lg justify-center items-center cursor-pointer transition duration-300 rounded-full hover:bg-red-50 hover:text-red-700"><span class="isax-arrow-down-1"></span></div>
          <span @click="toggleReply()" v-if="comment.uid != 'deleted'" class="select-none cursor-pointer text-sm font-semibold">Reply</span>
        </div>
        <!-- Upvote - downvote - reply buttons end -->

        <el-collapse-transition>
          <div v-show="showReply" class="reply mt-2 flex">
            <div class="replyLine pt-0"><span></span></div>
            <div class="flex-1 pl-2 space-y-1">
              <el-input 
                type="textarea" 
                placeholder="What are your thoughts?."
                v-model="replyContent"
                :autosize="{ minRows: 2}"
                autocomplete="off"
                :maxlength="replyLimit"
                show-word-limit
              ></el-input>
              <el-button @click="replyComment()" size="small" type="primary" round>Reply</el-button>
            </div>
          </div>
        </el-collapse-transition>
        <!-- Reply textarea end -->

        <span @click="showReplies = !showReplies" v-if="comment.replyCount > 0" class="mt-2 text-yellow-600 hover:text-yellow-700 select-none cursor-pointer text-sm font-semibold">{{showReplies ? 'Hide' : 'Show'}} replies</span>
        <el-collapse-transition>
          <Comments :key="forceUpdate" v-show="showReplies" :parent="comment.commentId" :postOwnerId="postOwnerId" :post="post" />
        </el-collapse-transition>
        <!-- Hid/show replies button and replies end -->

      </div>
    </div>

    <el-drawer
      title="Update history for selected comment."
      :visible.sync="updateHistory"
      direction="rtl"
      size="40%"
      >
      <div class="px-8">

        <div class="flex mb-8">
          <NuxtLink class="w-24 h-24 rounded-lg shadow overflow-hidden" :to="'/' + commentOwner.username">
            <img :src="commentOwner.photoURL || require('@/assets/images/avatar.png')" :alt="commentOwner.displayName">
          </NuxtLink>
          <div class="ml-4 flex flex-1 flex-col space-y-1 justify-center text-sm">
            <NuxtLink :to="'/' + commentOwner.username" class="transition duration-300 transform hover:translate-x-1">
              <h6 class="font-semibold">{{commentOwner.displayName}}</h6>
            </NuxtLink>
            <div v-if="commentOwner.location" class="flex items-center"><span class="mr-1 text-lg isax-location"></span>{{commentOwner.location}}</div>
            <div v-if="commentOwner.profession" class="flex items-center"><span class="mr-1 text-lg isax-briefcase"></span>{{commentOwner.profession}}</div>
            <p>{{commentOwner.bio}}</p>
          </div>
        </div> <!-- Comment Owner Details end -->

        <div class="updateHistory grid gap-x-10 grid-cols-2 w-full h-full">
          <div class="historyItem flex flex-col pb-10" v-for="(history, index) in comment.updateHistory" :key="history.editedAt">
            <h5 class="font-semibold">{{index + 1}}</h5>
            <span class="text-xs text-gray-500">{{getTime(history.editedAt)}}</span>
            <hr class="my-2">
            <div class="text-sm diff-content" style="line-break: anywhere" v-html="index != 0 ? highlightDifferences(history.content, comment.updateHistory[index - 1].content) : history.content"></div>
            <style>
                ins{
                  text-decoration: none;
                  color: #fff;
                  background-color: #10B981;
                }
                del {
                  color: #fff;
                  text-decoration: none;
                  background-color: #EF4444;
                }
            </style>
          </div>
        </div>  <!-- Comment Differences grid table end-->

      </div>
    </el-drawer>  <!-- Comment Edit History end -->

  </div>

</template>

<script>
const Diff = require('diff');

export default({
  data(){
    return {
      commentOwner: null,
      anonymousComment: {
        photoURL: null,
        displayName: 'Anonymous',
        username: 'anonymous'
      },
      showReply: false,
      replyContent: '',
      replyLimit: 300,
      replyLoading: false,
      showReplies: false,
      forceUpdate: 0,
      voteLoading: false,
      timeOptions: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      showEditArea: false,
      editLoading: false,
      deleteLoading: false,
      updateHistory: false,
    }
  },
  methods: {
    getTime(time){
      return new Date(time).toLocaleDateString('en-US', this.timeOptions)
    },
    toggleHistory(){
      if(this.authUser){
        this.updateHistory = true
      }else {
        this.$message.error('You have to login to see a comment\'s history.');
      }
    },
    highlightDifferences(newContent, oldContent){

      const changes = Diff.diffCss(oldContent, newContent);
      return Diff.convertChangesToXML(changes);

    },
    handleMoreOption(command) {
      if( command == 'editComment' )
        this.showEditArea = !this.showEditArea
      if ( command == 'deleteComment')
        this.openDeleteModal();
    },
    openDeleteModal() {
      
      this.$confirm('Are you sure you want to delete your comment.', 'Warning', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        center: true
      }).then(() => {
        this.confirmDelete().then(()=>{
          this.$message.success('Your comment successfully deleted.');
        });
      }).catch(()=>{});

    },
    async confirmDelete(){
      this.deleteCommentWarning = false;

      if(!this.deleteLoading){
        this.deleteLoading = true;
        const deleteData = {
          commentId: this.comment.commentId, 
          postOwnerId: this.postOwnerId, 
          slug: this.post.slug,
        }
        
        // Deleted comment has replies, we should keep them.
        // So just change the comment details with an anonymous data (temporarily deletion)
        if(this.comment.replyCount != 0){

          await this.$store.dispatch('comment/deleteCommentTemporarily', deleteData)
          this.comment.uid = 'deleted'
          this.comment.content = 'Message deleted.'
          this.commentOwner = this.anonymousComment;

        }else {

          await this.$store.dispatch('comment/deleteCommentAbsolute', { parentId: this.comment.parentId, ...deleteData })

          // If the deleted comment is a reply(not main) comment, reduce the parent's reply count.
          if(this.post.slug != this.comment.parentId){
            this.$parent.$parent.comment.replyCount -= 1;

            // After reducing replyCount, If parent comment has 0 replies and has been deleted(temporarily), delete it too.
            if(this.$parent.$parent.comment.replyCount == 0 && this.$parent.$parent.comment.uid == 'deleted'){

              // This process will cause a recursive event, It continues delete comments over and over,
              // until facing a not deleted comment or a comment which has had replies.
              this.$parent.$parent.confirmDelete();
            }

          }
          this.commentOwner = false; // It provides us not to show the comment (line:3 'comment-container' div has v-if control)
          this.post.commentCount -= 1;
        }
        this.deleteLoading = false;
      }
    },
    async applyEdit(){

      if(!this.editLoading){

        this.editLoading = true;

        if(this.comment.content.length <= this.replyLimit){
          if(this.comment.content.length > 0 ){
            
            const editData = {
              commentId: this.comment.commentId, 
              postOwnerId: this.postOwnerId, 
              slug: this.post.slug, 
              newContent: this.comment.content,
              updatedAt: Date.now(),
            }
            await this.$store.dispatch('comment/editComment', editData)
            this.comment.updatedAt = editData.updatedAt;
            this.comment.updateHistory.push({editedAt: editData.updatedAt, content: editData.newContent})
            this.showEditArea = false;
            
          }else {
            this.$message.error('You should type something.')
          }
        }else {
          this.$message.error('You can\'t break the rules.')
        }
        this.editLoading = false;

      }else {
        this.$message.warning('Slow Down !!!')
      }
    },
    async toggleReply(){
      if(this.authUser){
        this.showReply = !this.showReply
      }else {
        this.$message.error('You have to login to reply a comment.')
      }
    },
    async upVote(){
      if(this.authUser){
        if(!this.voteLoading){
          this.voteLoading = true;

          const voteData = {
            postOwnerId: this.postOwnerId,
            slug: this.post.slug,
            commentId: this.comment.commentId,
            authUserId: this.authUser.uid,
            inc: this.hasAlreadyDownVoted ? 2 : 1,
          }

          if(!this.hasAlreadyUpVoted){ // Upvote if not upvoted (it still may have been downvoted)

            await this.$store.dispatch('comment/upVoteComment', voteData);
            
            this.comment.upVotes.push(this.authUser.uid)
            // if the user has downvoted, it gives us extra 1 point increment
            this.comment.voteCount += this.hasAlreadyDownVoted ? 2 : 1;

            if(this.hasAlreadyDownVoted){
              this.comment.downVotes.splice(this.comment.downVotes.indexOf(this.authUser.uid), 1)
            }
            
          }else { // If the user already has upvoted, reset up vote
            await this.$store.dispatch('comment/resetUpVote', voteData)
            this.comment.upVotes.splice(this.comment.upVotes.indexOf(this.authUser.uid), 1)
            this.comment.voteCount -= 1;
          }
          this.voteLoading = false;

        }else {
          this.$message.warning('Slow Down !!!');
        }
      }else {
        this.$message.error('You have to login to vote a comment.')
      }
    },
    async downVote(){
      if(this.authUser){
        if(!this.voteLoading){
          this.voteLoading = true;

          const voteData = {
            postOwnerId: this.postOwnerId,
            slug: this.post.slug,
            commentId: this.comment.commentId,
            authUserId: this.authUser.uid,
            inc: this.hasAlreadyUpVoted ? -2 : -1,
          }

          if(!this.hasAlreadyDownVoted){ // Downvote if not downvoted (it still may have been upvoted)
            
            await this.$store.dispatch('comment/downVoteComment', voteData);
            
            this.comment.downVotes.push(this.authUser.uid)
            // if the user has upvoted, it gives us extra 1 point to decrement
            this.comment.voteCount -= this.hasAlreadyUpVoted ? 2 : 1;

            if(this.hasAlreadyUpVoted){
              this.comment.upVotes.splice(this.comment.upVotes.indexOf(this.authUser.uid), 1)
            }

          }else { // If the user already has downvoted, reset down vote
            await this.$store.dispatch('comment/resetDownVote', voteData)
            this.comment.downVotes.splice(this.comment.downVotes.indexOf(this.authUser.uid), 1)
            this.comment.voteCount += 1;
          }
          this.voteLoading = false;

        }else {
          this.$message.warning('Slow Down !!!');
        }
      }else {
        this.$message.error('You have to login to vote a comment.')
      }
    },
    async replyComment(){
      
      if(!this.replyLoading){

        this.replyLoading = true;

        if(this.replyContent.length <= this.replyLimit){

          if(this.replyContent.length > 0 ){

            const commentData = {
              uid: this.authUser.uid,
              parentId: this.comment.commentId,
              content: this.replyContent,
              updateHistory: [{editedAt: Date.now(), content: this.replyContent}],
              upVotes: [],
              downVotes: [],
              voteCount: 0,
              replyCount: 0,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
            
            await this.$store.dispatch('comment/addComment', {postOwnerId: this.postOwnerId, slug: this.post.slug, commentData: commentData})
            
            this.replyContent = ''; // reset textarea
            this.showReply = false;
            this.forceUpdate += 1; // We bind forceUpdate data to our replies container, it will provides us to update the comments.
            this.comment.replyCount += 1;
            this.post.commentCount += 1;
            this.showReplies = true;

          }else {
            this.$message.error('You should type something.')
          }
        }else {
          this.$message.error('You can\'t break the rules.')
        }
        this.replyLoading = false;
      
      }else {
        this.$message.warning('Slow Down !!!')
      }
    }
  },
  computed: {
    fromNow(){
      return function(time){
        return this.$moment(time).fromNow();
      }
    },
    authUser(){
      return this.$store.getters['user/getUser'];
    },
    hasAlreadyUpVoted(){
      let exists = false;
      if(this.authUser){
        exists = this.comment.upVotes.includes(this.authUser.uid);
      }
      return exists;
    },
    hasAlreadyDownVoted(){
      let exists = false;
      if(this.authUser){
        exists = this.comment.downVotes.includes(this.authUser.uid);
      }
      return exists;
    },
  },
  props: {
    comment: Object,
    postOwnerId: String,
    post: Object,
  },
  async fetch(){

    if(this.comment.uid != 'deleted'){

      const user = await this.$store.dispatch('user/fetchUser', this.comment.uid)
      this.commentOwner = user.data();

    }else {

      this.commentOwner = this.anonymousComment;

    }

  },
})
</script>


<style lang="scss" scoped>

.comment-container:hover {
  & > .comment > .commentLine {
    span {
      background-color: #409EFF;
      opacity: 1;
    }
  }
}

.reply:hover {
  & > .replyLine{
    span {
      background-color: #409EFF;
      opacity: 1;
    }
  }
}


.commentLine, .replyLine {
  @apply w-8 h-auto flex justify-center;

  span {
    display: block;
    width: 2px;
    height: 100%;
    transition: .4s background-color, .4s opacity;
    background-color: #ccc;
  }
}
.commentLine {
  @apply pt-2;
}
</style>