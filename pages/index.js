import Link from 'next/link';
import ChatWithGPT from '../components/ChatWithGPT.js';
import Logout from '../components/Logout';
require('dotenv').config();


const Home = () => {
  return (
    <div>
      <header>
        <h1>Welcome to Ploddings Guitar Site</h1>
      </header>
      <main>
        <p>
          Explore our collection of guitar tablature
        </p>
			<Logout />
      </main>
    </div>
  );
};

export default Home;

