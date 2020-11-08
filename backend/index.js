const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
var Chance = require('chance');
const jwt = require('jsonwebtoken')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()


const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

var chance = new Chance();

const MONGODB_URI = 'mongodb+srv://admin:NIyiss9Tn098XyIl@cluster0.7xg2i.mongodb.net/phonebook?retryWrites=true&w=majority'

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`    
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  
  type Author {
    name: String!
    born: String
    bookCount: Int!
    id: ID!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]
    allAuthors: [Author!]
    me: User
  }
  type Mutation {
    addBook(
      author: String!
      title: String!
      published: Int!
      genres: [String]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
  type Subscription {
    bookAdded: Book!
  }
`
const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (author) {
          const books = await Book.find({
            author: author._id
          }).populate('author')
          return books;
        } else {
          throw new UserInputError('Not exist', {
            invalidArgs: args.author,
          })
        }
      }
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }
      return Book.find({}).populate('author');
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      if (authors.length > 0) {
        return authors.map(async (author) => {
          console.log("authors", author)
          const bookCount = await Book.find({ author: author._id })
          return {
            name: author.name,
            id: author._id,
            born: author.born,
            bookCount: bookCount.length
          }
        })
      }
      return authors
    },
  },
  Subscription: {
    personAdded: {
      subscribe: () => pubsub.asyncIterator(['PERSON_ADDED'])
    },
  },
  Mutation: {
    createUser: (root, args) => {
      const user = new User({ ...args })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'password') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
    editAuthor: (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      let targetAuthor = authors.find((author) => author.name === args.name)
      if (targetAuthor) {
        targetAuthor.born = args.setBornTo
        return targetAuthor
      }
      return null
    },
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const book = await Book.findOne({ title: args.title })
      const author = await Author.findOne({ name: args.author })
      if (book) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.title,
        })
      }
      if (!author) {
        const newAuthor = new Author({
          name: args.author,
          born: null
        })
        try {
          await newAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        const newBook = new Book({
          ...args,
          author: newAuthor
        })
        try {
          await newBook.save()
          pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
          return newBook;
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      } else {
        const newBook = new Book({
          ...args,
          author: author
        })
        try {
          await newBook.save()
          pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
          return newBook
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      return;
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id).populate('friends')
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscription ready at ${subscriptionsUrl}`)
})