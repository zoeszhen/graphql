import React, { useState } from 'react';
import Select from "react-select"
import { useMutation, useQuery } from '@apollo/client';
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'


const Birthday = (props) => {
    const [born, setBorn] = useState('')
    const [selectedOption, setSelectedOption] = useState("");
    const [createBook] = useMutation(EDIT_AUTHOR)
    const result = useQuery(ALL_AUTHORS)

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