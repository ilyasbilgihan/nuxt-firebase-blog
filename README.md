<h1 align="center">Nuxt Firebase Blog</h1>

<p align="center">
  <img width="256" height="256" src="https://firebasestorage.googleapis.com/v0/b/nuxt-blog-exercise.appspot.com/o/external%2Fbig-logo.png?alt=media&token=bb5e45d2-0909-46cc-a25b-3e9adac0a28c" />
</p>

## About this application
This is a fully functional social blog application. The main idea is its functionality, so I didn't keep myself busy that much with design stuff. I also wrote some security rules for firestore, but there are still small security issues, I will share them in a different file too.

<a href="https://github.com/ilyasbilgihan/nuxt-firebase-blog/blob/main/firestore.rules" target="_blank" title="Firebase Firestore Security Rules">Firestore security rules</a> (I am really new to writing security rules, Please inform me if you come across an insecure rule)

<a href="https://nuxt-blog-exercise.web.app/" target="_blank" title="Nuxt Firebase Blog">Live Demo</a>
<br>
<br>
<br>
**UPDATE 2023**
You may want to take a look at a similar repo which uses Next.js, Supabase and Prisma below.

<a href="https://github.com/ilyasbilgihan/next-supabase-blog" target="_blank" title="Next Supabase Blog">Next Supabase Blog</a>
<br>


## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# serve with hot reload at 0.0.0.0 (Your static IP)
$ npm run dev:host

# build for production and launch server
$ npm run build
$ npm run start

# install firebase
$ npm install -g firebase-tools
$ firebase login
$ firebase init

# after initialization of your firebase app, run the following command to deploy the project to firebase with ssr (blaze plan only)
$ firebase deploy

```


### List of the features
- Create accounts, change account informations (location, profession, bio, display name, username, profile picture, cover image).
- Every user has a public profile page which includes a list of the posts that the user has published, a cover image of the user, user informations and a secret 'unpublished posts' section that only shown to the page's owner.
- Write posts, delete posts, edit posts (description, content, post image, published status).
- Like posts, add/remove posts to your bookmarks.
- Follow/Unfollow people, list the posts of the ones you have followed.
- List the posts by their tags (Max of 5 tag is supported for each post).
- Write comments, up/down vote comments, delete comments, edit comments(content), inspect comments' edit history.
- Mobile friendly as much as I could handle.

<br>

## Reach me
**[twitter/@ilyasbilgihan](https://twitter.com/ilyasbilgihan)**

**[instagram/@ilyasbilgihan](https://instagram.com/ilyasbilgihan)**

**ilyasbilgihan@gmail.com**
