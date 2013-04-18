
// handles swaping templates and updating content

(function() {
  var $this = this
    , $templates = { }
    , $converter = new Markdown.Converter()
    ,

    // hydrates views on the page
    _init = function() {
      _include_content();
      _locate_templates();
      _replace_content();

      // monitor the view
      window.onhashchange = _set_view;
      setTimeout( _set_view, 10 );
    },

    // finds external views
    _include_content = function() {
      $('[include]').each( function( i, v ) {
        var element = $(v)
          , url = element.attr('include');

        // load and populate
        $.ajax({
          async: false,
          url: url,
          dataType: 'html'
        })
        .success( function( result ) { element.html( result ); })
        .fail( function() { console.log('unable to load '+url); })

      });
    },

    // locates all of the templates
    _locate_templates = function() {

      // compile all of the templates used
      $('bp\\:template').each( function() {
        var element = $(this)
          , key = element.attr('key')
          , html = element.html()
          , template = Handlebars.compile( html )
          , data = _get_attribute_values( element );

        // save the template        
        $templates[ key ] = {
          template: template,
          data: data
        };

        // clear the template
        element.remove();
      });

    },

    // extract each attribute as a data value
    _get_attribute_values = function( element ) {
      var attributes = element.get(0).attributes
        , data = { };

      // get each value
      for (var i = 0; i < attributes.length; i++ ) {
        var attr = attributes[ i ];
        data[ attr.name ] = attr.value || ' ';
      }

      return data;
    },

    // extract each of the values
    _get_content_values = function( target ) {
      var data = { };

      // get sub children
      target.find('>').each( function() {
        var element = $(this)
          , key = this.tagName.toLowerCase()
          , html = $.trim( element.html() );
        element.remove();
        data[ key ] = html;
      });

      // anything left over is content
      var content = $.trim( target.html() );
      if ( content.length > 0 ) data.content = content;

      return data;
    },

    // subs out all content
    _replace_content = function() {
      $.each( $templates, function( key, template ) {

        // find all matches
        $("bp\\:"+key+",[source='"+key+"']").each( function( i,v ) {

          // extract the values
          var element = $( v )
            , attrs = _get_attribute_values( element )
            , values = _get_content_values( element )
            , data = _merge_objects( template.data, attrs, values )
            , markup = template.template( data )
            , replace = $( $.parseHTML( markup ) );

          // swap out the value
          replace.insertBefore( element );
          element.remove();

        });

      });

      // use markdown for target elements
      window.setTimeout( _populate_markdown, 0 );

    },

    // combine all objects
    _merge_objects = function( to, from ) {
      var data = { }
        , objects = [].slice.call( arguments, 0 );

      for (var i = 0; i < objects.length; i++ )
        for (var k in objects[ i ])
          data[ k ] = objects[ i ][ k ];
      return data;
    },

    // perform markdown if needed
    _populate_markdown = function( element ) {
      $('[markdown]').each(function() {
        var view = $(this)
          , content = view.html()
          , lines = (content || '').split('\n');

        // clear out tabs
        for (var l in lines)
          lines[l] = lines[l].replace(/^\s+/g, '');

        // merge and replace
        var content = lines.join('\n')
          , html = $converter.makeHtml( content );
        view.html( html );

      });
    },

    // update the views
    _set_view = function() {
      var keys = window.location.hash.substr(1).split(/\+/g);

      // show and hide as needed
      $('[bp\\:show]').each(function() {
        var view = $(this)
          , key = view.attr('bp:show');

        // hide by default
        view.hide();
        
        // show if the key matches
        for (var k in keys)
          if (keys[k] == key) view.show();

      });

    };

  // load the view
  $(_init);
})();