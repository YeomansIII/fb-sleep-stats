var _ = require('lodash');
var config = require('config');
var fbCookie = config.get('fbCookie');
var fbSleep = require('fb-sleep');
var userService = require('./src/server/services/user');
var piGlow = require('piglow');
var TEN_MINUTES = 1000 * 60 * 10;

function getRandomDelay() {
  var delay = _.random(TEN_MINUTES * 0.9, TEN_MINUTES);
  return delay;
}

function getAndSaveUsers(config, since) {
  fbSleep.getRecentlyActiveUsers(config, since)
    .then(function(users) {
      var count = users.length;
      console.log(new Date().toLocaleString(), ' - ', count, 'active users');
      piGlow(function(error, pi) {
        pi.reset;
        if (count >= 10) {
          pi.all = 20;
        } else if (count >= 5) {
          pi.startTransaction();
          pi.ring_5 = 20;
          pi.ring_4 = 15;
          pi.ring_3 = 10;
          pi.commitTransaction();
        } else {
          pi.ring_5 = 20;
        }
      });
      return userService.saveUsers(users);
    })
    .catch(function(err) {
      console.error(new Date().toLocaleString(),
        ' - Could not get users:', err.message, err.statusCode);
      piGlow(function(error, pi) {
        pi.reset();
        pi.ring_0 = 20;
      });
    })
    .then(function() {
      var since = Date.now();
      setTimeout(getAndSaveUsers, getRandomDelay(), config, since);
    })
    .done();
}

getAndSaveUsers(fbCookie, Date.now() - TEN_MINUTES);
