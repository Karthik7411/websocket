const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let users = []; // To store connected users

server.on('connection', (socket) => {
  let userName = ''; // Temporary storage for the connected user's name

  socket.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'name') {
      userName = parsedMessage.data; // Save the user's name
      users.push(userName); // Add the user to the list of connected users
      console.log(`User connected: ${userName}`);

      // Broadcast updated user list to all clients
      broadcastUserList();
    } else if (parsedMessage.type === 'message') {
      console.log(`Received message from ${userName}: ${parsedMessage.data}`);

      // Broadcast the message to all connected clients
      server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            user: userName,
            data: parsedMessage.data
          }));
        }
      });
    }
  });

  socket.on('close', () => {
    console.log(`User disconnected: ${userName}`);
    users = users.filter(user => user !== userName); // Remove the user from the list
    broadcastUserList(); // Update the user list for all connected clients
  });

  // Broadcast the list of connected users
  function broadcastUserList() {
    const userListMessage = JSON.stringify({
      type: 'userList',
      data: users
    });
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(userListMessage);
      }
    });
  }
});