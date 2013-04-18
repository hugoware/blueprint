

// kicks off the server and renders all
// views in the server

(function() {
  var $this = this
    , $fs = require('fs')
    , $sys = require('sys')

    , $timeout = 10000
    , $port = 8080
    , $server = null
    , $settings = __dirname + '/../settings.json'
    , $render_to = __dirname + '/../export/'
    , 

    // handles running child processes
    _start_process = require('child_process').exec,

    // find the project settings
    _read_settings = function() {
      var content = $fs.readFileSync( $settings )
        , settings = JSON.parse( content );
      $settings = settings;
    },

    // begins the rendering server
    _start_server = function() {
      var path = 'http-server ' + __dirname + '/../ -p ' + $port;
      $server = _start_process( path );
    },

    // stops the rendering server
    _stop_server = function() {
      if ($server) $server.kill();
    },

    // send off the pages to capture
    _start_capture = function() {
      var capture = [ 'default' ].concat( $settings.states ).join(',')
        , command = 'phantomjs ' + __dirname + '/capture.js ' + $port + ' ' + $settings.width + ' ' + $settings.format + ' ' + ( $settings['2x'] ? 'yes' : 'no' ) + ' "' + $render_to + '" ' + capture
        , options = { timeout: $timeout };

      // console.log('\n\n'+command+'\n\n');
      _start_process( command, options, _end );
    },

    // handles export
    _begin = function() {
      _read_settings();
      _start_server();
      _start_capture();
    },

    // stop running the application
    _end = function( error ) {
      if (error) console.log('Render failed: ' + error);
      else console.log('done');
      _stop_server();
    };

  // kick it off
  _begin();
})();



