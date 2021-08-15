//  Run as: node test.js
"use strict";

var http = require('http'), httpPort = 8080,
    url = require('url'), 
    path = require('path'), fs = require('fs'),
    Exists = fs.exists, //path.exists,
    Read = fs.readFile,
    echo = console.log,
    Importer = require(path.join(__dirname, '../../Importer/src/js/Importer.js')),
    HtmlWidget = require(path.join(__dirname, '../src/HtmlWidget.js'))
;

var importer = new Importer();
HtmlWidget.assets(JSON.parse(fs.readFileSync(path.join(process.cwd(), '../src/htmlwidget.json'))));
importer.register('assets', HtmlWidget.assets(true, '../assets'));
HtmlWidget.enqueueAssets(importer.enqueue.bind(importer));

global.HtmlWidget = HtmlWidget;
global.widget = function(widget, attr, data)
{
    return HtmlWidget.widget(widget, attr, data);
}
global.options = function(options, key, val)
{
    return HtmlWidget.options(options, key, val);
}
global.enqueue = function(type, asset)
{
    importer.enqueue(type, asset);
    return '';
}
global.styles = function()
{
    return importer.assets('styles');
}
global.scripts = function()
{
    return importer.assets('scripts');
}

function parse(tpl)
{
    var code = 'var _$$_ = \'\';', p1, p2, NL = /\r\n|\r|\n/g;
    while(tpl && tpl.length)
    {
        p1 = tpl.indexOf('<?php');
        if (0 > p1)
        {
            code += "\n"+'_$$_ += \''+tpl.replace('\\', '\\\\').replace('\'','\\\'').replace(NL, '\'+"\\n"+\'')+'\';';
            break;
        }
        else
        {
            p2 = tpl.indexOf('?>', p1+5);
            code += "\n"+'_$$_ += \''+tpl.slice(0, p1).replace('\\', '\\\\').replace('\'','\\\'').replace(NL, '\'+"\\n"+\'')+'\';';
            code += "\n"+'_$$_ += String('+tpl.slice(p1+5, p2).trim()+');';
            tpl = tpl.slice(p2+2);
        }
    }
    code += "\n" + 'return _$$_;';
    return new Function('', code);
}

var html = parse(String(fs.readFileSync('./test.tpl.html')));

// create a node http server to serve the rendered templates
http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname, filename;

    // return the main page
    if ('/'==uri || ''==uri) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html());
        return;
    }
    
    // handle css/js/other file requests
    filename = path.join(process.cwd(), ('/assets/' === uri.slice(0, 8) ? '..' : '')+uri);
    fs.stat(filename, function(err, stat) {
        if(err || !stat) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (stat.isDirectory()) filename = path.join(filename, 'index.html');

        Read(filename, "binary", function(err, file) {
            if(err) {        
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err.toString() + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(httpPort);

echo('Test Started on http://localhost:' + httpPort + '/');
echo('HtmlWidget VERSION is: ' + HtmlWidget.VERSION);
