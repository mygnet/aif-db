import { md5, Aes } from 'aif-cipher'
import { split } from 'aif-str'
import path from 'path'
import fs from 'fs'
import shelljs from 'shelljs'

module.exports = class DataBase {
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

  hash(data) {
    return this.key ? md5(data + this.key) : data
  }

  idHash(id) {
    id = id || this.id
    if (id) {
      this.id = id
      return this.hash(id)
    }
    return null
  }

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

  file(file, id) {
    id = id || this.id
    file = file || this.table
    file = this.hash(file)
    if (id) {
      this.id = id
      return this.dir(id) + path.sep + file
    }
    return null
  }

  saveFile(content, file) {
    if (fs.existsSync(content)) {
      content = fs.readFileSync(content, { encoding: 'utf8' })
    }
    content = content || ''
    file = file || this.table
    file = this.hash(file)
    let error = null
    try {
      content = typeof content === 'object' ? JSON.stringify(content) : content
      content = this.key ? Aes.encode(content, this.key) : content
      file = this.dir() + path.sep + file
      fs.writeFileSync(file, content, { encoding: 'utf8' })
    } catch (err) {
      this.lastError = err.toString()
      error = err
    }
    return !!error
  }

  loadFile(file) {
    file = file || this.table
    file = this.hash(file)
    file = this.dir() + path.sep + file
    let content = null
    let error = null
    if (fs.existsSync(file)) {
      try {
        content = fs.readFileSync(file, { encoding: 'utf8' })
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

  put(rd, table, callback) {
    let id = rd._id
    if (typeof rd === 'object') {
      if (typeof table === 'function') {
        callback = table
      } else {
        this.table = table || this.table
      }
      if (id) {
        id = id + ''
        const dir = this.dir(id)
        // path.join(this.path, table) + path.sep + seg
        let content = null
        let error = null
        try {
          content = JSON.stringify(rd)
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

  vacum(folder) {
    if(folder) {
      if (!fs.statSync(folder).isDirectory()) {
        return
      }
      let files = fs.readdirSync(folder)
      if (files.length > 0) {
        files.forEach(file => {
          this.vacum(path.join(folder, file))
        })
        files = fs.readdirSync(folder)
      }
      if (files.length === 0) {
        fs.rmdirSync(folder)
        return
      }
    }
  }

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

  save(rd, table, callback) {
    if (typeof table === 'function') {
      callback = table
      table = this.table
    }
    this.get(rd._id, table, (rs, err) => {
      if (rs) {
        for (const key in rs) {
          if (rd[key] !== undefined) {
            rs[key] = rd[key]
          }
        }
        this.put(rs, table, callback)
      } else {
        this.put(rd, table, callback)
      }
    })
  }
}
