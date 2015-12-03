# SITEPOINT FRONTEND TEST

A simple counter application that does the following:
* Add a named counter to a list of counters
* Increment any of the counters
* Decrement any of the counters
* Delete a counter
* Show a sum of all the counter values
* It must persist data back to the server


## Install and start the server

```
$ npm install
$ npm start
$ npm run build
```
## See the UI in action
Open a browser to [http://localhost:3000] and start counting!

## Key Decisions and Rationale
* Flux architecture adopted to support future maintenance should the app grow larger.
* 'Shortcut' adopted. Due to simple nature of the test, async reads to apis are made directly from stores instead of from actions (or UI api code).

## Exclusions
Due to the nature of the app (a test) I have excluded the following:

* Automated Unit and UI Tests
* Production tasks like react production setting, uglify and compression, etc.
* More efficient or customised use of bootstrap.
* Better documentation.

