# aif-db

## It is a simple and fast NoSQL database

It is a simple and fast implementation for the management of the NoSQL database, based on JSON files through identifiers, basic methods, PUT, GET, REMOVE, among others, are implemented. supports encryption for data with the AES algorithm.

### Installation

Download the library with npm / Yarn, from your local files.

Via NPM:

    $ npm install aif-db
    
Via YARN:

    $ yarn add aif-db


Or you can export to the browser, using one of these tools: [Browserify] (http://browserify.org/), [Webmake] (https://github.com/medikoo/modules-webmake) o [Webpack] (http://webpack.github.io/)

### Use
The library can be included in your code through imports from CommonJS or ES.

ES2015 (ES6):
```javascript
import * as DataBase from "aif-db";
```
CommonJS:
```javascript
var DataBase = require("aif-db");
```

#### Construct
    (*path*, *dataBaseName*, [*secret*], [*defaultTable*])

#### Methods

**put** (*object*, [*table*], [*callback*])

**save** (*object*, [*table*], [*callback*]) {

**get** (*object*, [*table*], [*callback*])

**remove** (*object*, [*table*], [*callback*])

Example:

```javascript
var DataBase = require('aif-db');
var db = new DataBase('log', 'db');

var register1 = {
  _id: 12341,
  name: 'MartinR',
  date: '2020-03-01',
  data: 'Hello Word 1'
};
var register2 = {
  _id: 12443,
  name: 'Juan pedro',
  date: '2020-03-03',
  data: 'Hello Word 2'
}

db.put(register1, 'people', function(id, err) {
  console.log(id, err);
});
register1.name ='Panchito';
db.put(register1, 'session', function(id, err) {
  console.log(id, err);
});
db.put(register2, 'people', function(id, err) {
  console.log(id, err);
});

db.get(12341, 'people', function(rs, err, id) {
  console.log(id, rs, err);
});
db.get(12443, 'people', function(rs, err, id) {
  console.log(id, rs, err);
});
db.get(12341,'session', function(rs, err, id) {
  console.log(id, rs, err);
});

db.remove(12341, 'session', function(rs) {
  console.log(rs);
});

console.log('directorio: ', db.dir(12341, 'people'))
```
Example using cipher:

```javascript
var DataBase = require('aif-db');
var db = new DataBase('log', 'db', '-secret-');
//everything else is equal...
```

## Tests

    $ npm test

O well

    $ yarn test

## build

    $ npm run build

O well

    $ yarn build



## Security contact information

To report security vulnerabilities, use the following link: https://github.com/mygnet/aif-db/issues

---
[npm-image]: https://img.shields.io/npm/v/aif-db.svg
[npm-url]: https://www.npmjs.com/package/aif-db