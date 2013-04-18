
// uses Phantom JS to capture a series of screens
(function() {
  var $this = this
    , $sys = require('system')

    // rendering arguments
    , $args = {
      port: $sys.args[1],
      width: $sys.args[2],
      format: $sys.args[3],
      x2: /^yes$/.test( $sys.args[4] ),
      export: $sys.args[5],
      screens: $sys.args[6].split(',')
    }
    
    // the server/port for the rendering
    , $url = 'http://localhost:' + $args.port + '/'
    , $delay = 250
    , $current = -1
    ,

    // captures the state of a page
    _capture = function( hash ) {
      var page = require('webpage').create()
        , key = hash || 'default'
        , target = $url + ( hash ? '#' + (hash || '') : '' )
        , filename = key.replace(/[^a-z0-9]/gi, '_') + '.' + $args.format
        , path = $args.export + filename;

      // notify
      console.log( 'rendering', key, 'to', path );

      // determine the scale to use
      page.viewportSize = {
        width: $args.width * ( $args.x2 ? 2 : 1 ),
        height: 1000 
      };
      
      // request the page
      page.open( target, function (status) {
        if ( status !== 'success' ) return;

        // scale up if needed
        if ( $args.x2 )
          page.evaluate(function () {
            document.body.style.webkitTransform = "scale(2)";
            document.body.style.webkitTransformOrigin = "0% 0%";
            document.body.style.width = "50%";
          });
        
        // render and save
        setTimeout( function() { 
          page.render( path ); 
          _next();
        }, $delay );        

      });

    },

    // grabs the next screen to use
    _next = function() {
      if ( $current >= $args.screens.length )
        return phantom.exit();
      _capture( $args.screens[ $current++ ] );
    };

  // kick off first screen
  _next();

})();