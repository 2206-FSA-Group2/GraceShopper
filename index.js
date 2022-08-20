const http = require("http")
const app = require("./app")

const PORT = process.env["PORT"] || 5432
// const { PORT = 3000 } = process.env
const server = http.createServer(app)

server.listen(PORT, () => {
  console.log(
    (`Server is listening on PORT:${PORT}`)
  )
})
