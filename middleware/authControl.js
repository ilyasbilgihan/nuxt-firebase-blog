
const unallowedRegularRoutes = ['account', 'secret-slug', 'write-post', 'bookmarks'];
const unallowedAdminRoutes = ['admin-panel'];

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