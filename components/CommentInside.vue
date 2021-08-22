<template>

  <div v-if="commentOwner" class="comment-container flex flex-col">
    <div class="flex items-center space-x-2 pt-2">
      <NuxtLink :to="'/' + commentOwner.username" class="w-8 h-8 rounded-md shadow overflow-hidden">
        <img :src="commentOwner.photoURL || require('@/assets/images/avatar.png')" :alt="commentOwner.displayName">
      </NuxtLink>
      <NuxtLink :to="'/' + commentOwner.username" class="text-sm font-semibold transition duration-300 transform hover:translate-x-1">{{commentOwner.displayName}}</NuxtLink>
      <span :title="getTime(comment.createdAt)" class="text-xs text-gray-500" >{{$moment(comment.createdAt.seconds * 1000).fromNow()}}</span>
    </div>
    <div class="comment flex">
      <div class="commentLine"><span></span></div>
      <div class="flex-1 overflow-hidden pl-2">
        <p class="py-2 text-sm overflow-hidden overflow-ellipsis">{{comment.content}}</p>
        <div class="flex items-center space-x-1">
          <div :class="{'bg-green-50 text-green-700': hasAlreadyUpVoted}" @click="upVote()" class="flex w-8 h-8 justify-center items-center cursor-pointer transition duration-300 rounded-full hover:bg-green-50 hover:text-green-700"><span class="el-icon-arrow-up pb-0.5"></span></div>
          <span class="text-sm font-semibold text-gray-600 px-1">{{comment.voteCount}}</span>
          <div :class="{'bg-red-50 text-red-700': hasAlreadyDownVoted}" @click="downVote()" class="flex w-8 h-8 justify-center items-center cursor-pointer transition duration-300 rounded-full hover:bg-red-50 hover:text-red-700"><span class="el-icon-arrow-down"></span></div>
          <span @click="toggleReply()" class="select-none cursor-pointer text-sm font-semibold">Reply</span>
        </div>
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
        <span @click="showReplies = !showReplies" v-if="comment.replyCount > 0" class="mt-2 text-yellow-600 hover:text-yellow-700 select-none cursor-pointer text-sm font-semibold">{{showReplies ? 'Hide' : 'Show'}} replies</span>
        <el-collapse-transition>
          <Comments :key="forceUpdate" v-show="showReplies" :parent="comment.commentId" :postOwnerId="postOwnerId" />
        </el-collapse-transition>
      </div>
    </div>
  </div>

</template>

<script>

export default({
  data(){
    return {
      commentOwner: null,
      showReply: false,
      replyContent: '',
      replyLimit: 300,
      replyLoading: false,
      showReplies: false,
      forceUpdate: 0,
      voteLoading: false,
      timeOptions: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    }
  },
  methods: {
    getTime(time){
      return new Date(time.seconds * 1000).toLocaleDateString('en-US', this.timeOptions)
    },
    async toggleReply(){
      if(this.authUser){
        this.showReply = !this.showReply
      }else {
        this.$message.error('You have to login to reply a comment.')
      }
    },
    async upVote(){
      if(!this.voteLoading){
        this.voteLoading = true;

        const voteData = {
          postOwnerId: this.postOwnerId,
          slug: this.$route.params.postSlug,
          commentId: this.comment.commentId,
          authUserId: this.authUser.uid,
          inc: this.hasAlreadyDownVoted ? 2 : 1,
        }

        if(!this.hasAlreadyUpVoted){

          await this.$store.dispatch('post/upVoteComment', voteData);
          this.comment.upVotes.push(this.authUser.uid)
          this.comment.voteCount += this.hasAlreadyDownVoted ? 2 : 1;
          if(this.hasAlreadyDownVoted){
            this.comment.downVotes.splice(this.comment.downVotes.indexOf(this.authUser.uid), 1)
          }
          
        }else {
          await this.$store.dispatch('post/resetUpVote', voteData)
          this.comment.upVotes.splice(this.comment.upVotes.indexOf(this.authUser.uid), 1)
          this.comment.voteCount -= 1;
        }
        this.voteLoading = false;

      }else {
        this.$message.warning('Slow Down !!!');
      }
    },
    async downVote(){
      if(!this.voteLoading){
        this.voteLoading = true;

        const voteData = {
          postOwnerId: this.postOwnerId,
          slug: this.$route.params.postSlug,
          commentId: this.comment.commentId,
          authUserId: this.authUser.uid,
          inc: this.hasAlreadyUpVoted ? -2 : -1,
        }

        if(!this.hasAlreadyDownVoted){
          
          await this.$store.dispatch('post/downVoteComment', voteData);
          this.comment.downVotes.push(this.authUser.uid)
          this.comment.voteCount -= this.hasAlreadyUpVoted ? 2 : 1;
          if(this.hasAlreadyUpVoted){
            this.comment.upVotes.splice(this.comment.upVotes.indexOf(this.authUser.uid), 1)
          }

        }else {
          await this.$store.dispatch('post/resetDownVote', voteData)
          this.comment.downVotes.splice(this.comment.downVotes.indexOf(this.authUser.uid), 1)
          this.comment.voteCount += 1;
        }
        this.voteLoading = false;

      }else {
        this.$message.warning('Slow Down !!!');
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
              upVotes: [],
              downVotes: [],
              voteCount: 0,
              replyCount: 0,
              createdAt: new Date(Date.now()),
            }
            
            await this.$store.dispatch('post/addComment', {postOwnerId: this.postOwnerId, slug: this.$route.params.postSlug, commentData: commentData})
            
            this.replyLoading = false;

            this.forceUpdate += 1;
            this.comment.replyCount += 1;

          }else {
            this.$message.error('You should type something.')
          }
        }else {
          this.$message.error('You can\'t break the rules.')
        }
      }else {
        this.$message.warning('Slow Down !!!')
      }
      this.showReplies = true;
    }
  },
  computed: {
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
  },
  async fetch(){

    const user = await this.$store.dispatch('user/fetchUser', this.comment.uid)
    this.commentOwner = user.data();

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