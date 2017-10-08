/**
 * Created by hossein on 2017/09/27.
 */
var socket = require('socket.io');

module.exports = {
  setSocket: function (server) {
    socket = socket(server);
  },
  getSocket: function () {
    return socket;
  }
  
};

//
//
// function _setupSocketIo(server) {
//
//   var io = require('socket.io')(server);
//
//   io.on('connection', function(socket) {
//     _connected();
//     // io.emit("my-channel", {message: "some message"});
//     // socket.on("my-channel", (message) => {
//     //     console.log("got the message", message);
//     // });
//     // /*
//     //  When the user sends a chat message, publish it to everyone (including myself) using
//     //  Redis' 'pub' client we created earlier.
//     //  Notice that we are getting user's name from session.
//     //  */
//     // socket.on('chat', function(data) {
//     //     var msg = JSON.parse(data);
//     //     var reply = JSON.stringify({
//     //         action: 'message',
//     //         user: socket.handshake.session.user,
//     //         msg: msg.msg
//     //     });
//     //     console.dir(reply);
//     //     // pub.publish('chat', reply);
//     //     socket.emit(channel, message);
//     // });
//     //
//     // /*
//     //  When a user joins the channel, publish it to everyone (including myself) using
//     //  Redis' 'pub' client we created earlier.
//     //  Notice that we are getting user's name from session.
//     //  */
//     // socket.on('join', function() {
//     //     var reply = JSON.stringify({
//     //         action: 'control',
//     //         user: socket.handshake.session.user,
//     //         msg: ' joined the channel'
//     //     });
//     //      console.dir(reply);
//     //     pub.publish('chat', reply);
//     // });
//
//     // /*
//     //  Use Redis' 'sub' (subscriber) client to listen to any message from Redis to server.
//     //  When a message arrives, send it back to browser using socket.io
//     //  */
//     // sub.on('message', function(channel, message) {
//     //     socket.emit(channel, message);
//     // });
//   })
//
//
// }