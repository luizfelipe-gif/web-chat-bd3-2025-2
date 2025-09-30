const express = require('express');
const ejs = require('ejs');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile)
app.use('/', (request, response) => {
   response.render('index.html');
});

function conectDB() {
   let dbUrl = 'mongodb+srv://luyvid:b5vltE5FMBGyCDFL@cluster0.xzpjdbb.mongodb.net/';
   mongoose.connect(dbUrl);
   mongoose.connection.on('error', console.error.bind(console, 'connection error'));

   mongoose.connection.once('open', function callback(){console.log('Funfoou!!')});
}

let mensagensGuardadas = [];

conectDB();

// Model representa uma tabela (entidade)
// View representa a visualização para o usuário
// Controller faz a conexão entre "View" & "Model"
// APRENDI ACIMA NA RECTASK
// É NOIS BEBÊ S2

// Message (abaixo) está criando uma Entidade
let Message = mongoose.model('Message', {usuario: String, data_hora: String, mensagem: String});

Message.find({})
      .then(docs => {  // docs representa o retorno do then
         console.log('DOCS:' + docs)
         mensagensGuardadas = docs;
         console.log('MESSAGES:' + mensagensGuardadas);
      }).catch(error => {
         console.log('ERRO:' + error)
      });

io.on('connection', socket => {
   console.log("ID de usuário conectado: " + socket.id);
   socket.emit("previousMessage", mensagensGuardadas);
   socket.on("sendMessage", data => {

      // mensagensGuardadas.push(data);

      let mensagemAtual = new Message(data);

      // socket.broadcast.emit('receivedMessage', data)

      mensagemAtual
      .save()
      .then(socket.broadcast.emit('receivedMessage', data)).catch(error => {console.log('ERRO: ' + error)});
   });
});

server.listen(3000, () => {
   console.log("Servidor rodando em - http://localhost:3000")
});