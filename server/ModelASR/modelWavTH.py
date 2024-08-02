from datetime import time
import torch
from torchaudio.transforms import Resample
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from pythainlp.tokenize import word_tokenize, Tokenizer
from pythainlp.tag import pos_tag
import numpy as np
import soundfile as sf
import os
import wave

# Load pretrained processor and model
processor = Wav2Vec2Processor.from_pretrained("airesearch/wav2vec2-large-xlsr-53-th")
model = Wav2Vec2ForCTC.from_pretrained("airesearch/wav2vec2-large-xlsr-53-th")

def transcribe_audio(audio_path):
    # Load audio file
    waveform, sample_rate = sf.read(audio_path)
    waveform = torch.from_numpy(waveform).float().unsqueeze(0)

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

def transcribe_audio_from_microphone(file_path):
    try:
        print(f"Audio file saved to {file_path}")

        if os.path.getsize(file_path) == 0:
            raise ValueError("Audio file is empty")
        
        # อ่านไฟล์ WAV ด้วย soundfile
        waveform, sample_rate = sf.read(file_path)
        waveform = torch.from_numpy(waveform).float()
        
        if waveform.ndim == 1:
            waveform = waveform.unsqueeze(0)
        else:
            waveform = waveform.mean(axis=1)  # แปลงเป็น mono ถ้าเป็น stereo
        
        # Resample to 16,000 Hz ถ้าจำเป็น
        if sample_rate != 16000:
            resampler = Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)

        # เปลี่ยนเป็น inputs ของโมเดล
        inputs = processor(waveform[0], sampling_rate=16000, return_tensors="pt", padding=True)

        with torch.no_grad():
            logits = model(inputs.input_values).logits

        predicted_ids = torch.argmax(logits, dim=-1)
        transcriptions = processor.batch_decode(predicted_ids)
        transcribed_text = word_tokenize(transcriptions[0])
        transcribe_sentence = ''.join(word for word in transcribed_text if word.strip())

        # แสดงข้อความที่ถอดได้ในคอนโซล
        print(f"Transcribed text: {transcribe_sentence}")

        return transcribe_sentence
        
    except ValueError as ve:
        print(f"Value error: {ve}")
        return f"Value error: {ve}"
    except IOError as ioe:
        print(f"IO error: {ioe}")
        return f"IO error: {ioe}"
    except Exception as e:
        print(f"Unexpected error: {e}")
        return f"Unexpected error: {e}"
