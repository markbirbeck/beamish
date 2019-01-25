const tap = require('tap')
tap.comment('GraphQlReadableStream')

const gql = require('graphql-tag')

const {
  DoFn,
  GraphQlReadableStream,
  NoopWriterFn,
  ParDo,
  Pipeline
} = require('../../../../../')

tap.test('specify query', t => {
  /**
   * Publically available GraphQL endpoint with list of countries:
   */
  const url = 'https://countries.trevorblades.com/'

  const p = Pipeline.create()

  p
  .apply(
    new GraphQlReadableStream({
      url,
      options: {
        query: gql`
          query {
            continent(code: "AN") {
              name
            }
          }
        `
      }
    })
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()
      c.output(
        t.same(
          input,
          {
            continent: {
              __typename: 'Continent',
              name: 'Antarctica'
            }
          }
        ).toString()
      )
      t.end()
    }
  }))
  .apply(ParDo.of(new NoopWriterFn()))

  p.run().waitUntilFinish()
})

tap.test('specify query with variable', t => {
  /**
   * Publically available GraphQL endpoint with list of countries:
   */
  const url = 'https://countries.trevorblades.com/'

  const p = Pipeline.create()

  p
  .apply(
    new GraphQlReadableStream({
      url,
      options: {
        query: gql`
          query($code: String) {
            continent(code: $code) {
              name
            }
          }
        `,
        variables: {
          code: 'AF'
        }
      }
    })
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()
      c.output(
        t.same(
          input,
          {
            continent: {
              __typename: 'Continent',
              name: 'Africa'
            }
          }
        ).toString()
      )
      t.end()
    }
  }))
  .apply(ParDo.of(new NoopWriterFn()))

  p.run().waitUntilFinish()
})
