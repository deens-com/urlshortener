// Domain you are using for your URL shortener
const domain = "https://dee.sn/"

// Domains that should not be used in iframes (example your main website)
const whitelist_domains = ['deens.com']

// Your Google Tag Manager code
const gtm = "GTM-XXXXXXX"


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {

  var url = new URL(request.url)
  var path = url.pathname.substr(1)
  var value

  if(/^https?:/i.test(path)){
    path = path.replace(':/', '://')
    value = {
      longUrl : path,
      title : "",
    } 

  } else {
    value = await SHORT_URLS.get(path)
    if (value === null) return new Response("Value not found", {status: 404})

    value = JSON.parse(value)
    console.log(value.isFrameable, value.longUrl, value.title)

    // If the destination is not frameable or whitelisted, simply redirect
    if (value.isFrameable == false || (new RegExp( '\\b' + whitelist_domains.join('\\b|\\b') + '\\b') ).test(value.longUrl)) return Response.redirect(value.longUrl, 301)
  }
  
  // Get favicon URL
  let longUrl = new URL(value.longUrl)
  let favicon = longUrl.protocol + '//' + longUrl.host + '/favicon.ico'

  // If the destination is frameable, add GTM and iframe
  let html = '<html><head>'
  + "<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KCZ877D');</script><!-- End Google Tag Manager -->"
  + '<title>'+ value.title +'</title>'
  + '<link rel="icon" href="'+ favicon +'"/>'
  + '<style type="text/css">HTML, body {margin: 0px; padding: 0px; border: 0px;}</style>'
  + '<script type="text/javascript">history.pushState("display iframe url", "'+ value.title +'", "'+ domain + longUrl.protocol + '//' + longUrl.host + longUrl.pathname +'");</script>'
  + '</head><body>'
  + '<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id='+ gtm +'" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->'
  + '<iframe name="long-url" src="'+ value.longUrl +'" style=\'height: 100%; width: 100%;\' frameborder="0" id="long-url"></iframe>'
  + '</body></html>'

  let response = new Response(html)
  response.headers.set('Content-Type', 'text/html')

  return response
}