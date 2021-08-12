
import cookieparser from "cookieparser";

export const actions = {
  nuxtServerInit({ commit, dispatch }, { req }) {
	  
	// nuxtServerInit is the first hook of Nuxt's Lifecycle hooks
	// When user open the app or reload(f5) the page, Nuxt calls this hook first,
	// So we can control our 'user_data' cookie (which we would set it when user logged in), 
	// If 'user_data' exists then we will commit our 'auth/setUser' mutation and set the user,
	// Thus, it will provide us a server-side like auth system.
	
	// To see the difference, comment out this hook (nuxtServerInit) block and reload the page when logged in. 

    if (process.server && process.static) return;
    if (!req.headers.cookie) return;

    const parsed = cookieparser.parse(req.headers.cookie);
    const userData = parsed.user_data;

    if (!userData) return;

    let userObj = JSON.parse(userData);
    if (!userObj) return;

    commit('auth/setUser', {user: userObj, info: 'user mutated from nuxtServerInit'})
  },
};