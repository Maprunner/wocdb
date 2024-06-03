# Maprunner WOC Database

Another rewrite for a new interface.

Built with:

- [react.js](https://react.dev/) for the front end
- [Fat-Free Framework (F3)](http://fatfreeframework.com/home) for the back end
- [vite.js](https://vitejs.dev/) for the build
- [Icondrawer](www.icondrawer.com) for the flag icons.

## Development notes

npm install to make sure you have all necessary dependencies installed.

npm run dev : this starts a vite development server which includes hot module reload.

You need to be running a separate server to manage the API calls. At present this is assumed to be XAMPP or similar. In future I guess there should be a way of doing this in node.

You should now be able to access wocdb at http://localhost/wocdb/

## Production

npm run build

sync dist to the server
copy api directory to server
make sure database is present since it is not held in github

## https configuration for localhost

Using XAMPP on Windows you might get NET::ERR_CERT_AUTHORITY_INVALID errors when trying to access https://localhost

In Chrome insert "chrome://flags/#allow-insecure-localhost" in the address bar and then enable this option
