import React, { useEffect, useState } from 'react';

const TableOfContents = ({ htmlContent, onUpdate }) => {
  const [toc, setToc] = useState([]);

  useEffect(() => {
    const generateTOCAndUpdateContent = () => {
      if (!htmlContent) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const headings = doc.querySelectorAll('h2, h3');
      const tocItems = [];
      
      headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id; // Inject ID for anchor linking
        tocItems.push({
          id,
          title: heading.textContent,
          tagName: heading.tagName,
        });
      });

      setToc(tocItems);
      onUpdate(doc.body.innerHTML); // Pass updated HTML back to parent
    };

    generateTOCAndUpdateContent();
  }, [htmlContent, onUpdate]);

  if (toc.length === 0) return null;

  return (
    <div>
      <h2>Table of Contents</h2>
      <ul>
        {toc.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;

