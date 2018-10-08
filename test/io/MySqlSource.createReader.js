const tap = require('tap')

const MySqlSource = require('../../lib/sdk/io/MySqlIO/MySqlSource')

tap.comment('MySqlSource#createReader()')

const main = async () => {
  const reader = new MySqlSource({
    query: 'SELECT dept_name FROM departments;',
    configuration: {
      dataSource: ['db', 'employees'],
      username: 'root',
      password: 'college'
    }
  })
  .createReader()

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
