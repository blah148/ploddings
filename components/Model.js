import dynamic from 'next/dynamic';

const My3DModelComponent = dynamic(() => import('../components/TokenIcon3d'), {
  ssr: false // This ensures that the component is not server-side rendered
});

export default function Home() {
  return (
    <div>
      <h1>My 3D Model</h1>
      <My3DModelComponent />
    </div>
  );
}

