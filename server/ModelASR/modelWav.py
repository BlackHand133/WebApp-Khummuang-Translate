from datetime import time
import numpy as np
import soundfile as sf
import os
import subprocess
import onnxruntime as ort
from torchaudio.transforms import Resample
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from pythainlp.tokenize import word_tokenize
import torch


# Path to ffmpeg
ffmpeg_path = "C:/ffmpeg/bin/ffmpeg.exe"

def load_model_and_processor(model_name, model_path):
    processor = Wav2Vec2Processor.from_pretrained(model_name)
    #ort_session = ort.InferenceSession(model_path)
    ort_session = Wav2Vec2ForCTC.from_pretrained(model_path)
    return processor, ort_session

# Load processors and models
#KMprocessor, KMort_session = load_model_and_processor("BlackHand13/Wav2Vec2-large-xlsr-53-km", "./ModelASR/Wav2Vec2-large-xlsr-53-km.onnx")
#THprocessor, THort_session = load_model_and_processor("airesearch/wav2vec2-large-xlsr-53-th", "./ModelASR/wav2vec2-large-xlsr-53-th.onnx")
KMprocessor, KMort_session = load_model_and_processor("BlackHand13/Wav2Vec2-large-xlsr-53-km", "BlackHand13/Wav2Vec2-large-xlsr-53-km")
THprocessor, THort_session = load_model_and_processor("airesearch/wav2vec2-large-xlsr-53-th", "airesearch/wav2vec2-large-xlsr-53-th")

class AudioTranscriber:
    def __init__(self):
        self.KMprocessor = KMprocessor
        self.KMort_session = KMort_session
        self.THprocessor = THprocessor
        self.THort_session = THort_session

    def transcribeKM_audio(audio_path):
        # Load audio file
        waveform, sample_rate = sf.read(audio_path)
        waveform = torch.from_numpy(waveform).float().unsqueeze(0)

        # Resample to 16,000 Hz
        resampler = Resample(orig_freq=sample_rate, new_freq=16000)
        waveform_resampled = resampler(waveform)

        # Convert audio to numbers
        inputs = KMprocessor(waveform_resampled[0], sampling_rate=16000, return_tensors="np", padding=True)

        # Predict transcription using Wav2Vec2 model
        ort_inputs = {KMort_session.get_inputs()[0].name: inputs["input_values"]}
        ort_outs = KMort_session.run(None, ort_inputs)

        # Decode predicted transcription
        predicted_ids = np.argmax(ort_outs[0], axis=-1)
        transcriptions = KMprocessor.batch_decode(predicted_ids)
        transcribed_text = word_tokenize(transcriptions[0])
        transcribe_sentence = ''.join(word for word in transcribed_text if word.strip())

        return transcribe_sentence

    
    def transcribeTH_audio(audio_path):
        # Load audio file
        waveform, sample_rate = sf.read(audio_path)
        waveform = torch.from_numpy(waveform).float().unsqueeze(0)

        # Resample to 16,000 Hz
        resampler = Resample(orig_freq=sample_rate, new_freq=16000)
        waveform_resampled = resampler(waveform)

        # Convert audio to numbers
        inputs = THprocessor(waveform_resampled[0], sampling_rate=16000, return_tensors="np", padding=True)

        # Predict transcription using Wav2Vec2 model
        ort_inputs = {THort_session.get_inputs()[0].name: inputs["input_values"]}
        ort_outs = THort_session.run(None, ort_inputs)

        # Decode predicted transcription
        predicted_ids = np.argmax(ort_outs[0], axis=-1)
        transcriptions = THprocessor.batch_decode(predicted_ids)
        transcribed_text = word_tokenize(transcriptions[0])
        transcribe_sentence = ''.join(word for word in transcribed_text if word.strip())

        return transcribe_sentence
    
class AudioTranscriberMic:
    def __init__(self):
        self.KMprocessor = KMprocessor
        self.KMort_session = KMort_session
        self.THprocessor = THprocessor
        self.THort_session = THort_session

    def transcribeKM_audio_from_microphone(file_path):
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
            inputs = KMprocessor(waveform[0], sampling_rate=16000, return_tensors="np", padding=True)

            ort_inputs = {KMort_session.get_inputs()[0].name: inputs["input_values"]}
            ort_outs = KMort_session.run(None, ort_inputs)

            predicted_ids = np.argmax(ort_outs[0], axis=-1)
            transcriptions = KMprocessor.batch_decode(predicted_ids)
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
        
    def transcribeTH_audio_from_microphone(file_path):
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
            inputs = THprocessor(waveform[0], sampling_rate=16000, return_tensors="np", padding=True)

            ort_inputs = {THort_session.get_inputs()[0].name: inputs["input_values"]}
            ort_outs = THort_session.run(None, ort_inputs)

            predicted_ids = np.argmax(ort_outs[0], axis=-1)
            transcriptions = THprocessor.batch_decode(predicted_ids)
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
    
def convert_to_wav(file_path):
    try:
        # Extract file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        
        # Construct the output file path
        output_file_path = os.path.splitext(file_path)[0] + '.wav'

        # If the output file already exists, remove it
        if os.path.exists(output_file_path):
            os.remove(output_file_path)
            print(f"Removed existing file: {output_file_path}")

        # If it's already a WAV file, no need to convert
        if file_extension == '.wav':
            return file_path

        # Construct the ffmpeg command
        command = [
            ffmpeg_path,
            "-i", file_path,
            "-ar", "16000",  # Sample rate
            "-ac", "1",      # Number of channels (mono)
            output_file_path
        ]

        # Run the command using subprocess
        subprocess.run(command, check=True)

        print(f"Converted audio file to WAV: {output_file_path}")
        return output_file_path
    except subprocess.CalledProcessError as e:
        print(f"Error converting audio to WAV: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise
    
def convert_to_wav(file_path):
    try:
        # Extract file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        
        # Construct the output file path
        output_file_path = os.path.splitext(file_path)[0] + '.wav'

        # If the output file already exists, remove it
        if os.path.exists(output_file_path):
            os.remove(output_file_path)
            print(f"Removed existing file: {output_file_path}")

        # If it's already a WAV file, no need to convert
        if file_extension == '.wav':
            return file_path

        # Construct the ffmpeg command
        command = [
            ffmpeg_path,
            "-i", file_path,
            "-ar", "16000",  # Sample rate
            "-ac", "1",      # Number of channels (mono)
            output_file_path
        ]

        # Run the command using subprocess
        subprocess.run(command, check=True)

        print(f"Converted audio file to WAV: {output_file_path}")
        return output_file_path
    except subprocess.CalledProcessError as e:
        print(f"Error converting audio to WAV: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise

    

def convert_to_mono_and_16000hz(audio_data):
    input_audio_path = 'input.wav'
    output_audio_path = 'output.wav'
    
    # บันทึกข้อมูลเสียงที่รับเข้ามาเป็นไฟล์ชั่วคราว
    with open(input_audio_path, 'wb') as f:
        f.write(audio_data)
    
    # ใช้ ffmpeg แปลงไฟล์เสียงเป็น mono และ 16,000 Hz
    subprocess.run([
        'ffmpeg', '-i', input_audio_path,
        '-ar', '16000', '-ac', '1', 
        output_audio_path
    ], check=True)
    
    # อ่านข้อมูลเสียงที่แปลงแล้ว
    with open(output_audio_path, 'rb') as f:
        converted_audio = f.read()
    
    return converted_audio

def process_audioKM(audio_data):
    audio_data = convert_to_mono_and_16000hz(audio_data)
    
    # แปลงข้อมูลเสียงเป็น numpy array และสร้าง tensor
    audio_array = np.frombuffer(audio_data, dtype=np.int16)
    audio_tensor = torch.tensor(audio_array).float().unsqueeze(0)
    
    ort_inputs = {KMort_session.get_inputs()[0].name: audio_tensor}

    # ทำการคาดการณ์ด้วย ONNX Runtime
    ort_outs = KMort_session.run(None, ort_inputs)
    predicted_ids = np.argmax(ort_outs[0], axis=-1)
    transcription = KMprocessor.batch_decode(predicted_ids)
    
    return transcription[0]


def process_audioTH(audio_data):
    audio_data = convert_to_mono_and_16000hz(audio_data)
    
    # แปลงข้อมูลเสียงเป็น numpy array และสร้าง tensor
    audio_array = np.frombuffer(audio_data, dtype=np.int16)
    audio_tensor = torch.tensor(audio_array).float().unsqueeze(0)
    
    ort_inputs = {THort_session.get_inputs()[0].name: audio_tensor}

    # ทำการคาดการณ์ด้วย ONNX Runtime
    ort_outs = THort_session.run(None, ort_inputs)
    predicted_ids = np.argmax(ort_outs[0], axis=-1)
    transcription = THprocessor.batch_decode(predicted_ids)
    
    return transcription[0]