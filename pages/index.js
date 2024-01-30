import Link from 'next/link';
import ChatWithGPT from '../components/ChatWithGPT.js';

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
			<ChatWithGPT />
      </main>
    </div>
  );
};

export default Home;

