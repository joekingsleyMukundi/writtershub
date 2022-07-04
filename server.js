const app = require('express')()
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')
const flash = require('connect-flash')
const session = require('express-session')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)
const port = process.env.PORT || 3000

const employer_job_routes = require('./routes/employer/employer-job-routes')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))
app.use(flash())

// app.use(admin)
/*
  employer routes:
    employer posts a job and comunicate with admin in creating  and publishing a job
    employers cannotb work  as free lancers

*/
app.use(employer_job_routes)
// app.use(freelancer)

server.listen(port,()=>{
  console.log(`server live at port ${port}`);
})

