const express = require('express')
const cors = require('cors')
const app = express()
const fs = require('fs')

app.use(cors())
// Stream playground
app.get('/stream', (req, res) => {
    console.log('API Called')
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff'
    })

    const sleep = (time) => {
        return new Promise((resolve) => setTimeout(resolve, time))
    }

    const data = fs.readFileSync('./stream.txt', 'utf-8')

    // const interval = setInterval(() => {
    // const data1 = Math.random().toString(36).substring(2, 8);
    // const data2 = Math.random().toString(36).substring(2, 8);
    // res.write(`${data1} ${data2}`);
    // }, 10);

    // for (let i = 0; i < data.length; i++) {
    //   setTimeout(() => {
    //     res.write(`${data.charAt(i)}`);
    //   }, 1000);
    // }
    let i = 0

    const read = async () => {
        while (i < data.length) {
            await sleep(1)
            res.write(`${data.charAt(i)}`)
            i++
        }

        // setTimeout(() => {
        //   clearInterval(interval);
        //   res.end();
        // }, 1000);
    }
    read()
})

const port = 3000
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})
