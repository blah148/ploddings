import React from 'react';

function YouTubeEmbed ({ youtube_link }) {

  var slicedLink = youtube_link.substring("https://www.youtube.com/watch?v=".length);
	var finishedLink = slicedLink.split('&')[0];
	const tryingReal = `https://www.youtube-nocookie.com/embed/${finishedLink}`;
	
  return (
		<iframe 
			width="560" 
			height="315" 
			src={tryingReal}
			title="YouTube video player" 
			frameBorder="0" 
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
			allowFullScreen>
		</iframe>
  );
};

export default YouTubeEmbed;

