from pydub import AudioSegment

# Load your .wav file
sound = AudioSegment.from_wav("assets/audio/01_Welcome.wav")

# Export as .mp3
sound.export("assets/audio/01_Welcome.mp3", format="mp3")