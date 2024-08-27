import express from 'express';
import { client } from '../index';
import { checkPassword } from '../utilities/hash'

const loginRoutes = express.Router()

const postLogin =  async (req: express.Request, res: express.Response) => {
	try {
		let user:any = await client.query(
			'select * from users where username = $1',
			[req.body.username]
		)

		let matchpw = await checkPassword({plainPassword: req.body.password,hashedPassword: user.rows[0].password})
		
		if(matchpw){
			req.session.user = user.rows[0].username
			req.session.userId = user.rows[0].id
		}
		
		if (!req.session.user) {
			res.json('fail')
		} else if (user.rows[0].is_admin) {
			res.json('admin')
		} else {
			res.json('done')
		}
		console.log(req.session)
	} catch (e) {
		console.log(e)
	}
}

loginRoutes.post('/login', postLogin)

export { loginRoutes, postLogin }