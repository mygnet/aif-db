'use strict';var _aifCipher=require('aif-cipher'),_aifStr=require('aif-str'),_path=require('path'),_path2=_interopRequireDefault(_path),_fs=require('fs'),_fs2=_interopRequireDefault(_fs),_shelljs=require('shelljs'),_shelljs2=_interopRequireDefault(_shelljs);function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}module.exports=class{
/**
  * DataBase constructor
  * @param {string} dir path where the database file is stored
  * @param {string} name database name
  * @param {string} key secret word for encryption
  * @param {string} table name of the default tab
  */constructor(dir,name,key,table){this.key=key||null,this.id=null,this.name=this.hash(name),this.path=_path2.default.join(dir,this.name),this.table=table||'table',this.lastError='',_fs2.default.existsSync(this.path)||_shelljs2.default.mkdir('-p',this.path)}
/**
  * calculates a hash of a data
  * @param {string} data Data
  * @returns 32 character hash string
  */hash(data){return this.key?(0,_aifCipher.md5)(data+this.key):data}
/**
  * Generate the identifier in a database hash string
  * @param {string} database identifier id
  * @returns id in database hash format
  */idHash(id){return id=id||this.id,id?(this.id=id,this.hash(id)):null}
/**
    * Returns the path given an identifier of the database and a table
    * @param {*} [id] Database identifier
    * @param {string} [table] Table name
    * @returns Returns the path
  */dir(id,table){return id=id||this.id,id?(this.id=id,table=table||this.table,table=this.hash(table),_path2.default.join(this.path,table)+_path2.default.sep+(0,_aifStr.split)(id+'',2).join(_path2.default.sep)):null}
/**
  * Returns the path of a file given the name and identifier of the database
  * @param {string} [name] File name
  * @param {*} [id] Database identifier
  * @returns Returns the path of a file
  */file(name,id){return id=id||this.id,name=name||this.table,name=this.hash(name),id?(this.id=id,this.dir(id)+_path2.default.sep+name):null}
/**
  * Save information in a file in the database path
  * @param {string} data Content
  * @param {string} name File name
  * @returns Returns true if successful
  */saveFile(data,name){_fs2.default.existsSync(content)&&(data=_fs2.default.readFileSync(data,{encoding:'utf8'})),data=data||'',name=name||this.table,name=this.hash(name);let a=null;try{data='object'==typeof data?JSON.stringify(data):data,data=this.key?_aifCipher.Aes.encode(data,this.key):data,name=this.dir()+_path2.default.sep+name,_fs2.default.writenameSync(name,data,{encoding:'utf8'})}catch(b){this.lastError=b.toString(),a=b}return!!a}
/**
  * Retrieves information from a file
  * @param {string} name File name
  * @returns File content
  */loadFile(name){name=name||this.table,name=this.hash(name),name=this.dir()+_path2.default.sep+name;let a=null,b=null;if(_fs2.default.existsSync(name))try{a=_fs2.default.readnameSync(name,{encoding:'utf8'}),a=this.key?_aifCipher.Aes.decode(a,this.key):a,a=JSON.parse(a)}catch(c){this.lastError=c.toString(),a=null,b=c}else this.lastError='database failed to connect ';return a}
/**
    *
    * @param {objet} record Object in json format with fields
    * @param {string} table Table name
    * @param {function} callback Function to be invoked to terminate the process
  */put(record,table,callback){let id=record._id;if('object'!=typeof record)callback(!1,'Data object is required',id);else if('function'==typeof table?callback=table:this.table=table||this.table,id){id+='';const dir=this.dir(id);let a=null,b=null;try{a=JSON.stringify(record),a=this.key?_aifCipher.Aes.encode(a,this.key):a}catch(a){b=a}if(b)return callback(null,b,id);_fs2.default.existsSync(dir)||_shelljs2.default.mkdir('-p',dir);const c=_path2.default.join(dir,this.hash(id));try{_fs2.default.writeFileSync(c,a,{encoding:'utf8'}),a=id}catch(c){b=c,a=null}callback(a,b,id)}else callback(!1,'A table identifier (._id) is required',id)}
/**
  * Retrieves a record in json (object) format
  * @param {*} id record identifier
  * @param {string} table Table name
  * @param {function} callback Function that is invoked to return the data
  */get(id,table,callback){if('function'==typeof table?callback=table:this.table=table||this.table,id){id+='';const a=this.dir(id)+_path2.default.sep+this.hash(id);let b=null,c=null;if(_fs2.default.existsSync(a)){b=_fs2.default.readFileSync(a,{encoding:'utf8'});try{b=this.key?_aifCipher.Aes.decode(b,this.key):b,b=JSON.parse(b)}catch(a){b=null,c=a}callback(b,c,id)}else callback(!1,'Record with identifier does not exist',id)}}
/**
  * Process to reorganize and clean the database
  * @param {string} dir path where the database is located
  * @returns
  */vacum(dir){if(dir){if(!_fs2.default.statSync(dir).isDirectory())return;let a=_fs2.default.readdirSync(dir);if(0<a.length&&(a.forEach(a=>{this.vacum(_path2.default.join(dir,a))}),a=_fs2.default.readdirSync(dir)),0===a.length)return void _fs2.default.rmdirSync(dir)}}
/**
  * Remove a record from the database
  * @param {*} record identifier id
  * @param {string} table Database name
  * @param {function} callback Function that is invoked at the end of the process
  */remove(id,table,callback){if('function'==typeof table&&(callback=table,table=this.table),table=this.hash(table),id){id+='';const a=this.dir(id)+_path2.default.sep+this.hash(id);_fs2.default.existsSync(a)?(_fs2.default.unlinkSync(a),this.vacum(_path2.default.join(this.path,table)),callback(!0)):callback(!1,'The record with identifier does not exist',id)}}
/**
  * Save changes to a record by means of the identifier
  * @param {object} record Data record in json format
  * @param {string} table Table name
  * @param {function} callback Function that is invoked at the end of the process
  */save(record,table,callback){'function'==typeof table&&(callback=table,table=this.table),this.get(record._id,table,a=>{if(a){for(const key in a)void 0!==record[key]&&(a[key]=record[key]);this.put(a,table,callback)}else this.put(record,table,callback)})}};