



import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/authent';
import { FaDownload } from 'react-icons/fa'; // Import download icon from react-icons

const bucketDomain = 'notarization-1.obs.ap-southeast-2.myhuaweicloud.com';

const Verify = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // State to handle the selected image preview

  const router = useRouter();

  // Authentication logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch all files from the OBS bucket and handle metadata
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/request');
      const filesWithMetadata = await Promise.all(
        response.data.files.map(async (file) => {
          const fileExtension = file.file.split('.').pop().toLowerCase();

          if (fileExtension === 'json') {
            try {
              const jsonResponse = await axios.get(
                `https://${bucketDomain}/${file.file}`
              );
              return {
                ...file,
                metadata: jsonResponse.data,
              };
            } catch {
              return {
                ...file,
                metadata: 'Failed to load JSON content.',
              };
            }
          } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
            return {
              ...file,
              metadata: `https://${bucketDomain}/${file.file}`,
            };
          } else {
            return { ...file, metadata: 'N/A' };
          }
        })
      );
      setFiles(filesWithMetadata);
      setError('');
    } catch (err) {
      setError('Failed to fetch files from the bucket.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchFiles();
  }, [fetchFiles, user]);

  // Group files by UUID
  const groupedFiles = files.reduce((acc, { uuid, file, metadata }) => {
    if (!acc[uuid]) acc[uuid] = [];
    acc[uuid].push({ file, metadata });
    return acc;
  }, {});

  // Handle image preview
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl); // Show the larger image when clicked
  };

  // Close the image preview
  const closeImagePreview = () => {
    setSelectedImage(null);
  };

    // Delete a file
    const handleDelete = async (filename) => {
      const uuid = filename.split('/')[0]; // Extract UUID from filename
      if (!window.confirm(`Are you sure you want to delete the file with UUID: ${uuid}?`)) {
        return;
      }
      try {
        await axios.delete('/api/request', { data: { filename } });
        setFiles((prevFiles) => prevFiles.filter((file) => file.file !== filename));
        setError('');
      } catch (err) {
        setError('Failed to delete the file.');
      }
    };
  return (
    <div id="ocrContainer" style={{ marginTop: '20px', maxWidth: '1200px', width: '90%' }}>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h2 id="heading" style={{ color: 'white' }}>Notary related documents : </h2>
        {loading ? (
          <p>Loading files...</p>
        ) : error ? (
          <p style={{ color: 'white' }}>{error}</p>
        ) : Object.keys(groupedFiles).length === 0 ? (
          <p>No files found in the OBS bucket.</p>
        ) : (
          <table
            style={{
              color: 'white',
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed', // Ensure the table fits the container
            }}
          >
            <thead>
              <tr>
                <th style={{ border: '1px solid white', padding: '8px' }}>UUID</th>
             {  /* <th style={{ border: '1px solid white', padding: '8px' }}>Filename</th>*/}
                <th style={{ border: '1px solid white', padding: '8px' }}>URL</th>
                <th style={{ border: '1px solid white', padding: '8px' }}>Metadata</th> {/*<th style={{ border: '1px solid white', padding: '8px', wordWrap: 'break-word', maxWidth: '200px' }}>Metadata</th>*/}


                <th style={{ border: '1px solid white', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedFiles).map(([uuid, files]) =>
                files.map(({ file, metadata }, index) => (
                  <tr key={file}>
                    <td style={{ border: '1px solid white', padding: '8px' }}>
                      {index === 0 ? uuid : ''}
                    </td>
                  {/**<td style={{ border: '1px solid white', padding: '8px' }}>
                      <strong>{file}</strong>
                    </td> */}  
                    <td style={{ border: '1px solid white', padding: '8px' }}>
                      <a
                        href={`https://${bucketDomain}/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'lightblue' }}
                      >
                        <FaDownload /> {/* Use the download icon */}
                      </a>
                    </td>
                    <td style={{ border: '1px solid white', padding: '8px' }}>
                      {typeof metadata === 'object' ? (
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: 'white' }}>
                          {Object.entries(metadata)
                            .map(([key, value]) =>
                              typeof value === 'object'
                                ? `${key}: ${JSON.stringify(value).replace(/[{}"]/g, '')}`
                                : `${key}: ${value}`
                            )
                            .join('\n')}
                        </div>
                      ) : metadata.startsWith('http') ? (
                        <img
                          src={metadata}
                          alt="File preview"
                          onClick={() => handleImageClick(metadata)} // Handle click to preview image
                        /**  style={{ maxWidth: '100px', maxHeight: '100px', cursor: 'pointer' }} */style={{ border: '1px solid white', padding: '8px', wordWrap: 'break-word', maxWidth: '200px' }} 
                        />
                      ) : (
                        metadata
                      )}
                    </td>
                    <td style={{ border: '1px solid white', padding: '8px' }}>
                      
                        
                      
                      <button
                        onClick={() => handleDelete(file)}
                        style={{ color: 'white', backgroundColor: 'red', padding: '5px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Image preview modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeImagePreview}
        >
          <img
            src={selectedImage}
            alt="Selected"
            style={{ maxWidth: '90%', maxHeight: '90%' }}
          />
        </div>
      )}
    </div>
  );
};

export default Verify;
