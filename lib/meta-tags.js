
export default function(metaData){
  const metas = [
    { hid: 'twitter:title', name: 'twitter:title', content: metaData.title},
    { hid: 'twitter:description', name: 'twitter:description', content: metaData.description},
    { hid: 'twitter:image', name: 'twitter:image', content: metaData.image},
    { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: metaData.imageAlt},
    { hid: 'twitter:url', name: 'twitter:url', content: metaData.url},

    { hid: 'og:title', name: 'og:title', content: metaData.title},
    { hid: 'og:description', name: 'og:description', content: metaData.description},
    { hid: 'og:image', name: 'og:image', content: metaData.image},
    { hid: 'og:image:alt', name: 'og:image:alt', content: metaData.imageAlt},
    { hid: 'og:url', name: 'og:url', content: metaData.url},
  ]
  return metas;
}