const request = require('request')
const cheerio = require('cheerio')
const async = require('async')
const fs = require('fs')
const comicIndex = '25411'
let pageNum = 0;
let comicHTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>14577</title>
  </head>
  <body>
    <div id="app">
`

getIndexs(`http://dmeden.net/comicinfo/${comicIndex}.html`, (indexs) => {
  async.map(indexs, (index, callback) => {
    getPages(index, (pages) => {
      async.map(pages, (page, callback) => {
        getImage(index, page, (image) => {
          callback(null, image)
        })
      }, (err, results) => {
        callback(null, [].concat.apply([], results))
      })
    })
  }, (err, results) => {
    [].concat.apply([], results).forEach(item => {
      console.log(item)
      pageNum += 1
      const file = fs.createWriteStream(`${pageNum}.jpg`)
      request(item).pipe(file)
      comicHTML += `<img src="./${pageNum}.jpg">`
    })
    comicHTML += `
        </div>
      <style>
        #app {
          max-width: 1200px;
          margin: 0 auto;
        }
        img {
          width: 100%;
          margin-bottom: 20px;
        }
      </style>
    </body>
    </html>
    `
    let htmlFile = fs.createWriteStream(`${comicIndex}-comic.html`)
    fs.writeFile(`${comicIndex}-comic.html`, comicHTML)
  })
})



function getImage(index, page, callback) {
  var page = page
  var index = index
  request(`http://dmeden.net/comichtml/${index.id}/${page}.html?s=8`, (err, res, body) => {
    if(err){
        callback('')
    }else{
      var $ = cheerio.load(body)
      callback('http://100.94201314.net/dm05/' + unsuan($('img').attr('name')))
    }
  })
}

function getPages(index, callback) {
  request(`http://dmeden.net/comichtml/${index.id}/1.html?s=8`, (err, res, body) => {
    var $ = cheerio.load(body)
    var pages = $('#iPageHtm a').map((index, obj) => {
      return $(obj).text()
    }).get()
    callback(pages);
  })
}

function getIndexs(commic, callback) {
  request(commic, (err, res, body) => {
    var $ = cheerio.load(body)
    var indexs = $('.l_s').map((index, obj) => {
      return {
        id: $(obj).attr('href').match(/ID=(\d+)&/)[1],
        title: $(obj).text()
      }
    }).get()
    callback(indexs)
  })
}



function unsuan(s) {
  sw = "jmmh.net|dmeden.com|dmeden.net";
  su = 'dmeden.net';
  b = false;
  for (i = 0; i < sw.split("|").length; i++) {
    if (su.indexOf(sw.split("|")[i]) > -1) {
      b = true;
      break
    }
  }
  if (!b)
    return "";
  x = s.substring(s.length - 1);
  w = "abcdefghijklmnopqrstuvwxyz";
  xi = w.indexOf(x) + 1;
  sk = s.substring(s.length - xi - 12, s.length - xi - 1);
  s = s.substring(0, s.length - xi - 12);
  k = sk.substring(0, sk.length - 1);
  f = sk.substring(sk.length - 1);
  for (i = 0; i < k.length; i++) {
    eval("s=s.replace(/" + k.substring(i, i + 1) + "/g,'" + i + "')")
  }
  ss = s.split(f);
  s = "";
  for (i = 0; i < ss.length; i++) {
    s += String.fromCharCode(ss[i])
  }
  return s
}