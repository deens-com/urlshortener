# Serverless URL Shortener with Remarketing pixels or CTA
## Using Zapier + CloudFlare Workers + CloudFlare Workers KV + Google Tag Manager
If the destination URL can be put in an iframe, we add the GTM code and load it in an iframe. If it can't, then we just make a 301 redirection.

### Google Tag Manager
Google Tag Manager allows you to include JS code remotely in a web page. From there, you could include Google Analytics, or a CTA manager (I used Convertful)
1. Create a container and get the GTM code

### CloudFlare
1. Use a domain just for this purpose (or change the code)
2. [Create a namespace](https://developers.cloudflare.com/workers/kv/writing-data/) in Workers KV
3. In the worker editor ("Resources" tab), bind your namespace to the variable `SHORT_URLS`
4. In the worker editor ("Routes" tab), add a wildcard (eg. `dee.sn/*`
5. In the worker editor ("Script" tab) copy paste the content of `worker.js` - Don't forget to adjust the constants at the top and click "Deploy"

Note: CloudFlare requires you to enter DNS records for your domain even though you don't need them. So I just CNAME'd our main website

### Zapier
1. Create a Zap
2. Select your trigger (for example a new tweet)
3. Select the "Code" action (built-in)
4. Select "Run Javascript"
5. In the section "Input Data", add the variable "text" and map its value to a text containing URL's to shorten (eg. a tweet)
6. In the section "Code", copy and paste the content of `zapier.js` - Don't forget to adjust the constants at the top and click "Continue"

### Deens
Check us out, we have created a brilliant [trip planner](https://deens.com) so you can plan trips for you, your friends, your family or share it with the world!