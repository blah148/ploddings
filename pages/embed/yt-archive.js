import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../utils/supabase';
import SEO from '../components/SEO';

const YoutubeArchiveTable = () => {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'thread', direction: 'asc' });

  useEffect(() => {
    fetchData();
  }, [sortConfig]);

  const fetchData = async () => {
    let { data: youtubeArchive, error } = await supabase
      .from('youtube_archive')
      .select('song, thread, playlist_yt_link, tablature_link, uploaded_at')
      .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

    if (error) console.error('Error fetching data:', error);
    else setData(youtubeArchive);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key ? (prevConfig.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  // Truncation function for tablature links
  const truncateLink1 = (link) => {
    return link && link.length > 25 ? `${link.substring(0, 25)}...` : link;  };

  const truncateLink2 = (link) => {
    return link && link.length > 20 ? `${link.substring(0, 20)}...` : link;  };


  return (
    <>
      <SEO
        title="YT archive - Ploddings"
        slug="/yt-archive"
        nofollow={true}
      />
      <div style={{ margin: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['song', 'thread', 'tablature_link', 'uploaded_at'].map((key) => (
                <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer', borderBottom: '2px solid #ccc' }}>
                  {key}
                  {sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 ? '#f9f9f9' : '#fff' }}>
                <td>
                  <a href={item.playlist_yt_link} target="_blank" rel="noopener noreferrer">
                    {truncateLink1(item.song)}
                  </a>
                </td>
                <td>{item.thread}</td>
                <td>
                  <a href={item.tablature_link} target="_blank" rel="noopener noreferrer">
                    {truncateLink2(item.tablature_link)}
                  </a>
                </td>
                <td>{new Date(item.uploaded_at).toISOString().split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default YoutubeArchiveTable;

