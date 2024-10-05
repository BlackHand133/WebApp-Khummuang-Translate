import os
import re
from pythainlp.tokenize import word_tokenize, Tokenizer
from pythainlp.corpus import thai_words
from collections import defaultdict
import logging
from functools import lru_cache
from collections import Counter

class Translator:
    def __init__(self, vocab_path=None, dictionary_path=None, phrase_path=None, is_thai=False):
        self.custom_tokenizer = None
        self.word_translation = None
        self.phrases = {}
        self.is_thai = is_thai
        
        if vocab_path:
            self.vocab = self.load_vocabulary(vocab_path)
        else:
            self.vocab = None

        if dictionary_path:
            self.word_translation = self.load_dictionary(dictionary_path)
            # สร้าง custom dictionary สำหรับการตัดคำ
            custom_words = set(self.word_translation.keys()) | thai_words()
            self.custom_tokenizer = Tokenizer(custom_dict=custom_words, engine='newmm')
        
        if phrase_path:
            self.phrases = self.load_phrases(phrase_path)

        self.logger = self.setup_logger()
        self.unknown_words = Counter()

    def setup_logger(self):
        logger = logging.getLogger('TranslatorLogger')
        logger.setLevel(logging.INFO)
        handler = logging.FileHandler('translator.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    def load_vocabulary(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                vocab = [line.strip() for line in f.readlines()]
            return set(vocab)
        except FileNotFoundError:
            self.logger.error(f"ไม่พบไฟล์ vocabulary: {file_path}")
            return set()
        except Exception as e:
            self.logger.error(f"เกิดข้อผิดพลาดในการโหลด vocabulary: {e}")
            return set()

    def load_dictionary(self, file_path):
        word_translation = defaultdict(lambda: None)
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                for line in file:
                    try:
                        source_word, target_word = line.strip().split(',')
                        word_translation[source_word.lower()] = target_word
                    except ValueError:
                        self.logger.warning(f"รูปแบบไม่ถูกต้องในบรรทัด: {line}")
        except FileNotFoundError:
            self.logger.error(f"ไม่พบไฟล์พจนานุกรม: {file_path}")
        except Exception as e:
            self.logger.error(f"เกิดข้อผิดพลาดในการโหลดพจนานุกรม: {e}")
        return word_translation

    def load_phrases(self, file_path):
        phrases = {}
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    for line in file:
                        source, target = line.strip().split('\t')
                        phrases[source.lower()] = target
            except FileNotFoundError:
                self.logger.error(f"ไม่พบไฟล์วลี: {file_path}")
            except Exception as e:
                self.logger.error(f"เกิดข้อผิดพลาดในการโหลดวลี: {e}")
        return phrases

    def tokenize(self, sentence):
        if self.is_thai:
            words = word_tokenize(sentence, engine='newmm')
        else:
            words = self.custom_tokenizer.word_tokenize(sentence) if self.custom_tokenizer else sentence.split()
        
        # แยกคำและช่องว่าง
        tokens = []
        current_space = ''
        for i, word in enumerate(words):
            if i > 0:
                space = re.match(r'\s*', sentence[sentence.index(word):]).group()
                if space:
                    tokens.append(space)
                    current_space = ''
                elif current_space:
                    tokens.append(current_space)
                    current_space = ''
            tokens.append(word)
            if i == len(words) - 1:
                current_space = re.search(r'\s*$', sentence).group()
                if current_space:
                    tokens.append(current_space)
        return tokens

    def handle_unknown_word(self, word):
        self.unknown_words[word.lower()] += 1
        return word  # Return the original word

    @lru_cache(maxsize=1000)
    def translate_sentence(self, sentence):
        # Step 1: Tokenize the sentence
        tokens = self.tokenize(sentence)
        print(f"Tokenized words: {tokens}")  # Debug: แสดงผลการตัดคำ
        
        # Step 2: Translate phrases and individual words
        translated_tokens = []
        i = 0
        while i < len(tokens):
            if tokens[i].strip():  # ถ้าเป็นคำ (ไม่ใช่ช่องว่าง)
                # Try to match phrases first
                phrase_found = False
                for phrase, translation in sorted(self.phrases.items(), key=lambda x: len(x[0].split()), reverse=True):
                    phrase_words = phrase.lower().split()
                    if i + len(phrase_words) <= len(tokens) and [w.lower() for w in tokens[i:i+len(phrase_words)] if w.strip()] == phrase_words:
                        translated_tokens.append(translation)
                        i += len(phrase_words)
                        phrase_found = True
                        break
                
                if not phrase_found:
                    # Try to match multi-word dictionary entries
                    for j in range(min(5, len(tokens) - i), 0, -1):  # Try up to 5-word phrases
                        multi_word = ' '.join([w for w in tokens[i:i+j] if w.strip()]).lower()
                        if multi_word in self.word_translation:
                            translated_tokens.append(self.word_translation[multi_word])
                            i += j
                            break
                    else:
                        # If no phrase or multi-word match, translate single word
                        word = tokens[i].lower()
                        translated = self.word_translation.get(word, self.handle_unknown_word(tokens[i]))
                        print(f"Word: {word}, Translated: {translated}")  # Debug: แสดงการแปลทีละคำ
                        translated_tokens.append(translated)
                        i += 1
            else:  # ถ้าเป็นช่องว่าง
                translated_tokens.append(tokens[i])
                i += 1
        
        # Step 3: Post-processing
        translated_sentence = self.post_process(translated_tokens)
        
        self.logger.info(f"Translated: {sentence} -> {translated_sentence}")
        return translated_sentence

    def post_process(self, translated_tokens):
        # รวมคำและช่องว่างกลับเป็นประโยค
        return ''.join(translated_tokens)

    def get_unknown_word_report(self, top_n=10):
        return self.unknown_words.most_common(top_n)
    
    def reset_unknown_word_counter(self):
        self.unknown_words.clear()

    def save_unknown_word_report(self, file_path):
        with open(file_path, 'w', encoding='utf-8') as f:
            for word, count in self.unknown_words.items():
                f.write(f"{word},{count}\n")
        self.logger.info(f"Unknown word report saved to {file_path}")

    def translate_text(self, text):
        sentences = re.split(r'(?<=\.)\s*', text)  # แยกประโยคโดยรักษาช่องว่างระหว่างประโยค
        translated_sentences = [self.translate_sentence(sentence) for sentence in sentences if sentence.strip()]
        return ''.join(translated_sentences)

    def clear_cache(self):
        self.translate_sentence.cache_clear()

# Usage
base_dir = os.path.dirname(os.path.abspath(__file__))
thai_dictionary_path = os.path.join(base_dir, 'data', 'THtoKM.txt')
thai_phrase_path = os.path.join(base_dir, 'data', 'THtoKM_phrases.txt')
thai_translator = Translator(dictionary_path=thai_dictionary_path, phrase_path=thai_phrase_path, is_thai=True)

km_vocab_path = os.path.join(base_dir, 'data', 'KMcutting.txt')
km_dictionary_path = os.path.join(base_dir, 'data', 'KMtoTH.txt')
km_phrase_path = os.path.join(base_dir, 'data', 'KMtoTH_phrases.txt')
km_translator = Translator(vocab_path=km_vocab_path, dictionary_path=km_dictionary_path, phrase_path=km_phrase_path)

# Example usage
km_text = "ป้อ   ไป  ไหน  มา"
thai_translation = km_translator.translate_text(km_text)
print(f"Kam Muang: {km_text}")
print(f"Thai: {thai_translation}")

# Additional test
thai_text = "พ่อ   ไป  ไหน  มา"
km_translation = thai_translator.translate_text(thai_text)
print(f"Thai: {thai_text}")
print(f"Kam Muang: {km_translation}")