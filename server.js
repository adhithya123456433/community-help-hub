// CommunityHelp Hub - Full-Stack Web Application Entry Point
// Delegating to server/server.js for root execution and hosting compatibility
module.exports = require('./server/server');

if (require.main === module) {
  require('./server/server');
}
