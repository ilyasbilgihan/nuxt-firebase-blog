rmdir public /s /q
mkdir public
mkdir public\_nuxt
xcopy .nuxt\dist\client public\_nuxt /e
xcopy static public /e