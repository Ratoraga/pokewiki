import login from "./index.html"
import home from "./home.html"
import { db } from "./db.ts"

const loggedUsers: any = {}

const srv = Bun.serve({
    port: 3000,
    routes: {
        "/": login,

        "/home": home,
        "/cadastro": {
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`
                    INSERT INTO users(username, email, password_hash)
                    VALUES(:username, :email, :password_hash)
                `)
                const hash = await Bun.password.hash(body.password)
                const data = query.run({
                    ":username": body.username,
                    ":email": body.email,
                    ":password_hash": hash
                })
                return Response.json(data)
            }
        },
        "/user": {
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`
                    INSERT INTO users(username, password_hash)
                    VALUES(:username, :password_hash)
                `)
                const hash = await Bun.password.hash(body.password)
                const data = query.run({
                    ":username": body.username,
                    ":password_hash": hash
                })
                const uuid = crypto.randomUUID();
                loggedUsers[uuid] = data
                req.cookies.set("ses", uuid)
                return Response.json(data)
            },
        },

        "/login": {
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`
                    SELECT * FROM users
                    WHERE username=:username
                    LIMIT 1
                `)
                const data: any = query.get({
                    ":username": body.username
                })
                if (!data) {
                    return Response.json({ msg: "usuário não encontrado" }, { status: 404 })
                }
                const isMatch = await Bun.password.verify(body.password, data.password_hash)
                if (!isMatch) {
                    return Response.json({ msg: "senha não confere" }, { status: 401 })
                }
                const uuid = crypto.randomUUID();
                loggedUsers[uuid] = data
                req.cookies.set("ses", uuid)
                return Response.json(isMatch)
            }
        },

        "/login/user": (req) => {
            const ses = req.cookies.get("ses")
            if (!ses || !loggedUsers[ses])
                return Response.json({ msg: "não permitido" }, { status: 401 })
            return Response.json(loggedUsers[ses])
        }
    },
})

console.log(`Server running on ${srv.url}`)