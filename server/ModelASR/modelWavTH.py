from datetime import time
import torch
import torchaudio
from torchaudio.transforms import Resample
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from pythainlp.tokenize import word_tokenize, Tokenizer
from pythainlp.tag import pos_tag
import pyaudio
import numpy as np

# Load pretrained processor and model
processor = Wav2Vec2Processor.from_pretrained("airesearch/wav2vec2-large-xlsr-53-th")
model = Wav2Vec2ForCTC.from_pretrained("airesearch/wav2vec2-large-xlsr-53-th")

def transcribe_audio(audio_path):
    # Load audio file
    waveform, sample_rate = torchaudio.load(audio_path)

    # Resample to 16,000 Hz
    resampler = Resample(orig_freq=sample_rate, new_freq=16000)
    waveform_resampled = resampler(waveform)

    # Convert audio to numbers
    inputs = processor(waveform_resampled[0], sampling_rate=16000, return_tensors="pt", padding=True)

    # Predict transcription using Wav2Vec2 model
    with torch.no_grad():
        logits = model(inputs.input_values).logits

    # Decode predicted transcription
    predicted_ids = torch.argmax(logits, dim=-1)
    transcriptions = processor.batch_decode(predicted_ids)
    transcribed_text = word_tokenize(transcriptions[0])
    transcribe_sentence = ''.join(word for word in transcribed_text if word.strip())

    return transcribe_sentence

#def tag_text(text):
 #   words = word_tokenize(text)
  #  tags = pos_tag(words,corpus='orchid_ud')
   # return list(zip(words, tags))

def transcribe_audio_from_microphone(sample_rate=16000, chunk_size=1024):
    """
    Function to transcribe audio from the microphone in real-time.
    """
    def callback(in_data, frame_count, time_info, status):
        try:
            # Convert byte data to numpy array
            audio_data = np.frombuffer(in_data, dtype=np.float32)
            
            # Convert numpy array to torch tensor
            waveform = torch.tensor(audio_data).unsqueeze(0)
            
            # Resample to 16,000 Hz
            resampler = Resample(orig_freq=sample_rate, new_freq=16000)
            waveform_resampled = resampler(waveform)
            
            # Convert audio to numbers
            inputs = processor(waveform_resampled[0], sampling_rate=16000, return_tensors="pt", padding=True)
            
            # Predict transcription using Wav2Vec2 model
            with torch.no_grad():
                logits = model(inputs.input_values).logits
            
            # Decode predicted transcription
            predicted_ids = torch.argmax(logits, dim=-1)
            transcriptions = processor.batch_decode(predicted_ids)
            transcribed_text = word_tokenize(transcriptions[0])
            transcribe_sentence = ''.join(word for word in transcribed_text if word.strip())
            
            return transcribe_sentence

        except Exception as e:
            print(f"Error in callback: {e}")
            return ''

    # Initialize the microphone stream
    pyaudio_instance = pyaudio.PyAudio()
    
    # Open microphone stream
    stream = pyaudio_instance.open(
        format=pyaudio.paFloat32,
        channels=1,
        rate=sample_rate,
        input=True,
        frames_per_buffer=chunk_size,
        stream_callback=lambda in_data, frame_count, time_info, status: (callback(in_data, frame_count, time_info, status), pyaudio.paContinue)
    )
    
    print("Recording...")
    transcribed_text = ''
    try:
        stream.start_stream()
        while stream.is_active():
            time.sleep(0.1)  # Adjust sleep time for real-time performance
    except KeyboardInterrupt:
        print("Stopped recording.")
        # Perform final processing to handle any remaining audio
        transcribed_text = callback(b'', 0, None, None)
    finally:
        # Cleanup
        stream.stop_stream()
        stream.close()
        pyaudio_instance.terminate()
    
    return transcribed_text
