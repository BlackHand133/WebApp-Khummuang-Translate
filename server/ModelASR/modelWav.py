from datetime import time
import numpy as np
import soundfile as sf
import os
import subprocess
from torchaudio.transforms import Resample
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from pythainlp.tokenize import word_tokenize
import torch
from datetime import datetime
from models import db, AudioRecord 
from flask import current_app
from werkzeug.utils import secure_filename

# Path to ffmpeg
ffmpeg_path = "C:/ffmpeg/bin/ffmpeg.exe"

def load_model_and_processor(model_name):
    processor = Wav2Vec2Processor.from_pretrained(model_name)
    model = Wav2Vec2ForCTC.from_pretrained(model_name)
    return processor, model

# Load processors and models
KMprocessor, KMmodel = load_model_and_processor("BlackHand13/Wav2Vec2-large-xlsr-53-km")
THprocessor, THmodel = load_model_and_processor("airesearch/wav2vec2-large-xlsr-53-th")

class AudioTranscriber:
    def __init__(self):
        self.KMprocessor = KMprocessor
        self.KMmodel = KMmodel
        self.THprocessor = THprocessor
        self.THmodel = THmodel

    def transcribe_audio(self, audio_path, language):
        # Load audio file
        waveform, sample_rate = sf.read(audio_path)
        waveform = torch.from_numpy(waveform).float().unsqueeze(0)

        # Resample to 16,000 Hz
        resampler = Resample(orig_freq=sample_rate, new_freq=16000)
        waveform_resampled = resampler(waveform)

        # Select appropriate processor and model
        if language.lower() == 'km':
            processor = self.KMprocessor
            model = self.KMmodel
        elif language.lower() == 'th':
            processor = self.THprocessor
            model = self.THmodel
        else:
            raise ValueError("Unsupported language. Use 'km' for Khmer or 'th' for Thai.")

        # Convert audio to numbers
        inputs = processor(waveform_resampled[0], sampling_rate=16000, return_tensors="pt", padding=True)

        # Predict transcription using Wav2Vec2 model
        with torch.no_grad():
            logits = model(input_values=inputs.input_values).logits

        # Decode predicted transcription
        predicted_ids = torch.argmax(logits, dim=-1)
        transcriptions = processor.batch_decode(predicted_ids)
        transcribed_text = word_tokenize(transcriptions[0])
        transcribe_sentence = ''.join(word for word in transcribed_text if word.strip())

        return transcribe_sentence


class AudioTranscriberMic(AudioTranscriber):
    def transcribe_audio_from_microphone(self, file_path, language):
        try:
            print(f"Audio file saved to {file_path}")

            if os.path.getsize(file_path) == 0:
                raise ValueError("Audio file is empty")
            
            return self.transcribe_audio(file_path, language)
            
        except ValueError as ve:
            print(f"Value error: {ve}")
            return f"Value error: {ve}"
        except IOError as ioe:
            print(f"IO error: {ioe}")
            return f"IO error: {ioe}"
        except Exception as e:
            print(f"Unexpected error: {e}")
            return f"Unexpected error: {e}"

def convert_to_mono_and_16000hz(audio_data):
    input_audio_path = 'input.wav'
    output_audio_path = 'output.wav'
    
    # บันทึกข้อมูลเสียงที่รับเข้ามาเป็นไฟล์ชั่วคราว
    with open(input_audio_path, 'wb') as f:
        f.write(audio_data)
    
    # ใช้ ffmpeg แปลงไฟล์เสียงเป็น mono และ 16,000 Hz
    subprocess.run([
        ffmpeg_path, '-i', input_audio_path,
        '-ar', '16000', '-ac', '1', 
        output_audio_path
    ], check=True)
    
    # อ่านข้อมูลเสียงที่แปลงแล้ว
    with open(output_audio_path, 'rb') as f:
        converted_audio = f.read()
    
    # ลบไฟล์ชั่วคราว
    os.remove(input_audio_path)
    os.remove(output_audio_path)
    
    return converted_audio
    
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

def process_audio(audio_data, language):
    audio_data = convert_to_mono_and_16000hz(audio_data)
    
    # แปลงข้อมูลเสียงเป็น numpy array และสร้าง tensor
    audio_array = np.frombuffer(audio_data, dtype=np.int16)
    audio_tensor = torch.tensor(audio_array).float().unsqueeze(0)
    
    transcriber = AudioTranscriber()
    transcription = transcriber.transcribe_audio(audio_tensor, language)
    
    return transcription

def process_and_save_audio(audio_file, language, user_id):
    try:
        # แปลงไฟล์เป็น WAV
        wav_file_path = convert_to_wav(audio_file.filename)
        
        # ถอดความเสียง
        transcriber = AudioTranscriber()
        transcription = transcriber.transcribe_audio(wav_file_path, language)
        
        # คำนวณระยะเวลาของไฟล์เสียง
        with sf.SoundFile(wav_file_path) as sound_file:
            duration = len(sound_file) / sound_file.samplerate
        
        # สร้าง URL สำหรับไฟล์เสียง (ปรับตามโครงสร้างของเซิร์ฟเวอร์)
        audio_url = f"/uploads/audio/{os.path.basename(wav_file_path)}"
        
        # สร้างรายการใหม่ในฐานข้อมูล
        new_record = AudioRecord(
            user_id=user_id,
            audio_url=audio_url,
            transcription=transcription,
            time=datetime.now(),
            duration=int(duration),
            language=language
        )
        
        # บันทึกลงฐานข้อมูล
        db.session.add(new_record)
        db.session.commit()
        
        return {"message": "Audio processed and saved successfully", "record_id": new_record.id}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}
    finally:
        # ลบไฟล์ชั่วคราว
        if os.path.exists(wav_file_path):
            os.remove(wav_file_path)

def convert_and_save_audio_file(audio_file, user_type, file_id):
    try:
        # สร้างชื่อไฟล์ใหม่
        filename = f"audio-{datetime.now().year}-{user_type}{file_id:06d}.wav"
        
        # กำหนด path สำหรับบันทึกไฟล์
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'audio')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        output_file_path = os.path.join(upload_folder, filename)
        
        # บันทึกไฟล์ที่อัปโหลดมาชั่วคราว
        temp_file_path = os.path.join(upload_folder, secure_filename(audio_file.filename))
        audio_file.save(temp_file_path)
        
        # ตรวจสอบนามสกุลไฟล์
        file_extension = os.path.splitext(temp_file_path)[1].lower()
        
        if file_extension != '.wav':
            # แปลงไฟล์เป็น WAV ถ้าไม่ใช่ไฟล์ WAV
            command = [
                ffmpeg_path,
                "-i", temp_file_path,
                "-ar", "16000",  # Sample rate
                "-ac", "1",      # Number of channels (mono)
                output_file_path
            ]
            subprocess.run(command, check=True)
            os.remove(temp_file_path)  # ลบไฟล์ชั่วคราว
        else:
            # ถ้าเป็นไฟล์ WAV อยู่แล้ว ให้เปลี่ยนชื่อไฟล์
            os.rename(temp_file_path, output_file_path)
        
        return output_file_path
    except subprocess.CalledProcessError as e:
        current_app.logger.error(f"Error converting audio to WAV: {e}")
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise
    except Exception as e:
        current_app.logger.error(f"Unexpected error in convert_and_save_audio_file: {e}")
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise