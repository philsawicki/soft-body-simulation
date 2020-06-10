import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';
import url from 'url';

/**
 * HTTP Server Port on which to serve files.
 *
 * @type {Number}
 */
const SERVER_PORT = process.env.PORT || 3002;


/**
 * Return a list of available Network Interfaces.
 *
 * @return {String[]} The list of available Network Intefaces.
 */
const networkService = {
    getNetworkInterfaces: () => {
        const osInterfaces = os.networkInterfaces();
        const ipAddresses = [];

        for (const interfaceName in osInterfaces) {
            for (const index in osInterfaces[interfaceName]) {
                if (osInterfaces[interfaceName][index].family === 'IPv4' && !osInterfaces[interfaceName][index].internal) {
                    ipAddresses.push(osInterfaces[interfaceName][index].address);
                }
            }
        }

        return ipAddresses;
    }
};


/**
 * HTTP Request handler.
 *
 * @param {Object} request  Request Handler.
 * @param {Object} response Response Handler.
 * @access private
 */
const _requestHandler = (request, response) => {
    let filePath = '.' + url.parse(request.url).pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    filePath = path.join(path.resolve('.'), 'dist', filePath);

    const fileExtension = path.extname(filePath);
    let contentType = 'text/html';
    switch (fileExtension) {
        case '.mjs':
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
        case '.wasm':
            contentType = 'application/wasm';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        default:
            // Nothing to do.
            break;
    }

    // Handle "manifest.json" file:
    if (filePath.indexOf('manifest.json') !== -1) {
        contentType = 'application/manifest+json';
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(404);
            response.end(`Sorry, check with the site admin for error: ${error.code}`);
            response.end();
        } else {
            response.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': Buffer.byteLength(content)
            });
            response.end(content, 'utf-8');
        }
    });
};



const _server = http.createServer(_requestHandler);
_server.listen(SERVER_PORT, '0.0.0.0', () => {
    const networkInterfaceURL = networkService.getNetworkInterfaces()[0];
    console.log('Server running at http://%s:%d', networkInterfaceURL, SERVER_PORT);
});
