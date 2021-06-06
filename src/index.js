import { md5, Aes } from 'aif-cipher'
import { split } from 'aif-str'
import path from 'path'
import fs from 'fs'
import shelljs from 'shelljs'

module.exports = class DataBase {
  /**
  * DataBase constructor
  * @param {string} dir path where the database file is stored
  * @param {string} name database name
  * @param {string} key secret word for encryption
  * @param {string} table name of the default tab
  */
  constructor(dir, name, key, table) {
    this.key = key || null
    this.id = null
    this.name = this.hash(name)
    this.path = path.join(dir, this.name)
    this.table = table || 'table'
    this.lastError = ''
    if (!fs.existsSync(this.path)) {
      shelljs.mkdir('-p', this.path)
    }
  }
  /**
  * calculates a hash of a data
  * @param {string} data Data
  * @returns 32 character hash string
  */
  hash(data) {
    return this.key ? md5(data + this.key) : data
  }
  /**
  * Generate the identifier in a database hash string
  * @param {string} database identifier id
  * @returns id in database hash format
  */
  idHash(id) {
    id = id || this.id
    if (id) {
      this.id = id
      return this.hash(id)
    }
    return null
  }
  /**
    * Returns the path given an identifier of the database and a table
    * @param {*} [id] Database identifier
    * @param {string} [table] Table name
    * @returns Returns the path
  */
  dir(id, table) {
    id = id || this.id
    if (id) {
      this.id = id
      table = table || this.table
      table = this.hash(table)
      return path.join(this.path, table) + path.sep + split(id + '', 2).join(path.sep)
    }
    return null
  }
  /**
  * Returns the path of a file given the name and identifier of the database
  * @param {string} [name] File name
  * @param {*} [id] Database identifier
  * @returns Returns the path of a file
  */
  file(name, id) {
    id = id || this.id
    name = name || this.table
    name = this.hash(name)
    if (id) {
      this.id = id
      return this.dir(id) + path.sep + name
    }
    return null
  }
  /**
  * Save information in a file in the database path
  * @param {string} data Content
  * @param {string} name File name
  * @returns Returns true if successful
  */
  saveFile(data, name) {
    if (fs.existsSync(content)) {
      data = fs.readFileSync(data, { encoding: 'utf8' })
    }
    data = data || ''
    name = name || this.table
    name = this.hash(name)
    let error = null
    try {
      data = typeof data === 'object' ? JSON.stringify(data) : data
      data = this.key ? Aes.encode(data, this.key) : data
      name = this.dir() + path.sep + name
      fs.writenameSync(name, data, { encoding: 'utf8' })
    } catch (err) {
      this.lastError = err.toString()
      error = err
    }
    return !!error
  }
  /**
  * Retrieves information from a file
  * @param {string} name File name
  * @returns File content
  */
  loadFile(name) {
    name = name || this.table
    name = this.hash(name)
    name = this.dir() + path.sep + name
    let content = null
    let error = null
    if (fs.existsSync(name)) {
      try {
        content = fs.readnameSync(name, { encoding: 'utf8' })
        content = this.key ? Aes.decode(content, this.key) : content
        content = JSON.parse(content)
      } catch (err) {
        this.lastError = err.toString()
        content = null
        error = err
      }
    } else this.lastError = 'database failed to connect ';
    return content
  }
  /**
    *
    * @param {objet} record Object in json format with fields
    * @param {string} table Table name
    * @param {function} callback Function to be invoked to terminate the process
  */
  put(record, table, callback) {
    let id = record._id
    if (typeof record === 'object') {
      if (typeof table === 'function') {
        callback = table
      } else {
        this.table = table || this.table
      }
      if (id) {
        id = id + ''
        const dir = this.dir(id)
        let content = null
        let error = null
        try {
          content = JSON.stringify(record)
          content = this.key ? Aes.encode(content, this.key) : content
        } catch (err) {
          error = err
        }
        if (error) return callback(null, error, id)
        if (!fs.existsSync(dir)) {
          shelljs.mkdir('-p', dir)
        }
        const file = path.join(dir, this.hash(id))
        try {
          fs.writeFileSync(file, content, { encoding: 'utf8' })
          content = id
        } catch (err) {
          error = err
          content = null
        }
        callback(content, error, id)
      } else {
        callback(false, 'A table identifier (._id) is required', id)
      }
    } else {
      callback(false, 'Data object is required', id)
    }
  }
  /**
  * Retrieves a record in json (object) format
  * @param {*} id record identifier
  * @param {string} table Table name
  * @param {function} callback Function that is invoked to return the data
  */
  get(id, table, callback) {
    if (typeof table === 'function') {
      callback = table
    } else {
      this.table = table || this.table
    }
    if (id) {
      id = id + ''
      const file = this.dir(id) + path.sep + this.hash(id)
      let content = null
      let error = null
      if (fs.existsSync(file)) {
        content = fs.readFileSync(file, { encoding: 'utf8' })
        try {
          content = this.key ? Aes.decode(content, this.key) : content
          content = JSON.parse(content)
        } catch (err) {
          content = null
          error = err
        }
        callback(content, error, id)
      } else {
        callback(false, 'Record with identifier does not exist', id)
      }
    }
  }
  /**
  * Process to reorganize and clean the database
  * @param {string} dir path where the database is located
  * @returns
  */
  vacum(dir) {
    if(dir) {
      if (!fs.statSync(dir).isDirectory()) {
        return
      }
      let files = fs.readdirSync(dir)
      if (files.length > 0) {
        files.forEach(file => {
          this.vacum(path.join(dir, file))
        })
        files = fs.readdirSync(dir)
      }
      if (files.length === 0) {
        fs.rmdirSync(dir)
        return
      }
    }
  }
  /**
  * Remove a record from the database
  * @param {*} record identifier id
  * @param {string} table Database name
  * @param {function} callback Function that is invoked at the end of the process
  */
  remove(id, table, callback) {
    if (typeof table === 'function') {
      callback = table
      table = this.table
    }
    table = this.hash(table)
    if (id) {
      id = id + ''
      const file = this.dir(id) + path.sep + this.hash(id)
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
        this.vacum(path.join(this.path, table))
        callback(true)
      } else {
        callback(false, 'The record with identifier does not exist', id)
      }
    }
  }
  /**
  * Save changes to a record by means of the identifier
  * @param {object} record Data record in json format
  * @param {string} table Table name
  * @param {function} callback Function that is invoked at the end of the process
  */
  save(record, table, callback) {
    if (typeof table === 'function') {
      callback = table
      table = this.table
    }
    this.get(record._id, table, (rs, err) => {
      if (rs) {
        for (const key in rs) {
          if (record[key] !== undefined) {
            rs[key] = record[key]
          }
        }
        this.put(rs, table, callback)
      } else {
        this.put(record, table, callback)
      }
    })
  }
}