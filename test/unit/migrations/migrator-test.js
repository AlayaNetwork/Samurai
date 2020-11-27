import fs from 'fs'
import assert from 'assert'
import { cloneDeep } from 'lodash'
import Migrator from '../../../app/scripts/lib/migrator'
import liveMigrations from '../../../app/scripts/migrations'

const stubMigrations = [
  {
    version: 1,
    migrate: (data) => {
      // clone the data just like we do in migrations
      const clonedData = cloneDeep(data)
      clonedData.meta.version = 1
      return Promise.resolve(clonedData)
    },
  },
  {
    version: 2,
    migrate: (data) => {
      const clonedData = cloneDeep(data)
      clonedData.meta.version = 2
      return Promise.resolve(clonedData)
    },
  },
  {
    version: 3,
    migrate: (data) => {
      const clonedData = cloneDeep(data)
      clonedData.meta.version = 3
      return Promise.resolve(clonedData)
    },
  },
]
const versionedData = { meta: { version: 0 }, data: { hello: 'world' } }

import data from '../../../app/scripts/first-time-state'

const firstTimeState = {
  meta: { version: 0 },
  data,
}

describe('migrations', function () {
  describe('liveMigrations require list', function () {

    let migrationNumbers

    before(function () {
      const fileNames = fs.readdirSync('./app/scripts/migrations/')
      migrationNumbers = fileNames
        .reduce((acc, filename) => {
          const name = filename.split('.')[0]
          if (/^\d+$/.test(name)) {
            acc.push(name)
          }
          return acc
        }, [])
        .map((num) => parseInt(num))
    })

    it('should include all migrations', function () {
      migrationNumbers.forEach((num) => {
        const migration = liveMigrations.find((m) => m.version === num)
        assert(migration, `migration not included in 'migrations/index.js': ${num}`)
      })
    })

    it('should have tests for all migrations', function () {
      const fileNames = fs.readdirSync('./test/unit/migrations/')
      const testNumbers = fileNames
        .reduce((acc, filename) => {
          const name = filename.split('-test.')[0]
          if (/^\d+$/.test(name)) {
            acc.push(name)
          }
          return acc
        }, [])
        .map((num) => parseInt(num))

      migrationNumbers.forEach((num) => {
        if (num >= 33) {
          assert.ok(testNumbers.includes(num), `no test found for migration: ${num}`)
        }
      })
    })
  })

  describe('Migrator', function () {
    const migrator = new Migrator({ migrations: stubMigrations })
    it('migratedData version should be version 3', async function () {
      const migratedData = await migrator.migrateData(versionedData)
      assert.equal(migratedData.meta.version, stubMigrations[2].version)
    })

    it('should match the last version in live migrations', async function () {
      const migrator = new Migrator({ migrations: liveMigrations })
      const migratedData = await migrator.migrateData(firstTimeState)
      const last = liveMigrations.length - 1
      assert.equal(migratedData.meta.version, liveMigrations[last].version)
    })

    it('should emit an error', async function () {
      const migrator = new Migrator({
        migrations: [{
          version: 1,
          async migrate () {
            throw new Error('test')
          },
        }],
      })
      await assert.rejects(migrator.migrateData({ meta: { version: 0 } }))
    })
  })
})
