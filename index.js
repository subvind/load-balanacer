var http = require('http')
var httpProxy = require('http-proxy');

// underwind.solutions
let deployments = [
  // use railway.app
  // {
  //   kind: 'production',
  //   target: 'https://api.subvind.com',
  //   domain: 'api.subvind.com',
  //   modules: [] 
  // },
  {
    kind: 'staging',
    target: '//192.168.1.100:3000',
    domain: 'api.subvind.xyz'
  },
  { 
    kind: 'test',
    target: '//127.0.0.1:3000',
    domain: 'api.subvind.studio'
  }
]

let modules = [
  {
    name: 'edgy.ERP',
    backend: {
      target: '//192.168.1.100:3001',
      domain: 'erpedgy.com',
    },
    frontend: {
      target: '//192.168.1.100:3002',
      domain: '*.erpedgy.com',
    }
  },
  {
    name: 'devy.ERP',
    backend: {
      target: '//127.0.0.1:3001',
      domain: 'erpdevy.com',
    },
    frontend: {
      target: '//127.0.0.1:3002',
      domain: '*.erpdevy.com',
    }
  }
]

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});
 
//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.

  // configuration
  let host = req.headers.host
  // console.log('host', host)

  // proxy to Commands or a Platform
  let hostNames = host.split('.')
  if (host === 'api.subvind.studio') {
    // this is api request for test
    let deployment = deployments.find((value) => {
      return value.kind === 'test'
    })
    
    proxy.web(req, res, { 
      target: `http:${deployment.target}`,
      ws: true
    });
  } else if (host === 'api.subvind.xyz') {
    // this is api request for staging
    let deployment = deployments.find((value) => {
      return value.kind === 'staging'
    })
    
    proxy.web(req, res, { 
      target: `http:${deployment.target}`,
      ws: true
    });
  } else if (hostNames.length === 3) {
    // this is module request for the frontend
    let module = modules.find((value) => {
      let frontendDomain = value.frontend.domain.split('.')
      return frontendDomain[1] === hostNames[1]
    });

    if (module) {
      proxy.web(req, res, { 
        target: `http:${module.frontend.target}`
      });
    } else {
      proxy.web(req, res, { 
        target: `https://underwind.solutions`
      });
    }
  } else {
    // this is module request for the backend
    let module = modules.find((value) => {
      let backendDomain = value.backend.domain.split('.')
      return backendDomain[0] === hostNames[0]
    });

    if (module) {
      proxy.web(req, res, { 
        target: `http:${module.backend.target}`
      });
    } else {
      proxy.web(req, res, { 
        target: `https://underwind.solutions`
      });
    }
  }
});

// 
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
server.on('upgrade', function (req, socket, head) {
  let host = req.headers.host

  if (host === 'api.subvind.studio') {
    // this is api request for test
    let deployment = deployments.find((value) => {
      return value.kind === 'test'
    })
    
    proxy.ws(req, socket, head, {
      target: `ws:${deployment.target}`
    });
  } else if (host === 'api.subvind.xyz') {
    // this is api request for staging
    let deployment = deployments.find((value) => {
      return value.kind === 'staging'
    })
    
    proxy.ws(req, socket, head, {
      target: `ws:${deployment.target}`
    });
  } else {
    proxy.ws(req, socket, head, {
      target: `ws://api.subvind.com`
    });
  }
});
 
const PORT = process.env.PORT || 8080
console.log(`listening on port ${PORT}`)
server.listen(PORT);