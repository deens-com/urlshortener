  /***********************************************************************************/
 /*** START *** Don't copy these lines to Zapier, they are used for local testing ***/
/***********************************************************************************/

// Zapier already includes node-fetch
const fetch = require("node-fetch")

// Bind this in Zapier
const inputData = { text : "Plan your next dream trip with deens https://deens.com/trips/create" }

/*********************************************************************************/
 /*** END *** Don't copy these lines to Zapier, they are used for local testing ***/
  /*********************************************************************************/



// Domain you are using for your URL shortener
const domain = "https://dee.sn/"

// URl's you don't want shortened in regex format
const doNotShorten = [
  /^https:\/\/deens.com\/?$/i,
  /^https:\/\/dee.sn\/?$/i
]

// The length of the path of your shortened links
const shortIdLength = 5

// Change with your CloudFlare info | see here: https://developers.cloudflare.com/workers/kv/writing-data/
const cf = { 
  apiUrl : "https://api.cloudflare.com/client/v4",
  accountId : "YOUR ACCOUNT ID",
  namespaceId : "YOUR NAMESPACE ID",
  email : "YOUR EMAIL",
  apiKey : "YOUR API KEY"
}



// Preparing CloudFlare API URL
cf.requestUrl = cf.apiUrl
  + "/accounts/" + cf.accountId
  + "/storage/kv/namespaces/" + cf.namespaceId
  + "/values/"


// Detect and shorten all URLs in a given text
async function shortenUrls(text) {

  var urls = text.match(/\b(https?:\/\/\S+)\b/g)

  if(!urls) return []

  const promises = urls.map(async (url) => {

    if(doNotShorten.some(rx => rx.test(url))) return false
    
    let options = await parseUrl(url)
    options.longUrl = url

    let shortId = await generateUniqueShortId(options)
    options.shortUrl = domain + shortId

    return shortId != false ? options : false
    
  })

  return await Promise.all(promises)
}

// Parse a url title and detect if it can be included in an iframe
async function parseUrl(url) {
  return fetch(url)
    .then(async function(response){

      // Parse Headers
      let frameOptions = await response.headers.get('X-Frame-Options') + ' ' + response.headers.get('Content-Security-Policy')
      let isFrameable = ((/deny/i).test(frameOptions) || (/sameorigin/i).test(frameOptions) || (/frame-ancestors/i).test(frameOptions)) ? false : true

      // Parse Title
      let body = await response.text()
      let titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i)
      let title = titleMatch == null ? "" : titleMatch[1]

      return {isFrameable : isFrameable, title: title}
    })

}

// Replace given URLs in a given text
function replaceUrls(text, urls) {
  urls.forEach(function(url) {
    text = text.replace(url.longUrl, url.shortUrl)
  })
  return text
}

// Generate an ID not already in use and save it
async function generateUniqueShortId(value) {
  let shortId
  var exist = true

  while(exist == true) {
    shortId = generateShortId()
    exist = await keyExists(shortId)
  }

  let saveUrl = await addKV(shortId, value)
  return saveUrl == true ? shortId : false
}

// Generate a random Base62 ID
function generateShortId() {
  const base62chars = [..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"]
  return base62chars.sort(() => .5 - Math.random()).slice(0,shortIdLength).join('')
}

// Add a Key/Value pair in CloudFlare
async function addKV(key, value) {
  const response = await fetch(cf.requestUrl + key, {
    method: 'put',
    body:    JSON.stringify(value),
    headers: { 'X-Auth-Email': cf.email, 'X-Auth-Key': cf.apiKey},
  })
  return response.status == 200 ? true : false
}

// Reads a given key to find out if it exists
async function keyExists(key) {
  const response = await fetch(cf.requestUrl + key, {
    method: 'get',
    headers: { 'X-Auth-Email': cf.email, 'X-Auth-Key': cf.apiKey},
  })
  return response.status == 200 ? true : false
}

return output = shortenUrls(inputData.text)
  .then(urls => replaceUrls(inputData.text, urls))
  .then(newText => {console.log('newText: ', newText); return {newText : newText}})

