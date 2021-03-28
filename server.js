require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Comments = require('./models/commentModel')


const app = express()
app.use(express.json())
app.use(cors())

const http = require('http').createServer(app)
const io = require('socket.io')(http)

//socketIo
let users = []
io.on('connection', socket => {
    console.log(socket.id + 'connected.')

    socket.on('joinRoom', id => {
        const user = {userId: socket.id, room: id}

        const check = users.every(user => user.userId !== socket.id)

        if(check){
            users.push(user)
             socket.join(user.room)
        }else{
            users.map(user => {
                if(user.userId === socket.id){
                    if(user.room !== id){
                        socket.leave(user.room)
                        socket.join(id)
                        user.room = id
                    }
                }
            })
    
        }

        
        // console.log(users)
        // console.log(socket.adapter.rooms)
    })

    socket.on('createComment', async msg => {
        console.log(msg)
        const {username, content, product_id, createdAt, rating} = msg

        const newComment = new Comments({
            username, content, product_id, createdAt, rating
        })

        await newComment.save()

        io.to(newComment.product_id).emit('sendCommentToClient', newComment)

    })

    socket.on('disconnected', () => {
        console.log(socket.id + 'disconnected.')
    })
})


// Routes
app.use('/api', require('./routes/productRouter'))
app.use('/api', require('./routes/commentRouter'))


// Connection to mongodb
const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useCreateIndex: true ,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, err => {
    if(err) throw err ;
    console.log('Connected to mongodb')
})


app.get('/', (req, res) => {
    res.json({ msg: 'Welcome to the front page of my e-commerce site. We will do it IN SHA ALLAH' });
});


// Listen server
const PORT = process.env.PORT || 3000 
http.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})