import React, { useState, useRef, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Trie Node for efficient search
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
    this.data = [];
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, data) {
    if (word.length < 3) return; // Skip short words to optimize
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEnd = true;
    node.data.push(data);
  }

  search(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char);
    }
    return this.collectData(node);
  }

  collectData(node) {
    const results = [];
    if (node.isEnd) {
      results.push(...node.data);
    }
    for (const child of node.children.values()) {
      results.push(...this.collectData(child));
    }
    return results;
  }
}

const UploadContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DropzoneArea = styled.div`
  border: 2px dashed #007bff;
  border-radius: 12px;
  padding: 3rem 1.5rem;
  text-align: center;
  background: ${props => (props.isDragActive ? '#e6f0ff' : '#f8f9fa')};
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #e6f0ff;
    border-color: #0056b3;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.2);
  }
`;

const AnalyzeButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  transition: background 0.2s ease;
  &:hover {
    background: #218838;
  }
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const VoiceButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #0056b3;
  }
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled(motion.div)`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.5rem;
  color: #007bff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
`;

const SectionContent = styled(motion.div)`
  font-size: 16px;
  line-height: 1.6;
  color: #333;
`;

const GeneratedImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  margin: 1.5rem 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 16px;
  text-align: center;
  margin-top: 1.5rem;
`;

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState({
    summary: true,
    disease: true,
    recommendations: true,
    when_to_seek_help: true,
    follow_up: true,
    image: true,
  });
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Initialize Trie for search
  const trie = useMemo(() => {
    const trie = new Trie();
    if (results && results.gemini_insights) {
      const insights = results.gemini_insights;
      if (typeof insights.summary === 'string') {
        insights.summary.split(' ').forEach(word => trie.insert(word, { type: 'summary', content: insights.summary }));
      }
      if (typeof insights.disease === 'string') {
        insights.disease.split(';').forEach(item => item.trim().split(' ').forEach(word => trie.insert(word, { type: 'disease', content: item.trim() })));
      }
 if (Array.isArray(insights.recommendations)) {
        insights.recommendations.forEach(rec => {
          if (typeof rec === 'string') {
            rec.split(' ').forEach(word => trie.insert(word, { type: 'recommendations', content: rec }));
          }
        });
      }
      if (Array.isArray(insights.when_to_seek_help)) {
        insights.when_to_seek_help.forEach(cond => {
          if (typeof cond === 'string') {
            cond.split(' ').forEach(word => trie.insert(word, { type: 'when_to_seek_help', content: cond }));
          }
        });
      }
      if (Array.isArray(insights.follow_up)) {
        insights.follow_up.forEach(action => {
          if (typeof action === 'string') {
            action.split(' ').forEach(word => trie.insert(word, { type: 'follow_up', content: action }));
          }
        });
      }
    }
    return trie;
  }, [results]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles, fileRejections) => {
      setError(null);
      if (fileRejections.length > 0) {
        toast.error(`Invalid file: ${fileRejections[0].errors[0].message}`);
        return;
      }
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setResults(null);
        setSearchQuery('');
      }
    },
  });

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      setError('No file selected');
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('language', 'en');

      const response = await fetch('http://localhost:8000/analyze-and-generate', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/x-ndjson',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let results = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status === 'complete') {
              if (!data.response || !data.response.gemini_insights) {
                throw new Error('Invalid response format: missing gemini_insights');
              }
              setResults(data.response);
              toast.success('Analysis completed successfully!');
            } else if (data.status === 'error') {
hingga
                throw new Error(data.message || 'Analysis error');
              } else if (data.status === 'gemini_complete') {
                if (!data.gemini_insights) {
                  throw new Error('Invalid gemini_insights format');
                }
                setResults(prev => ({ ...prev, gemini_insights: data.gemini_insights }));
                toast.info('Gemini insights received');
              } else {
                toast.info(data.message || `Processing: ${data.status}`);
              }
            } catch (e) {
              toast.error('Error processing response chunk');
              setError('Failed to parse analysis results');
            }
          }
        }
      } catch (error) {
        toast.error(`Analysis failed: ${error.message}`);
        setError(`Analysis failed: ${error.message}`);
      } finally {
        setAnalyzing(false);
      }
    };

    const handleVoice = async () => {
      if (!results || !results.gemini_insights || !results.gemini_insights.summary) {
        toast.error('No analysis results available for voice generation');
        setError('No results for voice generation');
        return;
      }

      setAudioLoading(true);
      setError(null);
      try {
        const textToSpeak = results.gemini_insights.summary;
        const response = await api.post('/api/analysis/generate-voice', {
          text: textToSpeak,
          language: 'en',
        }, {
          timeout: 600000,
        });

        if (response.data.success && response.data.audio_file) {
          const audioUrl = `http://localhost:8000${response.data.audio_file}`;
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
            setPlayingAudio(true);
            audioRef.current.onended = () => setPlayingAudio(false);
          }
          toast.success('Voice generated successfully!');
        } else {
          throw new Error(response.data.error || 'Voice generation failed');
        }
      } catch (error) {
        toast.error(`Voice generation failed: ${error.response?.data?.error || error.message}`);
        setError(`Voice generation failed: ${error.message}`);
      } finally {
        setAudioLoading(false);
      }
    };

    const saveToHistory = async () => {
      if (!results || !results.gemini_insights) {
        toast.error('No results to save to history');
        setError('No results to save');
        return;
      }

      try {
        const recordData = {
          title: `Medical Analysis - ${new Date().toLocaleDateString()}`,
          description: results.gemini_insights.summary || 'Medical report analysis',
          recordType: 'lab_report',
          date: new Date().toISOString(),
          parameters: results.parameters || [],
          notes: JSON.stringify(results.gemini_insights, null, 2),
          image_url: results.image_url || '',
        };

        const response = await api.post('/api/medical/records', recordData);
        if (response.data.success) {
          toast.success('Analysis saved to medical history!');
        } else {
          throw new Error(response.data.error || 'Failed to save to history');
        }
      } catch (error) {
        toast.error(`Failed to save to history: ${error.response?.data?.error || error.message}`);
        setError(`Failed to save to history: ${error.message}`);
      }
    };

    const toggleSection = (section) => {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const filterResults = () => {
      if (!results || !results.gemini_insights) {
        return {};
      }
      if (!searchQuery) {
        return results.gemini_insights; // Return full results if no search query
      }

      const searchResults = trie.search(searchQuery);
      const query = searchQuery.toLowerCase();
      const filtered = {
        summary: '',
        disease: '',
        recommendations: [],
        when_to_seek_help: [],
        follow_up: [],
      };

      // Trie-based search
      searchResults.forEach(result => {
        if (result.type === 'summary' && !filtered.summary) {
          filtered.summary = result.content;
        } else if (result.type === 'disease' && !filtered.disease.includes(result.content)) {
          filtered.disease += (filtered.disease ? '; ' : '') + result.content;
        } else if (result.type === 'recommendations' && !filtered.recommendations.includes(result.content)) {
          filtered.recommendations.push(result.content);
        } else if (result.type === 'when_to_seek_help' && !filtered.when_to_seek_help.includes(result.content)) {
          filtered.when_to_seek_help.push(result.content);
        } else if (result.type === 'follow_up' && !filtered.follow_up.includes(result.content)) {
          filtered.follow_up.push(result.content);
        }
      });

      // Fallback full-text search for broader matches
      const insights = results.gemini_insights;
      if (typeof insights.summary === 'string' && insights.summary.toLowerCase().includes(query)) {
        filtered.summary = insights.summary;
      }
      if (typeof insights.disease === 'string' && insights.disease.toLowerCase().includes(query)) {
        filtered.disease = insights.disease;
      }
      if (Array.isArray(insights.recommendations)) {
        filtered.recommendations = [
          ...filtered.recommendations,
          ...insights.recommendations.filter(rec => typeof rec === 'string' && rec.toLowerCase().includes(query)),
        ];
      }
      if (Array.isArray(insights.when_to_seek_help)) {
        filtered.when_to_seek_help = [
          ...filtered.when_to_seek_help,
          ...insights.when_to_seek_help.filter(cond => typeof cond === 'string' && cond.toLowerCase().includes(query)),
        ];
      }
      if (Array.isArray(insights.follow_up)) {
        filtered.follow_up = [
          ...filtered.follow_up,
          ...insights.follow_up.filter(action => typeof action === 'string' && action.toLowerCase().includes(query)),
        ];
      }

      // Remove duplicates
      filtered.recommendations = [...new Set(filtered.recommendations)];
      filtered.when_to_seek_help = [...new Set(filtered.when_to_seek_help)];
      filtered.follow_up = [...new Set(filtered.follow_up)];

      return filtered;
    };

    return (
      <UploadContainer>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
          📄 Medical Document Analysis
        </h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Upload your medical reports for a clear, AI-powered summary
        </p>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SearchBar
          type="text"
          placeholder="Search in analysis results..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search analysis results"
        />

        <DropzoneArea {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          {selectedFile ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <h3 style={{ fontSize: '20px', fontWeight: '500' }}>
                Selected File: {selectedFile.name}
              </h3>
              <p style={{ color: '#666' }}>
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <h3 style={{ fontSize: '20px', fontWeight: '500' }}>
                Drop your medical document here
              </h3>
              <p style={{ color: '#666' }}>
                or click to browse (JPG, PNG, PDF, max 10MB)
              </p>
            </div>
          )}
        </DropzoneArea>

        <div style={{ marginTop: '1.5rem' }}>
          < AnalyzeButton onClick={handleAnalyze} disabled={!selectedFile || analyzing}>
            {analyzing ? '🔄 Analyzing...' : '🔍 Analyze Document'}
          </AnalyzeButton>
        </div>

        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', marginTop: '1.5rem' }}
          >
            <div className="spinner"></div>
            <p style={{ color: '#666' }}>
              Analyzing your document with AI... Please wait.
            </p>
          </motion.div>
        )}

        {results && results.gemini_insights && (
  <ResultsContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {Object.keys(filterResults()).map((key) => {
      const displayKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace('When To Seek Help', 'When to Seek Help')
        .replace('Follow Up', 'Follow-Up');
      const content = filterResults()[key];

      if (!content || (Array.isArray(content) && content.length === 0)) return null;

      return (
        <Section key={key}>
          <SectionTitle
            onClick={() => toggleSection(key)}
            aria-expanded={openSections[key]}
            aria-controls={`section-${key}`}
          >
            {displayKey}
            <span>{openSections[key] ? '▲' : '▼'}</span>
          </SectionTitle>
          <AnimatePresence>
            {openSections[key] && (
              <SectionContent
                id={`section-${key}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {Array.isArray(content) ? (
                  content.map((item, idx) => (
                    <p key={idx} style={{ margin: '0.5rem 0' }}>
                      {idx + 1}. {item}
                    </p>
                  ))
                ) : (
                  <p>{content}</p>
                )}
              </SectionContent>
            )}
          </AnimatePresence>
        </Section>
      );
    })}
    {results.image_url && (
      <Section>
        <SectionTitle>🖼️ Generated Medical Illustration</SectionTitle>
        <GeneratedImage
          src={`http://localhost:8000${results.image_url}`}
          alt="Medical illustration"
          onError={() => toast.error('Failed to load generated image')}
        />
      </Section>
    )}
    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
      <AnalyzeButton onClick={saveToHistory}>
        💾 Save to History
      </AnalyzeButton>
      <VoiceButton onClick={handleVoice} disabled={audioLoading || playingAudio}>
        {audioLoading ? '🔊 Generating Voice...' : playingAudio ? '🔊 Playing...' : '🔊 Generate Voice'}
      </VoiceButton>
    </div>
  </ResultsContainer>
)}

        <audio ref={audioRef} style={{ display: 'none' }} />
      </UploadContainer>
    );
  };

  export default DocumentUpload;