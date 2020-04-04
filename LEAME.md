# aif-db

## Es un gestor simple y rápido de base de datos NoSQL

Es una implementación simple y rápida para el manejo de base de datos NoSQL, basado en archivos JSON por medio de identificadores, se implementa métodos básicos, PUT, GET, REMOVE, entre otros. soporta cifrado para los datos con el algoritmo AES.

### Instalación

Descargue la biblioteca con npm / Yarn, desde sus archivos locales.

Vía NPM:

    $ npm install aif-db
    
Vía YARN:

    $ yarn add aif-db


O bien puede exportar al navegador, usando alguna de estas herramientas: [Browserify] (http://browserify.org/), [Webmake] (https://github.com/medikoo/modules-webmake) o [Webpack] (http://webpack.github.io/)

### Uso
La biblioteca se puede incluir en su código a través de importaciones de CommonJS o ES.

ES2015 (ES6):
```javascript
import * as cipher from "aif-db";
```
CommonJS:
```javascript
var cipher = require("aif-db");
```
#### Constructor
    (*path*, *dataBaseName*, [*secret*], [*defaultTable*])

#### Métodos

**put** (*object*, [*table*], [*callback*])

**save** (*object*, [*table*], [*callback*]) {

**get** (*object*, [*table*], [*callback*])

**remove** (*object*, [*table*], [*callback*])

Ejemplo:

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
Ejemplo usando cifrado de datos:

```javascript
var DataBase = require('aif-db');
var db = new DataBase('log', 'db', '-secret-');
//todo lo demas es igual...
```

## Tests

    $ npm test

o bien 

    $ yarn test

## build

    $ npm run build

o bien

    $ yarn build



## Información de contacto de seguridad

Para informar vulnerabilidades de seguridad, utilice el siguiente link: https://github.com/mygnet/aif-db/issues

---
[npm-image]: https://img.shields.io/npm/v/aif-db.svg
[npm-url]: https://www.npmjs.com/package/aif-db