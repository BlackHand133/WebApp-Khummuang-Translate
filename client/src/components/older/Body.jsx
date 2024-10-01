import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { debounce } from "lodash";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  Button,
  IconButton,
  Tooltip,
  Divider
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import TranslateIcon from "@mui/icons-material/Translate";
import InfoIcon from "@mui/icons-material/Info";
import Sidebar from "../Sidebar/Sidebar";
import Transcription from "../FileSpeech/Transcription";
import TextTranslation from "../TextTranslation/TextTranslation";
import SpeechMic from "../FileSpeech/SpeechMic";
import MobileMenu from "../MobileMenu/MobileMenu";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GuideModal from "../FileSpeech/GuideModal";

const Body = ({ username }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedOption, setSelectedOption] = useState("text");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [activeInput, setActiveInput] = useState("microphone");
  const [inputText, setInputText] = useState("");
  const [translations, setTranslations] = useState({
    text: "",
    upload: "",
    microphone: "",
  });
  const [Textlanguage, setTextLanguage] = useState("คำเมือง");
  const [Voicelanguage, setVoiceLanguage] = useState("คำเมือง");
  const [translatedText, setTranslatedText] = useState("");
  const [debouncedInputText, setDebouncedInputText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [rating, setRating] = useState("unknown");

  const [transcriptionState, setTranscriptionState] = useState({
    text: "",
    isLoading: false,
    error: "",
    status: "",
    audioUrl: "",
    audioBlob: null,
    liked: false,
  });

  const [speechMicState, setSpeechMicState] = useState({
    text: "",
    isLoading: false,
    error: "",
    status: "",
    audioUrl: "",
    audioBlob: null,
    liked: false,
  });

  const speechMicRef = useRef();
  const audioUrlRef = useRef(null);
  const [transcribedFiles, setTranscribedFiles] = useState({});

  const debouncedSetDebouncedInputText = useCallback(
    debounce((text) => setDebouncedInputText(text), 300),
    []
  );

  const handleRatingChange = useCallback((newRating) => {
    setRating(newRating);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear all state here
      setSelectedOption("text");
      setFile(null);
      setFileUrl(null);
      setActiveInput("microphone");
      setInputText("");
      setTranslations({ text: "", upload: "", microphone: "" });
      setTextLanguage("คำเมือง");
      setVoiceLanguage("คำเมือง");
      setTranscriptionState({
        text: "",
        isLoading: false,
        error: "",
        status: "",
        audioUrl: "",
        audioBlob: null,
        liked: false,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (transcriptionState.audioBlob) {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      const url = URL.createObjectURL(transcriptionState.audioBlob);
      setTranscriptionState((prev) => ({ ...prev, audioUrl: url }));
      audioUrlRef.current = url;
    }
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [transcriptionState.audioBlob]);

  const handleAudioRecorded = useCallback((blob) => {
    setTranscriptionState((prev) => ({ ...prev, audioBlob: blob }));
  }, []);

  const handleTextLanguageToggle = useCallback(() => {
    setTextLanguage((prev) => (prev === "คำเมือง" ? "ไทย" : "คำเมือง"));
    setInputText(translatedText);
    setTranslatedText(inputText);
  }, [inputText, translatedText]);

  const handleComponentSwitch = useCallback(() => {
    if (audioUrlRef.current) {
      setTranscriptionState((prev) => ({
        ...prev,
        audioUrl: audioUrlRef.current,
      }));
    }
  }, []);

  useEffect(() => {
    if (file) {
      const newFileUrl = URL.createObjectURL(file);
      setFileUrl(newFileUrl);
      return () => {
        URL.revokeObjectURL(newFileUrl);
      };
    }
  }, [file]);

  const handleTextLanguageChange = useCallback((newLanguage) => {
    setTextLanguage(newLanguage);
  }, []);

  const handleVoiceLanguageChange = useCallback((newLanguage) => {
    setVoiceLanguage(newLanguage);
  }, []);

  const handleOptionChange = useCallback(
    (option) => {
      setSelectedOption(option);
      setActiveInput(option === "upload" ? "upload" : "microphone");
      handleComponentSwitch();
    },
    [handleComponentSwitch]
  );

  const handleFileUpload = useCallback((uploadedFile) => {
    setFile(uploadedFile);
    setRating("unknown");
  }, []);

  const handleInputToggle = useCallback(
    (input) => {
      setActiveInput(input);
      handleComponentSwitch();
    },
    [handleComponentSwitch]
  );

  const handleTextChange = useCallback((event) => {
    const newText = event.target.value;
    setInputText(newText);
    debouncedSetDebouncedInputText(newText);
  }, []);

  const handleTranslationUpload = useCallback((translation) => {
    setTranslations((prev) => ({ ...prev, upload: translation }));
  }, []);

  const handleTranslationMic = useCallback((translation) => {
    setTranslations((prev) => ({ ...prev, microphone: translation }));
  }, []);

  const handleTranslationText = useCallback((translation) => {
    setTranslatedText(translation);
  }, []);

  const handleTranscriptionChange = useCallback((newTranscription, fileKey) => {
    setTranscriptionState((prev) => ({ ...prev, text: newTranscription }));
    if (fileKey) {
      setTranscribedFiles((prev) => ({ ...prev, [fileKey]: newTranscription }));
    }
  }, []);

  const handleSpeechMicChange = useCallback((newTranscription) => {
    setSpeechMicState((prev) => ({ ...prev, text: newTranscription }));
  }, []);

  const handleTranscriptionLoadingChange = useCallback((isLoading) => {
    setTranscriptionState((prev) => ({ ...prev, isLoading }));
  }, []);

  const handleTranscriptionErrorChange = useCallback((error) => {
    setTranscriptionState((prev) => ({ ...prev, error }));
  }, []);

  const getFileKey = useCallback((file) => {
    return file ? `${file.name}_${file.lastModified}` : null;
  }, []);

  const clearTranslation = useCallback(() => {
    if (selectedOption === "text") {
      setInputText("");
      setTranslations((prev) => ({ ...prev, text: "" }));
    } else if (activeInput === "upload") {
      setFile(null);
      setFileUrl(null);
      setTranslations((prev) => ({ ...prev, upload: "" }));
    } else {
      setTranslations((prev) => ({ ...prev, microphone: "" }));
    }
  }, [selectedOption, activeInput]);

  const memoizedTranslation = useMemo(() => {
    if (selectedOption === "text") {
      return translations.text;
    } else if (activeInput === "upload") {
      return translations.upload;
    } else {
      return translations.microphone;
    }
  }, [selectedOption, activeInput, translations]);

  const handleStartRecording = useCallback(() => {
    if (speechMicRef.current) {
      speechMicRef.current.startRecording();
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (speechMicRef.current) {
      speechMicRef.current.stopRecording();
    }
  }, []);

  const LanguageSwitch = useMemo(
    () =>
      ({ language, toggleLanguage }) =>
        (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
              my: "1em",
            }}
          >
            <Button
              sx={{
                borderRadius: "20px",
                padding: "8px 15px",
                border: "2px solid #e0e0e0",
                minWidth: "80px",
                bgcolor: "ButtonShadow",
                color: "black",
                transition: "background-color 0.3s",
                "&:hover": {
                  bgcolor: "#CBC3E3",
                },
              }}
              onClick={toggleLanguage}
            >
              <Typography
                sx={{
                  fontFamily: '"Mitr", sans-serif',
                  fontWeight: 400,
                  fontSize: "0.8rem",
                }}
              >
                {language}
              </Typography>
            </Button>
            <IconButton sx={{ color: "#4a90e2" }} onClick={toggleLanguage}>
              <SwapHorizIcon />
            </IconButton>
            <Button
              sx={{
                borderRadius: "20px",
                padding: "8px 15px",
                border: "1px solid #e0e0e0",
                minWidth: "80px",
                bgcolor: "ButtonShadow",
                color: "black",
                transition: "background-color 0.3s",
                "&:hover": {
                  bgcolor: "#CBC3E3",
                },
              }}
              onClick={toggleLanguage}
            >
              <Typography
                sx={{
                  fontFamily: '"Mitr", sans-serif',
                  fontWeight: 400,
                  fontSize: "0.8rem",
                }}
              >
                {language === "คำเมือง" ? "ไทย" : "คำเมือง"}
              </Typography>
            </Button>
          </Box>
        ),
    []
  );

  const transcriptionProps = useMemo(
    () => ({
      file,
      onTranslation: handleTranslationUpload,
      language: Voicelanguage,
      setLanguage: setVoiceLanguage,
      username,
      transcription: transcriptionState.text,
      setTranscription: handleTranscriptionChange,
      isLoading: transcriptionState.isLoading,
      setIsLoading: handleTranscriptionLoadingChange,
      error: transcriptionState.error,
      setError: handleTranscriptionErrorChange,
      transcribedFiles,
      setTranscribedFiles,
      getFileKey,
      isMobile,
      onFileUpload: handleFileUpload,
      rating,
      onRatingChange: handleRatingChange,
    }),
    [
      file,
      Voicelanguage,
      username,
      transcriptionState,
      transcribedFiles,
      isMobile,
      rating,
      handleTranslationUpload,
      setVoiceLanguage,
      handleTranscriptionChange,
      handleTranscriptionLoadingChange,
      handleTranscriptionErrorChange,
      handleFileUpload,
      handleRatingChange,
      getFileKey,
    ]
  );

  const AlertIcon = () => (
    <Tooltip
      title="คำเตือน: นี่เป็นเพียง prototype
      - สามารถแปลได้เพียงคำเท่านั้น
      - ไม่สามารถแปลได้ทุกคำ
      - ผลการแปลอาจไม่สมบูรณ์หรือไม่ถูกต้องทั้งหมด"
      arrow
    >
      <IconButton size="small">
        <InfoIcon fontSize="small" color="info" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Container
      maxWidth={isMobile ? false : "xl"}
      disableGutters={isMobile}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#ffffff",
        p: isMobile ? 0 : { xs: 1, md: 2 },
        mt: isMobile ? 0 : "10px",
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            width: { xs: "100%", md: "300px" },
            mb: { xs: 2, md: 0 },
            mr: { xs: 0, md: 2 },
            flexShrink: 0,
            position: { md: "sticky" },
            top: { md: "100px" },
            alignSelf: { md: "flex-start" },
            maxHeight: { md: "calc(100vh - 70px)" },
            overflowY: { md: "auto" },
            mt: { xs: 0, md: "-60px" },
          }}
        >
          <Sidebar
            onOptionChange={handleOptionChange}
            onFileUpload={handleFileUpload}
            onInputToggle={handleInputToggle}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onTextLanguageChange={handleTextLanguageChange}
            onVoiceLanguageChange={handleVoiceLanguageChange}
            selectedOption={selectedOption}
            activeInput={activeInput}
          />
        </Box>
      )}
  
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: isMobile ? 0.5 : 2,
        }}
      >
        {isMobile && (
          <MobileMenu
            onOptionChange={handleOptionChange}
            onInputToggle={handleInputToggle}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            selectedOption={selectedOption}
            activeInput={activeInput}
          />
        )}
  
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: isMobile ? 0.5 : 2,
            flexGrow: 1,
          }}
        >
          <Paper
            sx={{
              flex: 1,
              p: isMobile ? 0.5 : 2,
              borderRadius: isMobile ? 0 : "8px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: isMobile ? "auto" : "100px",
              bgcolor: "white",
              mb: { xs: 0.5, lg: 0 },
              boxShadow: isMobile ? "none" : 3,
            }}
            elevation={isMobile ? 0 : 3}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              {selectedOption === "text" && (
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {isMobile && (
                    <LanguageSwitch
                      language={Textlanguage}
                      toggleLanguage={handleTextLanguageToggle}
                    />
                  )}
                  <Box
                    elevation={isMobile ? 0 : 3}
                    sx={{
                      p: isMobile ? 2 : 3,
                      backgroundColor: "white",
                      borderRadius: isMobile ? 0 : "8px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        color: "#333",
                        fontFamily: '"Chakra Petch", sans-serif',
                        fontSize: isMobile ? "1rem" : "1.25rem",
                      }}
                    >
                      <TranslateIcon
                        sx={{ mr: 1, fontSize: isMobile ? "1.2rem" : "1.5rem" }}
                      />
                      แปลข้อความ
                      <AlertIcon />
                    </Typography>
                    <TextField
                      label="ป้อนข้อความ"
                      multiline
                      variant="outlined"
                      value={inputText}
                      onChange={handleTextChange}
                      fullWidth
                      sx={{
                        backgroundColor: "#ffffff",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#bdbdbd",
                          },
                          "&:hover fieldset": {
                            borderColor: "#9e9e9e",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#1976d2",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: '"Chakra Petch", sans-serif',
                          fontSize: isMobile ? "0.9rem" : "1.2rem",
                          fontWeight: 500,
                          color: "#1976d2",
                        },
                        "& .MuiInputBase-input": {
                          fontFamily: '"Chakra Petch", sans-serif',
                          fontSize: isMobile ? "0.9rem" : "1.1rem",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreateIcon
                              color="action"
                              sx={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      minRows={isMobile ? 3 : 5}
                      maxRows={isMobile ? 5 : 10}
                    />
                  </Box>
  
                  {isMobile && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: '"Chakra Petch", sans-serif',
                          color: "black",
                          mb: 1,
                          fontWeight: "bold",
                        }}
                      >
                        ผลการแปล
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <TextTranslation
                        textToTranslate={inputText}
                        onTranslation={handleTranslationText}
                        onClearTranslation={clearTranslation}
                        language={Textlanguage}
                        isMobile={isMobile}
                        translatedText={translatedText}
                        inputText={inputText}
                        setInputText={setInputText}
                      />
                      {memoizedTranslation && (
                        <Paper
                          elevation={1}
                          sx={{
                            mt: 1,
                            p: 1,
                            borderRadius: "4px",
                            width: "100%",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: '"Chakra Petch", sans-serif',
                              fontWeight: "500",
                              fontSize: "0.9rem",
                            }}
                          >
                            {memoizedTranslation}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Box>
              )}
  
              {selectedOption !== "text" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {activeInput === "upload" && (
                    <Box
                      sx={{
                        width: "100%",
                        mb: isMobile ? 1 : 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {isMobile ? (
                        <Transcription
                          {...transcriptionProps}
                          isMobile={true}
                        />
                      ) : (
                        <Paper
                          sx={{
                            p: 2,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            border: isDragging
                              ? "2px dashed #1976d2"
                              : "2px dashed #ccc",
                            backgroundColor: isDragging ? "#e3f2fd" : "#f5f5f5",
                            transition: "all 0.3s ease",
                          }}
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: '"Chakra Petch", sans-serif',
                              fontSize: "1.25rem",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            ไฟล์เสียงที่อัปโหลด
                            <AlertIcon />
                          </Typography>
                          {!fileUrl ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "150px",
                                width: "100%",
                                backgroundColor: "#f5f5f5",
                                borderRadius: 1,
                                opacity: 0.6,
                                textAlign: "center",
                              }}
                            >
                              <CloudUploadIcon
                                sx={{
                                  fontSize: 50,
                                  color: isDragging ? "#1976d2" : "#757575",
                                  mb: 2,
                                }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  color: isDragging ? "#1976d2" : "#757575",
                                }}
                              >
                                {isDragging
                                  ? "วางไฟล์เสียงที่นี่"
                                  : "ลากและวางไฟล์เสียงที่นี่ หรืออัปโหลดจากปุ่มทางด้านซ้าย"}
                              </Typography>
                            </Box>
                          ) : (
                            <>
                              <audio
                                controls
                                src={fileUrl}
                                style={{ width: "100%", marginTop: "10px" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  color: "#757575",
                                  textAlign: "center",
                                }}
                              >
                                {file.name}
                              </Typography>
                            </>
                          )}
                        </Paper>
                      )}
  
                      {!isMobile && fileUrl && (
                        <Box sx={{ width: "100%", mt: 2 }}>
                          <Transcription {...transcriptionProps} />
                        </Box>
                      )}
                    </Box>
                  )}
                  {activeInput === "microphone" && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <SpeechMic
                        ref={speechMicRef}
                        onTranslation={handleTranslationMic}
                        language={Voicelanguage}
                        setLanguage={handleVoiceLanguageChange}
                        transcription={speechMicState.text}
                        setTranscription={handleSpeechMicChange}
                        audioUrl={transcriptionState.audioUrl}
                        onAudioRecorded={handleAudioRecorded}
                        transcriptionStatus={transcriptionState.status}
                        setTranscriptionStatus={(status) =>
                          setTranscriptionState((prev) => ({ ...prev, status }))
                        }
                        translation={translations.microphone}
                        setTranslation={(newTranslation) =>
                          setTranslations((prev) => ({
                            ...prev,
                            microphone: newTranslation,
                          }))
                        }
                        isLoading={transcriptionState.isLoading}
                        setIsLoading={handleTranscriptionLoadingChange}
                        error={transcriptionState.error}
                        setError={handleTranscriptionErrorChange}
                        isMobile={isMobile}
                        rating={rating}
                        onRatingChange={handleRatingChange}
                      />
                    </Box>
                  )}
                </Box>
              )}
  
              {isMobile && selectedOption !== "text" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: "4px",
                      width: "100%",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontFamily: '"Chakra Petch", sans-serif',
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ผลการแปล
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {(activeInput === "upload"
                      ? translations.upload
                      : translations.microphone) && (
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: '"Chakra Petch", sans-serif',
                          fontWeight: "500",
                        }}
                      >
                        {activeInput === "upload"
                          ? translations.upload
                          : translations.microphone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
  
          {!isMobile && (
            <Paper
              sx={{
                flex: 1,
                borderRadius: "8px",
                backgroundColor: "white",
                height: "100%",
                minWidth: { xs: "100%", lg: "300px" },
                maxWidth: { lg: "500px" },
              }}
              elevation={3}
            >
              <Box sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  bgcolor: "black",
                  p: 1,
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Chakra Petch", sans-serif',
                    color: "white",
                  }}
                >
                  ผลการแปล
                </Typography>
              </Box>
              {selectedOption === "text" && (
                <Box sx={{ width: "100%" }}>
                  <TextTranslation
                    textToTranslate={debouncedInputText}
                    onTranslation={handleTranslationText}
                    onClearTranslation={clearTranslation}
                    language={Textlanguage}
                    isMobile={isMobile}
                    translatedText={translatedText}
                    inputText={inputText}
                    setInputText={setInputText}
                  />
                </Box>
              )}
              {memoizedTranslation && (
                <Paper
                  elevation={3}
                  sx={{ mt: 2, p: 2, borderRadius: "8px", width: "100%" }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"Chakra Petch", sans-serif',
                      fontWeight: "500",
                    }}
                  >
                    {memoizedTranslation}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  </Container>
);
};

export default React.memo(Body);