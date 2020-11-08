import React, { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client';
import { ME, ALL_BOOKS } from '../queries'


const Books = (props) => {
    const [genre, setGenre] = useState('')
    const userResult = useQuery(ME)
    const bookResult = useQuery(ALL_BOOKS, {
        variables: { genre: genre },
    });

    useEffect(() => {
        if (userResult.data) {
            const genre = userResult.data.me.favoriteGenre
            setGenre(genre)
        }
    }, [userResult.loading, bookResult.loading])

    if (!props.show) {
        return null
    }


    if (userResult.loading || bookResult.loading) {
        return <div>loading...</div>
    }

    return (
        <div>
            <h2>Recommend</h2>

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
                    {bookResult.data.allBooks
                        .map(a =>
                            <tr key={a.title}>
                                <td>{a.title}</td>
                                <td>{a.author.name}</td>
                                <td>{a.published}</td>
                            </tr>
                        )}
                </tbody>
            </table>
        </div>
    )
}

export default Books