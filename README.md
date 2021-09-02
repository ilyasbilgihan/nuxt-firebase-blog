# Nuxt Firebase Blog

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

## About this application
This is a fully functional social blog application. The main idea is its functionality, so I didn't keep myself busy that much with design stuff. I also wrote some security rules for firestore, but there are still small security issues, I will share them in a different file too. Lastly, I tried my best to make the app SEO friendly. For instance: Nuxt supports meta tags in every page, All the dynamic pages have different meta tags according to the page's content(ex. post title, post image, post description, user's profile picture, user's display name etc. ).

<a href="https://nuxt-firebase-blog.herokuapp.com/" target="_blank" title="Nuxt Firebase Blog">Live Demo</a>

### List of the features
- Create accounts, change account informations (location, profession, bio, display name, username, profile picture, cover image).
- Every user have a public profile page which includes a list of the posts the user have published, a cover image of the user, user informations and a secret 'unpublished posts' section that only shown to the page's owner.
- Write posts, delete posts, edit posts (description, content, post image, published status).
- Like posts, add/remove posts to your bookmarks.
- Follow/Unfollow people, list the posts of the ones you follow.
- List the posts by their tags (Max of 5 tag is supported for each post).
- Write comments, up/down vote comments, delete comments, edit comments(content), inspect comments' edit history.

