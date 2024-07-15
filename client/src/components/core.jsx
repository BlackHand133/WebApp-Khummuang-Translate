return(<>
    <div>
            <a href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            <button onClick={transcribeAudio} disabled={!audioFile || loading}>
              Transcribe
            </button>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {transcription && (
              <p>
                 Transcription: {transcription.map((word, index) => (
                 <span key={index} className={`word ${word.tag}`}>{word.word}</span>
                ))}
              </p>
            )}
    
          </div>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
          </>
    )