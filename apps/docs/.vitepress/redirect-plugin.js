export function redirectPlugin() {
  return {
    name: 'redirect-plugin',
    configureServer(server) {
      server.middlewares.use('/', (req, res, next) => {
        if (req.url === '/') {
          res.writeHead(301, { Location: '/l/' });
          res.end();
          return;
        }
        next();
      });
    }
  };
}