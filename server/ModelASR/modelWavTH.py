from datetime import time
import torch
import torchaudio
from torchaudio.transforms import Resample
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from pythainlp.tokenize import word_tokenize, Tokenizer
from pythainlp.tag import pos_tag
import pyaudio
import numpy as np
import soundfile as sf

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
import os

def transcribe_audio_from_microphone(file):
    audio_path = 'temp_recording.wav'
    
    try:
        # Save the file to a temporary path
        file.save(audio_path)
        print(f"Audio file saved to {audio_path}")
        
        # Check if file is empty
        if os.path.getsize(audio_path) == 0:
            raise ValueError("Audio file is empty")
        
        # Check if file format is correct
        if not audio_path.lower().endswith('.wav'):
            raise ValueError("Unsupported audio file format")
        
    except Exception as e:
        print(f"Error saving file: {e}")
        return "Error saving file"

    try:
        transcription = transcribe_audio(audio_path)
        return transcription
    except Exception as e:
        print(f"Error during transcription: {e}")
        return "Error during transcription"


