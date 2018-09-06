const tap = require('tap')

const { MySqlReader } = require('../../lib/sdk/io/MySqlSource')

tap.comment('MySqlSource#MySqlReader()')

const main = async () => {
  const reader = new MySqlReader({
    spec: {
      query: 'SELECT dept_name FROM departments;',
      connectionConfiguration: {
        host: 'db',
        user: 'root',
        password: 'college',
        database: 'employees'
      }
    }
  })

  tap.comment('start() should return true and make the first item available')

  tap.ok(await reader.start())
  tap.equal(reader.getCurrent().dept_name, 'Customer Service')

  tap.comment('advance() should make the next item available')

  tap.ok(await reader.advance())
  tap.equal(reader.getCurrent().dept_name, 'Development')

  reader.close();
}

const waitOn = require('wait-on')
waitOn(
  {
    resources: ['tcp:db:3306'],
    timeout: 60000
  },
  err => {
    if (err) { throw new Error(err) }
    tap.comment('MySQL is now ready')
    tap.resolves(main())
  }
)
