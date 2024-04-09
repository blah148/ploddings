import dynamic from 'next/dynamic';

const ModelViewer = dynamic(
  () => import('@google/model-viewer'),
  { ssr: false, loading: () => <p>Loading...</p> }
);

const My3DModelComponent = () => {
  const modelUrl = 'https://f005.backblazeb2.com/file/unique-files/coin.glb';

  return (
	<>
		<div>test</div>
    <ModelViewer
      src={modelUrl}
      alt="A 3D model of a coin"
      ar
      auto-rotate
      camera-controls
    />
	</>
  );
};

export default My3DModelComponent;

