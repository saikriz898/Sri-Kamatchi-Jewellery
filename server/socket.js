const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => callback(null, true),
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
      allowUpgrades: true,
      upgradeTimeout: 10000,
    });
  
    io.on('connection', (socket) => {
      console.log('🔗 Client connected to Socket.io:', socket.id);
      socket.on('disconnect', () => console.log('❌ Client disconnected'));
    });

    return io;
  },
  getIo: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  },
};
