import os

class Translator:
    def __init__(self, vocab_path, dictionary_path):
        self.vocab = self.load_vocabulary(vocab_path)
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

    def translate_sentence(self, sentence):
        # แยกคำในประโยค
        words = sentence.split()

        # แปลแต่ละคำโดยใช้พจนานุกรม
        translated_words = [self.word_translation.get(word.lower(), word) for word in words]

        # รวมคำที่แปลแล้วกลับเป็นประโยค
        translated_sentence = ' '.join(translated_words)

        return translated_sentence

# เส้นทางไปยังไฟล์ข้อมูล
base_dir = os.path.dirname(os.path.abspath(__file__))
vocab_path = os.path.join(base_dir, 'data', 'KMcutting.txt')
dictionary_path = os.path.join(base_dir, 'data', 'KMtoTH.txt')

# สร้างอินสแตนซ์ของ Translator
translator = Translator(vocab_path, dictionary_path)
