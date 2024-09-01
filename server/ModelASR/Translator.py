import os
from pythainlp.tokenize import Tokenizer, word_tokenize

class Translator:
    def __init__(self, vocab_path=None, dictionary_path=None):
        self.custom_tokenizer = None
        self.word_translation = None
        
        if vocab_path:
            self.vocab = self.load_vocabulary(vocab_path)
            self.custom_tokenizer = self.get_custom_tokenizer(self.vocab)
        else:
            self.vocab = None

        if dictionary_path:
            self.word_translation = self.load_dictionary(dictionary_path)
    
    def load_vocabulary(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            vocab = [line.strip() for line in f.readlines()]
        return vocab

    def load_dictionary(self, file_path):
        word_translation = {}
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                northern_word, thai_word = line.strip().split(',')
                word_translation[northern_word.lower()] = thai_word
        return word_translation

    def get_custom_tokenizer(self, vocab):
        custom_vocab = set(vocab)
        custom_tokenizer = Tokenizer(custom_dict=custom_vocab, engine='newmm')
        return custom_tokenizer

    def km_tokenize(self, sentence):
        if self.custom_tokenizer:
            # Tokenize using custom tokenizer
            tokenized_words = self.custom_tokenizer.word_tokenize(sentence)
        else:
            # ใช้ตัวตัดคำใน PyThaiNLP สำหรับภาษาไทย
            tokenized_words = word_tokenize(sentence, engine='newmm')

        # Join tokenized words back into a sentence
        tokenized_sentence = " ".join(tokenized_words)
        return tokenized_sentence

    def translate_sentence(self, sentence):
        # ตัดคำในประโยค
        tokenized_sentence = self.km_tokenize(sentence)

        # แยกคำในประโยคที่ตัดแล้ว
        words = tokenized_sentence.split()

        if self.word_translation:
            # แปลแต่ละคำโดยใช้พจนานุกรม
            translated_words = [self.word_translation.get(word.lower(), word) for word in words]
        else:
            # ถ้าไม่มีพจนานุกรม ให้คืนคำเดิม
            translated_words = words

        # รวมคำที่แปลแล้วกลับเป็นประโยค
        translated_sentence = ' '.join(translated_words)

        return translated_sentence

# เส้นทางไปยังไฟล์ข้อมูล
base_dir = os.path.dirname(os.path.abspath(__file__))
# สำหรับภาษาไทย (ไม่ใช้ไฟล์ THcutting.txt)
thai_dictionary_path = os.path.join(base_dir, 'data', 'THtoKM.txt')
thai_translator = Translator(vocab_path=None, dictionary_path=thai_dictionary_path)

# สำหรับคำเมือง
km_vocab_path = os.path.join(base_dir, 'data', 'KMcutting.txt')
km_dictionary_path = os.path.join(base_dir, 'data', 'KMtoTH.txt')
km_translator = Translator(vocab_path=km_vocab_path, dictionary_path=km_dictionary_path)