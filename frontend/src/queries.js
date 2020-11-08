import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
query {
  allAuthors  {
    name
    born
    bookCount
    id
  }
}
`

export const EDIT_AUTHOR = gql`
mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(
    name: $name,
    setBornTo: $born,
  ) {
    name
    born
    id
  }
}
`

export const LOGIN = gql`
mutation login($username: String!, $password: String!) {
    login(
    username: $username,
    password: $password,
  ) {
    value
  }
}
`


export const ALL_BOOKS = gql`
query getAllBooks($genre: String){
  allBooks (genre: $genre) {
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
export const CREATE_BOOK = gql`
mutation createBook($author: String!, $published: Int!, $title: String!, $genres: [String]!) {
  addBook(
    author: $author,
    published: $published,
    title: $title,
    genres:$genres
  ) {
    title
    published
    id
    genres
  }
}
`

export const ME = gql`
query {
  me {
    favoriteGenre
  }
}
`