import React, { useState } from 'react'
import { gql, useQuery } from '@apollo/client';

const ALL_PERSONS = gql`
query {
  allBooks {
    title
    author{
      name
    }
    published
    id
    genres
  }
}
`
const Books = (props) => {
  const [selectedGenre, setGenre] = useState()
  const result = useQuery(ALL_PERSONS)

  if (!props.show) {
    return null
  }


  if (result.loading) {
    return <div>loading...</div>
  }

  const genersList = result.data.allBooks
    .reduce((init, { genres }) => init.concat(genres), [])
  const uniqueList = genersList.filter((item, pos) => genersList.indexOf(item) == pos)
  console.log("genersList", uniqueList)
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {result.data.allBooks.
            filter((a) => selectedGenre ? a.genres.includes(selectedGenre) : a)
            .map(a =>
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            )}
        </tbody>
      </table>
      {
        uniqueList.map((genre) => <button key={genre} onClick={() => setGenre(genre)}>{genre}</button>)
      }
    </div>
  )
}

export default Books