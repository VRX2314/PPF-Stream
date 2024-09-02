import React, { useState, useEffect } from 'react'
import { json } from 'react-router-dom'
import Solve from './Solve'

function Chat() {
    const [data, setData] = useState('')
    const [component, setComponent] = useState(() => {
        return
    })

    const createComponentFromJsonString = (jsonString) => {
        // Parse the JSON string to an object
        const jsonObject = JSON.parse(jsonString)

        // Extract the component type and data
        const { Component, Data } = jsonObject

        const plainText = Data

        // Generate the appropriate React component based on the "Component" field
        if (Component === 'Paragraph') {
            // Return a <p> element with plain text
            return <p dangerouslySetInnerHTML={{ __html: plainText }} />
        } else if (Component === 'Table') {
            // Return a <table> element with plain text
            const { headers, rows } = Data
            return (
                <table
                    border="1"
                    cellPadding="5"
                    style={{
                        borderCollapse: 'collapse',
                        width: '100%',
                        marginTop: '16px'
                    }}
                >
                    <thead>
                        <tr>
                            {headers.map((header, i) => (
                                <th key={i}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/stream')
                if (!response.ok || !response.body) {
                    throw response.statusText
                }

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let newVal = '' // Buffer for streaming tokens
                let stack = []
                let currComponent = [] // List of Components to Render

                while (true) {
                    const { value, done } = await reader.read()
                    if (done) {
                        break
                    }

                    const decodedChunk = decoder.decode(value, { stream: true })
                    setData((prevValue) => `${prevValue}${decodedChunk}`)

                    // Stack Logic for JSON Validation
                    if (decodedChunk == '{') {
                        stack.push('{')
                        console.log(stack)
                    }

                    if (stack.length != 0) {
                        newVal += decodedChunk
                        console.log(newVal)
                    }

                    if (decodedChunk == '}') {
                        stack.pop()
                        if (!stack.length) {
                            newVal = newVal.replace(/\\"/g, '"')
                            currComponent.push(
                                createComponentFromJsonString(newVal)
                            )
                            setComponent(currComponent)
                            newVal = ''
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        const onPageLoad = () => {
            fetchData()
        }

        window.addEventListener('load', onPageLoad) // Allowing page to load first.

        return () => {
            window.removeEventListener('load', onPageLoad)
        }
    }, [])

    return (
        <>
            <div>{component}</div>
            {/* <Solve jsonInput={dummy} /> */}
        </>
    )
}

export default Chat
