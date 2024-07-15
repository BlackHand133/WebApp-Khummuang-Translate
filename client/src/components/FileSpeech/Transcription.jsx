import React, { useState } from 'react';
import axios from 'axios'; // นำเข้า Axios

const Transcription = () => {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTranscribe = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/api/transcribe', formData);

      if (!response.data.transcription) {
        throw new Error('Failed to transcribe audio');
      }

      setTranscription(response.data.transcription);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <input type="file" accept=".wav" onChange={handleFileChange} />
      <button onClick={handleTranscribe}>Transcribe</button>
      
      {error && <p>Error: {error}</p>}
      
      <ul>
        {transcription.map((item, index) => (
          <li key={index}>
            <span>{item.word}</span> - <span>{item.tag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transcription;
