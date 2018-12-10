const tap = require('tap')
tap.comment('GraphQlReadableStream')

const path = require('path')
const gql = require('graphql-tag')

const DoFn = require('./../../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../../lib/sdk/io/node-streams/FileWriterFn')
const ParDo = require('./../../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../../lib/sdk/NodeStreamsPipeline')

const GraphQlReadableStream = require('./../../../../../lib/sdk/io/node-streams/raw/GraphQlReadableStream')

tap.test('specify query', t => {
  /**
   * Publically available GraphQL endpoint with list of countries:
   */
  const url = 'https://countries.trevorblades.com/'
  const outputPath = path.resolve(__dirname,
    '../../../../fixtures/output/GraphQlReadableStream')

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
        )
      )
      t.end()
    }
  }))
  .apply(ParDo.of(new FileWriterFn(outputPath)))

  p.run().waitUntilFinish()
})

tap.test('specify query with variable', t => {
  /**
   * Publically available GraphQL endpoint with list of countries:
   */
  const url = 'https://countries.trevorblades.com/'
  const outputPath = path.resolve(__dirname,
    '../../../../fixtures/output/GraphQlReadableStream')

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
        )
      )
      t.end()
    }
  }))
  .apply(ParDo.of(new FileWriterFn(outputPath)))

  p.run().waitUntilFinish()
})
