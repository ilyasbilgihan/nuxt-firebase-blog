let admin = require("firebase-admin");
let gConfig = process.env.GOOGLE_CONFIG_BASE64;

if(!admin.apps.length){

  let googleConfig = JSON.parse(Buffer.from(gConfig, 'base64').toString('ascii'))

  admin.initializeApp({
    credential: admin.credential.cert(googleConfig),
    databaseURL: "https://nuxt-blog-exercise-default-rtdb.europe-west1.firebasedatabase.app"
  });
  
}


export const generateDynamicRoutes = async () => {
  let postRoutes = []
  let tagRoutes = []
  let userRoutes = []

  const posts = await admin.firestore().collectionGroup('posts').where('published', '==', true).orderBy('createdAt', 'desc').get();
  for(let i = 0; i < posts.docs.length; i++){
    const post = posts.docs[i].data();
    const user = await admin.firestore().doc(`users/${post.uid}`).get();
    
    if(userRoutes.indexOf(user.data().username) == -1){
      userRoutes.push(user.data().username)
    }

    for(let j = 0; j < post.tagSlugs.length; j++){
      if(tagRoutes.indexOf('/tag/'+ post.tagSlugs[j]) == -1){
        tagRoutes.push('/tag/'+ post.tagSlugs[j])
      }
    }
    postRoutes.push(`${user.data().username}/${post.slug}`)

  }

  let combinedRoutes = [...postRoutes, ...tagRoutes, ...userRoutes]
  let routeObjs = combinedRoutes.map((route) => {
    return {
      url: route
    }
  })
  return routeObjs
}