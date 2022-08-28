rmdir functions\nuxt /s /q
rmdir functions\helpers /s /q
del functions\nuxt.config.js
del functions\.env
mkdir functions\nuxt
mkdir functions\helpers
xcopy .nuxt functions\nuxt /e
xcopy nuxt.config.js functions
xcopy .env functions
xcopy helpers\generateDynamicRoutes.js functions\helpers