
const Accounts = require('../modules/user.js')

describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const register = await account.register('doej', 'password', 'doej@gmail.com')
		expect(register).toBe(true)
		account.tearDown()
		done()
	})

	test('register a duplicate username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password', 'doej@gmail.com')
		await expect( account.register('doej', 'password', 'doej@gmail.com') )
			.rejects.toEqual( Error('username "doej" already in use') )
		account.tearDown()
		done()
	})

	test('error if blank username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register('', 'password', 'doej@gmail.com') )
			.rejects.toEqual( Error('missing field') )
		done()
	})

	test('error if blank password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register('doej', '', 'doej@gmail.com') )
			.rejects.toEqual( Error('missing field') )
		done()
	})
	test('error if blank email', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register('doej', 'password', '') )
			.rejects.toEqual( Error('missing field') )
		done()
	})
	test('error if duplicate email', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('bondj', 'p455w0rd', 'doej@gmail.com')
		await expect( account.register('doej', 'password', 'doej@gmail.com') )
			.rejects.toEqual( Error('email address "doej@gmail.com" is already in use') )
		done()
	})
})

describe('login()', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password')
		const valid = await account.login('doej', 'password')
		expect(valid).toBe(true)
		done()
	})

	test('invalid username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password')
		await expect( account.login('roej', 'password') )
			.rejects.toEqual( Error('username "roej" not found') )
		done()
	})

	test('invalid password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password')
		await expect( account.login('doej', 'bad') )
			.rejects.toEqual( Error('invalid password for account "doej"') )
		done()
	})

})
