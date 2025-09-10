import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload, Camera, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const AIAnalysisContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: white;
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const UploadSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.isDragOver ? '#667eea' : '#d1d5db'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragOver ? 'rgba(102, 126, 234, 0.05)' : 'transparent'};

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #6b7280;
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  color: #374151;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const UploadSubtext = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #dc2626;
  }
`;

const AnalysisSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AnalysisTitle = styled.h3`
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const AnalysisCard = styled.div`
  padding: 1.5rem;
  background: rgba(107, 114, 128, 0.05);
  border-radius: 12px;
  border-left: 4px solid ${props => {
    if (props.type === 'disease') return '#ef4444';
    if (props.type === 'quality') return '#10b981';
    if (props.type === 'confidence') return '#3b82f6';
    return '#6b7280';
  }};
`;

const AnalysisLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const AnalysisValue = styled.div`
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const AnalysisDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #6b7280;
  font-size: 1.1rem;
`;

const AIAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setAnalysisResult(null);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    
    try {
      // Auto-detect crop type from filename
      const fileName = selectedFile.name.toLowerCase();
      let detectedCrop = '';
      if (fileName.includes('tomato')) detectedCrop = 'tomato';
      else if (fileName.includes('carrot')) detectedCrop = 'carrot';
      else if (fileName.includes('lettuce')) detectedCrop = 'lettuce';
      else if (fileName.includes('potato')) detectedCrop = 'potato';
      else if (fileName.includes('pepper')) detectedCrop = 'pepper';
      
      const response = await fetch('http://localhost:3001/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cropType: detectedCrop,
          fileName: selectedFile.name
        })
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        
        // Transform the response to match the expected format
        const analysisResult = {
          cropType: data.detectedCrop || 'Unknown',
          disease: {
            detected: data.disease,
            confidence: Math.round(data.confidence * 100),
            description: data.description,
            severity: data.severity
          },
          quality: {
            score: data.qualityScore,
            grade: data.qualityScore >= 90 ? 'Excellent' : 
                   data.qualityScore >= 80 ? 'Good' : 
                   data.qualityScore >= 70 ? 'Fair' : 'Poor',
            description: data.qualityScore >= 80 ? 
              'Good quality produce with minor imperfections.' : 
              'Quality issues detected. Review recommendations.'
          },
          recommendations: data.recommendations || [],
          treatment: data.treatment,
          analysis: data.analysis
        };
        
        setAnalysisResult(analysisResult);
        toast.success('Analysis completed successfully!');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AIAnalysisContainer>
      <Header>
        <Title>AI-Powered Analysis</Title>
        <Subtitle>
          Upload images of your crops for disease detection and quality scoring using advanced machine learning models.
        </Subtitle>
      </Header>

      <UploadSection>
        <UploadArea
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <UploadIcon>
            <Upload size={48} />
          </UploadIcon>
          <UploadText>Upload Crop Images</UploadText>
          <UploadSubtext>
            Drag and drop your images here, or click to browse
          </UploadSubtext>
          <Button>
            <Camera size={20} />
            Choose Files
          </Button>
          <FileInput
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
          />
        </UploadArea>

        {selectedFile && (
          <ImagePreview>
            <PreviewImage
              src={URL.createObjectURL(selectedFile)}
              alt="Selected crop"
            />
            <div>
              <RemoveButton onClick={removeImage}>
                <X size={16} />
                Remove Image
              </RemoveButton>
            </div>
          </ImagePreview>
        )}
      </UploadSection>

      {selectedFile && !analysisResult && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Button onClick={analyzeImage} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </Button>
        </div>
      )}

      {isAnalyzing && (
        <AnalysisSection>
          <LoadingSpinner>
            <Loader size={24} className="animate-spin" />
            Analyzing your crop image...
          </LoadingSpinner>
        </AnalysisSection>
      )}

      {analysisResult && (
        <AnalysisSection>
          <AnalysisTitle>Analysis Results</AnalysisTitle>
          
          {/* Crop Type Display */}
          {analysisResult.cropType && analysisResult.cropType !== 'Unknown' && (
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(102, 126, 234, 0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <strong style={{ color: '#1f2937' }}>Detected Crop:</strong> 
              <span style={{ 
                color: '#667eea', 
                marginLeft: '0.5rem',
                textTransform: 'capitalize',
                fontWeight: '600'
              }}>
                {analysisResult.cropType}
              </span>
            </div>
          )}

          <AnalysisGrid>
            <AnalysisCard type="disease">
              <AnalysisLabel>Disease Detection</AnalysisLabel>
              <AnalysisValue>{analysisResult.disease.detected}</AnalysisValue>
              <AnalysisDescription>
                {analysisResult.disease.description}
              </AnalysisDescription>
              {analysisResult.disease.severity && analysisResult.disease.severity !== 'none' && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.875rem',
                  color: analysisResult.disease.severity === 'high' ? '#ef4444' : 
                         analysisResult.disease.severity === 'moderate' ? '#f59e0b' : '#6b7280'
                }}>
                  <strong>Severity:</strong> {analysisResult.disease.severity}
                </div>
              )}
            </AnalysisCard>

            <AnalysisCard type="quality">
              <AnalysisLabel>Quality Score</AnalysisLabel>
              <AnalysisValue>{analysisResult.quality.score}/100</AnalysisValue>
              <AnalysisDescription>
                {analysisResult.quality.description}
              </AnalysisDescription>
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <strong>Grade:</strong> {analysisResult.quality.grade}
              </div>
            </AnalysisCard>

            <AnalysisCard type="confidence">
              <AnalysisLabel>Confidence</AnalysisLabel>
              <AnalysisValue>{analysisResult.disease.confidence}%</AnalysisValue>
              <AnalysisDescription>
                AI model confidence level
              </AnalysisDescription>
            </AnalysisCard>
          </AnalysisGrid>

          {/* Treatment Information */}
          {analysisResult.treatment && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Treatment</h4>
              <p style={{ color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
                {analysisResult.treatment}
              </p>
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>Recommendations</h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Analysis Details */}
          {analysisResult.analysis && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'rgba(107, 114, 128, 0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(107, 114, 128, 0.2)'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>Analysis Details</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem',
                fontSize: '0.875rem'
              }}>
                <div>
                  <strong style={{ color: '#1f2937' }}>Healthy:</strong> 
                  <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                    {Math.round(analysisResult.analysis.healthy * 100)}%
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#1f2937' }}>Diseased:</strong> 
                  <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                    {Math.round(analysisResult.analysis.diseased * 100)}%
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#1f2937' }}>Pest Damage:</strong> 
                  <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                    {Math.round(analysisResult.analysis.pest_damage * 100)}%
                  </span>
                </div>
                {analysisResult.analysis.nutrient_deficiency && (
                  <div>
                    <strong style={{ color: '#1f2937' }}>Nutrient Deficiency:</strong> 
                    <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                      {Math.round(analysisResult.analysis.nutrient_deficiency * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnalysisSection>
      )}
    </AIAnalysisContainer>
  );
};

export default AIAnalysis;
