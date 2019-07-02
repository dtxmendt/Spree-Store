$.fn.imagesLoaded = function( callback ) {
  var $this = this,
    $images = $this.find('img').add( $this.filter('img') ),
    len = $images.length,
    blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
    loaded = [];

  function triggerCallback() {
    callback.call( $this, $images );
  }

  function imgLoaded( event ) {
    var img = event.target;
    if ( img.src !== blank && $.inArray( img, loaded ) === -1 ){
      loaded.push( img );
      if ( --len <= 0 ){
        setTimeout( triggerCallback );
        $images.unbind( '.imagesLoaded', imgLoaded );
      }
    }
  }

  // if no images, trigger immediately
  if ( !len ) {
    triggerCallback();
  }

  $images.bind( 'load.imagesLoaded error.imagesLoaded',  imgLoaded ).each( function() {
    // cached images don't fire load sometimes, so we reset src.
    var src = this.src;
    // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
    // data uri bypasses webkit log warning (thx doug jones)
    this.src = blank;
    this.src = src;
  });

  return $this;
};