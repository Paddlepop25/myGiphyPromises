// load the 4 libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

// configure the PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;
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
      limit: 3,
      // rating: 'g',
      // lang: 'en'
      // if want the next 3, change limit and use offset
      // offset: 10
    }
    )
    // search Giphy, use await
    let result = await fetch(url)
    // console.info('result ------> ', result)
    try {
      const giphys = await result.json()
      // console.info(giphys)
      let allGiphys = []
      for (var key of Object.keys(giphys['data'])) {
        allGiphys.push(giphys['data'][key].images.fixed_height.url);
        // console.info(searchedGiphys.length);
        console.info(allGiphys);
      }
      res.status(200)
      // res.type('text/html')
      res.render('giphy', {
        allGiphys: allGiphys
      })
      // res.send(searchedGiphys)
      // res.send(searchedGiphys, allGiphys)
    } catch (err) {
      console.error('Error ----------------->', err)
      return Promise.reject(err)
    }
  }
)

// start application only if API_KEY is available
if (API_KEY) {
  app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`)
  })
}
else {
  console.error('API_KEY is not set')
} 