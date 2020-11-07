import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const EDIT_AUTHOR = gql`
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

const Birthday = (props) => {
    const [name, setName] = useState('')
    const [born, setBorn] = useState('')
    const [createBook] = useMutation(EDIT_AUTHOR)


    if (!props.show) {
        return null
    }

    const submit = async (event) => {
        event.preventDefault()
        createBook({ variables: { name, born: parseInt(born) } })

        setName('')
        setBorn('')

    }

    return (
        <div>
            <form onSubmit={submit}>
                <div>
                    name
                <input value={name} onChange={({ target }) => setName(target.value)} />
                </div>
                <div>
                    born
                <input value={born} onChange={({ target }) => setBorn(target.value)} type="number" />
                </div>
                <button type='submit'>update author</button>
            </form>
        </div>
    )
}

export default Birthday