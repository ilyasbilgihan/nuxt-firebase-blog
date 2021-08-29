
const unallowedRegularRoutes = ['account', 'write-post', 'bookmarks', 'feed'];
const unallowedAdminRoutes = ['admin-panel']; // Will not activated (in the near future).

export default ({route, store, redirect}) => {
  const currentPage = route.name;
  const user = store.getters['user/getUser'];
  

  if(user){

    if(!user.isAdmin && unallowedAdminRoutes.includes(currentPage)){
      redirect('/')
    }

  }else {

    if([...unallowedRegularRoutes, ...unallowedAdminRoutes].includes(currentPage)){
      redirect('/')
    }

  }
  
}