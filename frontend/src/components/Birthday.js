import React, { useState } from 'react';
import Select from "react-select"
import { gql, useMutation, useQuery } from '@apollo/client';

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
const ALL_PERSONS = gql`
query {
  allAuthors {
    name
  }
}
`

const Birthday = (props) => {
    const [born, setBorn] = useState('')
    const [selectedOption, setSelectedOption] = useState("");
    const [createBook] = useMutation(EDIT_AUTHOR)
    const result = useQuery(ALL_PERSONS)

    if (result.loading) {
        return <div>loading...</div>
    }

    if (!props.show) {
        return null
    }

    const submit = async (event) => {
        event.preventDefault()
        createBook({ variables: { name: selectedOption.value, born: parseInt(born) } })
        setSelectedOption("")
        setBorn('')

    }

    const nameList = result.data.allAuthors.map(({ name }) => ({ label: name, value: name }))
    console.log("nameList", nameList)
    return (
        <div>
            <h1>Set birthday</h1>
            <form onSubmit={submit}>
                <div className="App">
                    <Select
                        defaultValue={nameList[0]}
                        onChange={setSelectedOption}
                        options={nameList}
                    />
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