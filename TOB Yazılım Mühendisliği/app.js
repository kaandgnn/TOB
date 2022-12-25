const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const socket = require('socket.io')(server);   
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb+srv://melkorsheir:1e65bb7d35@siu.ysxjl.mongodb.net/' 
const ObjectId = require('mongodb').ObjectID;
let user, joinAnnounceFor
let announceList = []  
let myAnnounceList = [] //maç bilgileri için array oluşturdum


app.set('views', path.join(__dirname, 'views')) //şablon yolu değiştirme const path i eklemek zorundasın
app.set('view engine', 'ejs') //Express ile geliştirilen projeye şablon motoru eklemek için set metodu view engine değeri 
app.use(express.static('./public')) //public dizin klasör neyse işte statik bilgilere erişim
app.use('/images', express.static(path.join(__dirname, 'public/images')));//imagedaki statik bilgilere erişim
app.use(express.json())
app.use(express.urlencoded())//body parser

// app.get yönlendirmelerini router yardımıyla düzelt!!!!!

app.get('/', (req, res) => {
    res.render('pages/index') 
    //express js dosyayı şablon motoru olarak htmle çevirmek için render metodu kullanır bu insan işi açıklama 
    //siteye üstten tıklayınca yönlendirip sayfayı açmanı sağlıyo bu da benim açıklama
})

app.get('/signup', (req, res) => {
    res.render('pages/signup')
}) 

app.post('/signup', (req, res) => {
    data = {
        teamName: req.body.teamName,
        phoneNumber: req.body.phoneNumber,
        eMail: req.body.eMail
    }
    database.collection("Team").insertOne(data, function (error, result) {
        if (error) throw error
    }) // Team tablosuna Takım bilgilerini eklemek
    res.redirect('/')
})// teamName phoneNumber ve eMail i alıp databaseye atıp redirect ile anasayfaya yollamak

app.get('/login', (req, res) => {
    res.render('pages/login')
})

app.post('/login', (req, res) => {
    data = {
        eMail: req.body.eMail,
        phoneNumber: req.body.phoneNumber,
    }
    database.collection("Team").findOne({ eMail: data.eMail, phoneNumber: data.phoneNumber }, function (error, result) {
        if (error) throw error
        if (result == null) res.render('pages/error')
        else {
            res.redirect('/myAnnounceList')
            user = result
        }
    })
})// eMail ve phoneNumber alınıp bunun kontrolü yapılıyor null ise error veriyor ve result usera setleniyor

app.get('/announce', (req, res) => {
    res.render('pages/announce')
})

app.get('/joinAnnounce', (req, res) => {
    res.render('pages/joinAnnounce', { 'joinAnnounceFor': announceList[joinAnnounceFor] }) 
}) 

app.post('/joinAnnounce', (req, res) => {
    data = {
        playerName: req.body.playerName,
        playerWeight: req.body.playerWeight,
        playerHeight: req.body.playerHeight,
        playerPhoneNumber: req.body.playerPhoneNumber
    } // joinAnnounce sayfasında oyuncu bilgileri alındı req.body 
    let newValues = { $push: { 'data.submittion': { $each: [data], $position: (0) } } }
    database.collection("Announce").updateOne({ _id: announceList[joinAnnounceFor]._id }, newValues, function (error, result) {
        if (error) throw error
        res.redirect('/announceList')
    })
})

app.get('/announceList', (req, res) => {
    database.collection("Announce").find({}, {}).toArray((error, result) => {
        res.render('pages/announceList', { 'announceList': result })
        announceList = result
    })
})

app.get('/error', (req, res) => {
    res.render('pages/error')
})

app.post('/announce', (req, res) => {
    data = {
        matchLocation: req.body.matchLocation,
        matchDate: req.body.matchDate,
        position: req.body.position,
        teamID: user._id,
        teamName: user.teamName,
        submittion: []
    }
    database.collection("Announce").insertOne({ data }, function (error, result) {
        if (error) throw error
        res.redirect("/myAnnounceList")
    }) // Announce tablosuna ekleme yapılıyor
})

app.get('/myAnnounceList', (req, res) => {
    myAnnounceList = []
    database.collection("Announce").find({ "data.teamID": user._id }, {}).toArray((error, result) => {
        if (error) throw error
        myAnnounceList = [...result]
        res.render('pages/myAnnounceList', { 'myAnnounceList': result })
    })
}) // Announce tablosundan teamID yi alıp sonuca atıyorum ve myannouncelist sayfasında sonuç olarak gösteriyorum


socket.on("connection", (socket) => {
    socket.on("joinAnnounce", ({ data }) => {
        joinAnnounceFor = data
    })// Client’den Bağlantı Yakalayıp gelen dataları veriyi almak
})

socket.on("connection", (socket) => {
    socket.on("deleteAnnounce", ({ data }) => {
        deleteAnnounceFor = data
        database.collection("Announce").deleteOne({ "_id": myAnnounceList[deleteAnnounceFor]._id }, (error, result) => {
            if (error) throw error
        })
    })
}) // Client’den Bağlantı Yakalayıp datayı siliyor

server.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
        if (error) throw error
        database = client.db("NightWatch")
        console.log("Connected to `" + "deneme" + "`!")
    })   
    //sunucu ile bağlantı  !
}) 
