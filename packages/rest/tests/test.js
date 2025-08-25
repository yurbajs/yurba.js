import { REST } from '../dist/index.js';

const client = new REST('y.CgHuRYgMIUrNEQGl3mEFLS8LI88LHda3')

try {
  console.log(await client.users.me())
  console.log(await client.users.friends())

} catch (error) {
  console.error('Error:', error)
}
