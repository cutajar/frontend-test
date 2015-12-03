var keyMirror = require('keymirror');
module.exports = {  
  ActionTypes: keyMirror({
    CREATE_COUNTER: null,
    REMOVE_COUNTER: null,
    CHANGE_COUNT: null,
    GET_COUNTERS: null,
  }),
  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
 };