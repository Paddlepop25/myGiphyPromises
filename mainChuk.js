// load the 4 libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

// configure the PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const API_KEY = process.env.API_KEY || ""
const GIPHY_URL = 'https://api.giphy.com/v1/gifs/search'

// create an instance of express
const app = express()

// configure HBS
app.engine('hbs', handlebars({ defaultLayout: 'default.hbs' }))
app.set('view engine', 'hbs')

// configure app
app.get('/',
  (req, res) => {
    res.status(200)
    res.type('text/html')
    res.render('index')
  }
)

// https://api.giphy.com/v1/gifs/search
// ?api_key=API_KEY
// &q=llama
// &limit=5
// &offset=0
// &rating=g
// &lang=en

app.get('/search',
  async (req, res) => {
    const search = req.query['search-term']
    console.info('searching for ---> ', search)

    // construct the url with the query parameters
    const url = withQuery(GIPHY_URL, {
      api_key: API_KEY,
      q: search,
      limit: 10,
    }
    )

    let result = await fetch(url)
    // console.info('result ------> ', result)
    const giphys = await result.json()
    // console.info(giphys)

    // valid javascript variables: start with _ or a or A

    // search Giphy, use await
    // const imgs = []
    // for (let d of giphys.data) {
    //   const title = d.title // will give error if not found
    //   // const title = d['title'] // will give null error if not found
    //   const url = d.images.fixed_height.url
    //   // other way of writing
    //   // url = d['images']['fixed_height']['url'] 
    //   imgs.push({ title, url }) // same as title: title and url: url
    // }

    // better way to 'loop'
    const imgs = giphys.data
      // .filter(
      //   d => {
      //     return !d.title.includes('f**k')
      //   })
      .map(
        (d) => {
          return { title: d.title, url: d.images.fixed_height.url }
        })

    // console.info(imgs)

    res.status(200)
    res.type('text/html')
    res.render('giphyChuk', {
      search, imgs,
      hasContent: imgs.length > 0
    })
  }
)

// to use styles in static folder
// app.use(express.static(__dirname + '/static'))
app.use(express.static(__dirname + '/static'))

// start application only if API_KEY is available
if (API_KEY) {
  app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`)
  })
}
else {
  console.error('API_KEY is not set')
} 

console.info('HEROKU PUSH')