// function for auto resizing textarea taken from Stack Overflow
var name = 'not changed yet';

// Socket.io
var socket = io('/');

// adds a new user to the DOM when someone joins
function userStat(name, conn){
  var elem = document.createElement('p');
  elem.innerText = `${name} ${conn}`;
  elem.style.margin = '10px 0 10px 0';
  document.getElementById('msg-content').append(elem);
  updateHeight();
}

function init(){
  name = document.getElementById('name').textContent.split(' joined!')[0];
  // prompts for a name and emits that to all users
  socket.emit('new-user', name);
  userStat('You', 'joined');
  if (window.attachEvent) {
    var observe = function(element, event, handler) {
      element.attachEvent('on' + event, handler);
    };
  } else {
    var observe = function(element, event, handler) {
      if(element){
        element.addEventListener(event, handler, false);
      }
    };
  }

  var text = document.getElementById('text');

  function resize() {
    text.style.height = 'auto';
    text.style.height = text.scrollHeight + 'px';
  }
  /* 0-timeout to get the already changed text */
  function delayedResize() {
    window.setTimeout(resize, 0);
  }

  observe(text, 'change', resize);
  observe(text, 'cut', delayedResize);
  observe(text, 'paste', delayedResize);
  observe(text, 'drop', delayedResize);
  observe(text, 'keydown', delayedResize);

  if(text){
    text.focus();
    text.select();
    resize();
  }
}

// checks when text is submitted
document.addEventListener('submit', function(e) {
  e.preventDefault();
  if(document.getElementById('text-msg').value !== ''){
    socket.emit('chat message', document.getElementById('text-msg').value);
    appendMessage({name: name, msg: document.getElementById('text-msg').value}, 'right');
    updateHeight();
    document.getElementById('text-msg').value = '';
  };
  return false;
});

//when a message is sent
socket.on('chat message', function(data) {
  appendMessage(data, 'left');
  updateHeight();
});

//when a new user connects
socket.on('user-connected', function(name) {
  userStat(name, 'joined');
  updateHeight();
});

//when a user disconnects
socket.on('user-disconnected', function(name) {
  userStat(name, 'disconnected');
  updateHeight();
});

// appends the message to the body
var msg_ID = 0;
function appendMessage(data, side){
  console.log(data);
  var parentDiv = document.createElement('div');
  parentDiv.className += "msg-holder";
  parentDiv.id = `msg_${msg_ID}`
  document.getElementById('msg-content').append(parentDiv);

  var msgDiv = document.createElement('div');
  msgDiv.className += `msg ${side}`;
  var message = `${data.name}: ${data.msg}`;
  msgDiv.innerHTML += message;
  document.getElementById(`msg_${msg_ID}`).append(msgDiv);

  msg_ID += 1;
};

// keeps the chat content area pinned to bottom so that you can see when someone sends a new message
function updateHeight(){
  var messageBody = document.getElementById('chat-content');
  if (messageBody) {
    messageBody.scrollTop = messageBody.scrollHeight;
  };
};
