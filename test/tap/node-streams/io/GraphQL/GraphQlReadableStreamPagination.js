const tap = require('tap')
tap.comment('GraphQlReadableStreamPagination')

const path = require('path')
const gql = require('graphql-tag')

const {
  Count,
  DoFn,
  GraphQlReadableStream,
  NoopWriterFn,
  ParDo,
  Pipeline
} = require('../../../../../')

tap.test('two stages, different queries', async t => {
  /**
   * Publically available GraphQL endpoint for MusicBrainz:
   */
  const url = 'https://graphbrainz.herokuapp.com/'

  /**
   * The first step runs a query to get a list, and also gets a
   * cursor which can be used to retrieve more results:
   */
  let cursor
  let list1

  let p = Pipeline.create()
  p
  .apply(
    new GraphQlReadableStream({
      url,
      options: {
        query: gql`
          query AppleLabels {
            search {
              labels(query: "Apple", first: 5) {
                ...labelResults
              }
            }
          }

          fragment labelResults on LabelConnection {
            pageInfo {
              endCursor
            }
            edges {
              cursor
              node {
                name
              }
            }
          }
        `
      }
    })
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()

      /**
       * Save the cursor for the next pipeline:
       */
      cursor = input.search.labels.pageInfo.endCursor

      /**
       * Save the names in alphabetical order:
       */
      list1 = input.search.labels.edges.map(edge => edge.node.name)
      list1.sort()

      /**
       * Check that we have the right number of results:
       */
      c.output(
        t.same(
          input.search.labels.edges.length,
          5
        ).toString()
      )
    }
  }))
  .apply(ParDo.of(new NoopWriterFn()))
  await p.run().waitUntilFinish()

  /**
   * The next pipeline uses the cursor from the previous
   * pipeline to get another list:
   */
  let list2
  p = Pipeline.create()
  p
  .apply(
    new GraphQlReadableStream({
      url,
      options: {
        query: gql`
          query AppleLabels($cursor: String) {
            search {
              labels(query: "Apple", first: 5, after: $cursor) {
                ...labelResults
              }
            }
          }

          fragment labelResults on LabelConnection {
            pageInfo {
              endCursor
            }
            edges {
              cursor
              node {
                name
              }
            }
          }
        `,
        variables: {
          cursor
        }
      }
    })
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()

      /**
       * Save the names in alphabetical order:
       */
      list2 = input.search.labels.edges.map(edge => edge.node.name)
      list2.sort()

      /**
       * Check that we have the right number of results:
       */
      c.output(
        t.same(
          input.search.labels.edges.length,
          5
        ).toString()
      )
    }
  }))
  .apply(ParDo.of(new NoopWriterFn()))
  await p.run().waitUntilFinish()

  /**
   * Ensure that the two lists are different:
   */
  t.notSame(list1, list2)
  t.end()
})

tap.test('two stages, one query', async t => {
  /**
   * Publically available GraphQL endpoint for MusicBrainz:
   */
  const url = 'https://graphbrainz.herokuapp.com/'

  const query = gql`
    query GoldenLabels($cursor: String) {
      search {
        labels(query: "Golden", first: 5, after: $cursor) {
          ...labelResults
        }
      }
    }

    fragment labelResults on LabelConnection {
      pageInfo {
        endCursor
      }
      edges {
        cursor
        node {
          name
        }
      }
    }
  `

  /**
   * The first step runs a query to get a list, and also gets a
   * cursor which can be used to retrieve more results:
   */
  let cursor
  let list1

  let p = Pipeline.create()
  p
  .apply(
    new GraphQlReadableStream({
      url,
      options: {
        query
      }
    })
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()

      /**
       * Save the cursor for the next pipeline:
       */
      cursor = input.search.labels.pageInfo.endCursor

      /**
       * Save the names in alphabetical order:
       */
      list1 = input.search.labels.edges.map(edge => edge.node.name)
      list1.sort()

      /**
       * Check that we have the right number of results:
       */
      c.output(
        t.same(
          input.search.labels.edges.length,
          5
        ).toString()
      )
    }
  }))
  .apply(ParDo.of(new NoopWriterFn()))
  await p.run().waitUntilFinish()

  /**
   * The next pipeline uses the cursor from the previous
   * pipeline to get another list. Note that the only difference
   * between this query and the previous one is the presence
   * of the 'cursor' variable:
   */
  let list2
  p = Pipeline.create()
  p
  .apply(
    new GraphQlReadableStream({
      url,
      options: {
        query,
        variables: {
          cursor
        }
      }
    })
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()

      /**
       * Save the names in alphabetical order:
       */
      list2 = input.search.labels.edges.map(edge => edge.node.name)
      list2.sort()

      /**
       * Check that we have the right number of results:
       */
      c.output(
        t.same(
          input.search.labels.edges.length,
          5
        ).toString()
      )
    }
  }))
  .apply(ParDo.of(new NoopWriterFn()))
  await p.run().waitUntilFinish()

  /**
   * Ensure that the two lists are different:
   */
  t.notSame(list1, list2)
  t.end()
})

tap.test('GraphQlReadableStream handles pagination', async t => {
  /**
   * Publically available GraphQL endpoint for MusicBrainz:
   */
  const url = 'https://graphbrainz.herokuapp.com/'

  const query = gql`
    query HarpLabels($cursor: String) {
      search {
        labels(query: "Harp", first: 5, after: $cursor) {
          ...labelResults
        }
      }
    }

    fragment labelResults on LabelConnection {
      pageInfo {
        endCursor
      }
      edges {
        cursor
        node {
          name
        }
      }
    }
  `

  let p = Pipeline.create()
  p
  .apply(
    new GraphQlReadableStream({
      url,
      options: {
        query
      },
      cursorPathFn: data => data.search.labels.pageInfo.endCursor,
      size: 10 / 5
    })
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()

      for (const edge of input.search.labels.edges) {
        c.output(edge)
      }
    }
  }))
  .apply(Count.globally())
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      const input = c.element()

      /**
       * Check that we have the right number of results:
       */
      c.output(
        t.same(
          input,
          10
        ).toString()
      )
    }
  }))
  .apply(ParDo.of(new NoopWriterFn()))
  await p.run().waitUntilFinish()

  t.end()
})
