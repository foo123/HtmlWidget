/*
    WebSocket implementation as XPCOM component
*/
!function( root ){
"use strict";

var Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils, Cr = Components.results;
Cu['import']('resource://gre/modules/Services.jsm');
//Cu['import']('resource://gre/modules/XPCOMUtils.jsm');

// WebSocket implementation as XPCOM component
var WebSocket = function( url, protocols, options/*, proxyHost, proxyPort, headers*/ ) {
    var self = this;
    self._e = { };
    self.readyState = WebSocket.CONNECTING;
    self._ws = Cc["@mozilla.org/network/protocol;1?name=wss"].createInstance( Ci.nsIWebSocketChannel );
    self._ws.initLoadInfo(
        null, // aLoadingNode
        Services.scriptSecurityManager.getSystemPrincipal( ),
        null, // aTriggeringPrincipal
        Ci.nsILoadInfo.SEC_ALLOW_CROSS_ORIGIN_DATA_IS_NULL,
        Ci.nsIContentPolicy.TYPE_WEBSOCKET
    );
    if ( 'string' === typeof protocols ) protocols = [ protocols ];
    if ( protocols ) self._ws.protocol = protocols.join(',');
    self._ws.asyncOpen( Services.io.newURI( url, null, null ), null, 0, self, null );
};

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

WebSocket.prototype = {
    constructor: WebSocket
    ,CONNECTING: WebSocket.CONNECTING
    ,OPEN: WebSocket.OPEN
    ,CLOSING: WebSocket.CLOSING
    ,CLOSED: WebSocket.CLOSED
    ,readyState: 0
    ,_ws: null
    ,_e: null
    ,addEventListener: function( event, handler ) {
        this._e[event] = handler;
    }
    ,removeEventListener: function( event, handler ) {
        if ( this._e[event] && (null == handler || handler === this._e[event]) ) delete this._e[event];
    }
    ,dispatchEvent: function( event, data ) {
        if ( this._e[event] )
            this._e[event]( {event:event, data:data, target:this} );
    }
    /**
    * nsIWebSocketListener method, handles the start of the websocket stream.
    *
    * @param {nsISupports} aContext Not used
    */
    ,onStart: function( ) {
        var self = this;
        if( WebSocket.CONNECTING === self.readyState )
        {
            self.readyState = WebSocket.OPEN;
            self.dispatchEvent( 'open' );
        }
    }
    /**
    * nsIWebSocketListener method, called when the websocket is closed locally.
    *
    * @param {nsISupports} aContext Not used
    * @param {nsresult} aStatusCode
    */
    ,onStop: function( aContext, aStatusCode ) {
        var self = this;
        if( WebSocket.CLOSING === self.readyState || WebSocket.OPEN === self.readyState )
        {
            self.readyState = WebSocket.CLOSED;
            self.dispatchEvent( Cr.NS_OK === aStatusCode || self._ws.CLOSE_NORMAL === aStatusCode ? 'close' : 'error', {status:aStatusCode} );
        }
    }
    /**
    * nsIWebSocketListener method, called when the websocket is closed
    * by the far end.
    *
    * @param {nsISupports} aContext Not used
    * @param {integer} aCode the websocket closing handshake close code
    * @param {String} aReason the websocket closing handshake close reason
    */
    ,onServerClose: function( aContext, aCode, aReason ) {
        var self = this;
        if( WebSocket.OPEN === self.readyState )
        {
            self.readyState = WebSocket.CLOSED;
            self.dispatchEvent( 'close', {status:aCode, statusTxt:aReason} );
        }
    }
    /**
    * nsIWebSocketListener method, called when the websocket receives
    * a text message (normally json encoded).
    *
    * @param {nsISupports} aContext Not used
    * @param {String} aMsg The message data
    */
    ,onMessageAvailable: function( aContext, aMsg ) {
        var self = this;
        if( WebSocket.OPEN === self.readyState )
        {
            self.dispatchEvent( 'message', aMsg );
        }
    }
    /**
    * nsIWebSocketListener method, called when the websocket receives a binary message.
    * This class assumes that it is connected to a SimplePushServer and therefore treats
    * the message payload as json encoded.
    *
    * @param {nsISupports} aContext Not used
    * @param {String} aMsg The message data
    */
    ,onBinaryMessageAvailable: function( aContext, aMsg ) {
        var self = this;
        if( WebSocket.OPEN === self.readyState )
        {
            self.dispatchEvent( 'message', aMsg );
        }
    }
    /**
    * Create a JSON encoded message payload and send via websocket.
    *
    * @param {Object} aMsg Message to send.
    *
    * @returns {Boolean} true if message has been sent, false otherwise
    */
    ,send: function( aMsg ) {
        var self = this;
        if( WebSocket.OPEN === self.readyState )
        {
            try {
                self._ws.sendMsg( aMsg );
            }
            catch (e) {
                return false;
            }
            return true;
        }
        return false;
    }
    /**
    * Close the websocket.
    */
    ,close: function( ) {
        var self = this;
        if( WebSocket.CLOSING === self.readyState || WebSocket.CLOSED === self.readyState )
        {
            return;
        }
        self.readyState = WebSocket.CLOSING;
        try {
            self._ws.close( self._ws.CLOSE_NORMAL );
            self.readyState = WebSocket.CLOSED;
        }
        catch (e) {
            // Do nothing
            self.readyState = WebSocket.CLOSED;
        }
    }
};

// export it
root[ 'WebSocket' ] = WebSocket;
root.EXPORTED_SYMBOLS = [ 'WebSocket' ];
}( this );