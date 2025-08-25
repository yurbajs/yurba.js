import { REST } from '../dist/index.js';

const client = new REST('y.CgHuRYgMIUrNEQGl3mEFLS8LI88LHda3')

try {
  console.log(await client.video.upload('tests/assets/firstvideoyurba.mp4'))

} catch (error) {
  console.error('Error:', error)
}
