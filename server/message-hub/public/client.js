$(document).ready(function() {

   

        console.log("initSocketIO");

        /*
         Connect to socket.io on the server.
         */
        var host = "localhost:5000";
        //By using diifferent namespaces we can use one websocket connection even if we have several rooms
        var socket = io.connect(document.location.origin + '/mynamespace', {
            reconnect: false,
            'try multiple transports': false
        });


        //var socket = io(document.location.origin + '/mynamespace');
        var start = new Date();
    
         // on connection to server, ask for user's name with an anonymous callback
         socket.on('connect', function(){
             console.log("CONNECTED");
            var index = socket.io.engine.upgrade ? 1 : 0;
            $('#connection').text('Connection established in ' + (new Date() - start) + 'msec. ' +
                'SocketID: ' + socket.id + '. ' +
                'You are using ' + socket.io.engine.transports[index] + '.');
            $('input').removeAttr('disabled');
            $('button').removeAttr('disabled');
            console.log("#CONNECTION");
            
        });


        var intervalID;
        var reconnectCount = 0;

      
        socket.on('connecting', function() {
            console.log('connecting');
        });
        socket.on('disconnect', function() {
            console.log('disconnect');
            intervalID = setInterval(tryReconnect, 4000);
        });
        socket.on('connect_failed', function() {
            console.log('connect_failed');
        });
        socket.on('error', function(err) {
            console.log('error: ' + err);
        });
        socket.on('reconnect_failed', function() {
            console.log('reconnect_failed');
        });
        socket.on('reconnect', function() {
            console.log('reconnected ');
        });
        socket.on('reconnecting', function() {
            console.log('reconnecting');
        });

        var tryReconnect = function() {
            ++reconnectCount;
            if (reconnectCount == 5) {
                clearInterval(intervalID);
            }
            console.log('Making a dummy http call to set jsessionid (before we do socket.io reconnect)');
            $.ajax('/')
                .success(function() {
                    console.log("http request succeeded");
                    //reconnect the socket AFTER we got jsessionid set
                    io.connect('http://' + host, {
                        reconnect: false,
                        'try multiple transports': false
                    });
                    clearInterval(intervalID);
                }).error(function(err) {
                    console.log("http request failed (probably server not up yet)");
                });
        };

        var container = $('div#msgs');

        /*
         When a message comes from the server, format, colorize it etc. and display in the chat widget
         */
        socket.on('my-channel', function(msg) {

            console.log("got the message on the client side", msg);
            var message = JSON.stringify(msg);
            //message = JSON.parse(message);
          
        }); 

        socket.on('announcements', function(msg) {
            
            console.log("Reached announcements", msg);
            $("textarea#announcementsMessage").val(msg);           
                      
         }); 
    
        socket.on('message-all', function (data) {
            $('#message-all > ul').append('<li>' + new Date().toString() + ': ' + data + '</li>');
        });
    
        socket.on('message-room', function (data) {
            console.log("MESSAGE ROOM", data);
            $('#message-room > ul').append('<li>' + new Date().toString() + ' - room ' + data.room + ' : ' + data.message + '</li>');
        });
    
        $('#b-all').click(function () {
            var text = $('#i-all').val();
            if (text.length > 0) {
                socket.emit('message-all', text);
                $('#i-all').val('');
            }
        });
    
        $('#b-join').click(function () {
            var text = $('#i-join').val();
            if (text.length > 0) {
                socket.emit('join', text);
                $('#i-join').val('');
            }
        });
    
        $('#b-room').click(function () {
            var room = $('#i-room-name').val();
            var message = $('#i-room-message').val();
            $('#i-room-name').val('');
            $('#i-room-message').val('');
    
            if (room.length > 0 && message.length > 0) {
                socket.emit('message-room', {
                    room: room,
                    message: message
                });
            }
        });
});