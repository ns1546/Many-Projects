import http.server
import socketserver
import os

PORT = 8088

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        url_parts = self.path.split('?', 1)
        clean_path = url_parts[0]
        query = ('?' + url_parts[1]) if len(url_parts) > 1 else ''

        if clean_path == '' or clean_path == '/':
            self.path = '/index.html' + query
        else:
            stripped = clean_path.rstrip('/')
            if os.path.exists('.' + stripped + '.html'):
                self.path = stripped + '.html' + query
            elif os.path.exists('.' + clean_path + '.html'):
                self.path = clean_path + '.html' + query
            elif clean_path.endswith('.html'):
                clean_target = clean_path[:-5]
                # Redirect or rewrite clean
                pass
        
        return super().do_GET()

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    httpd = ThreadingHTTPServer(("", PORT), CleanURLHandler)
    print(f"Clean URL Multi-Threaded Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
