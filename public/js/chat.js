var socket = io();
var messages = document.getElementById("messages");

(function() {
  $("form").submit(function(e) {
    let li = document.createElement("li");
    e.preventDefault(); // prevents page reloading
    socket.emit("group creation", $("#message").val());

    messages.appendChild(li).append($("#message").val());
    let span = document.createElement("span");
    messages.appendChild(span).append("by " + "Anonymous" + ": " + "just now");

    $("#message").val("");

    return false;
  });

  $('#uploadfile').bind('change', function(e){
    var data = e.originalEvent.target.files[0];
    console.log(data)
    readThenSendFile(data);
  });

  function readThenSendFile(data){

    var reader = new FileReader();
    reader.onload = function(evt){
      var msg ={};
      msg.size = data.size;
      msg.file = evt.target.result;
      msg.fileName = data.name;
      socket.emit('base64 file', msg);
    };
    reader.readAsDataURL(data);
  }


  socket.on("received", data => {
    let li = document.createElement("li");
    let span = document.createElement("span");
    var messages = document.getElementById("messages");
    messages.appendChild(li).append(data.message);
    messages.appendChild(span).append("by " + "anonymous" + ": " + "just now");
    console.log("Hello bingo!");
  });
})();

socket.on("image", function(image, buffer) {
  if(image)
  {
    console.log(" image: from client side");
    // code to handle buffer like drawing with canvas** <--- is canvas drawing/library a requirement?  is there an alternative? another quick and dirty solution?
    console.log(image);
    // what can we do here to serve the image onto an img tag?
  }

});

// fetching initial chat messages from the database
(function() {
  fetch("/chats")
    .then(data => {
      return data.json();
    })
    .then(json => {
      json.map(data => {
        let li = document.createElement("li");
        let span = document.createElement("span");
        messages.appendChild(li).append(data.message);
        messages
          .appendChild(span)
          .append("by " + data.sender + ": " + formatTimeAgo(data.createdAt));
      });
    });
})();

//is typing...

let messageInput = document.getElementById("message");
let typing = document.getElementById("typing");

//isTyping event
messageInput.addEventListener("keypress", () => {
  socket.emit("typing", { user: "Someone", message: "is typing..." });
});

socket.on("notifyTyping", data => {
  typing.innerText = data.user + " " + data.message;
  console.log(data.user + data.message);
});



//stop typing
messageInput.addEventListener("keyup", () => {
  socket.emit("stopTyping", "");
});

socket.on("notifyStopTyping", () => {
  typing.innerText = "";
});
