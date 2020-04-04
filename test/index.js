const DataBase = require('../dist/index');
//const cipher = require('aif-cipher')

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

//db.vacum();


