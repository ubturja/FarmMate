import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Upload, Package, Calendar, DollarSign, MapPin, User, Star } from 'lucide-react';
import { marketplaceAPI } from '../services/api';
import { toast } from 'react-toastify';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const FileUpload = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    background: #f8fafc;
  }

  input[type="file"] {
    display: none;
  }
`;

const FileUploadText = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const PriceInput = styled.div`
  position: relative;
`;

const PriceSymbol = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 600;
`;

const PriceInputField = styled(Input)`
  padding-left: 2.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => {
    if (props.primary) {
      return `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `;
    }
    return `
      background: #f3f4f6;
      color: #374151;
      &:hover {
        background: #e5e7eb;
      }
    `;
  }}
`;

const CreateBatch = ({ isOpen, onClose, onBatchCreated }) => {
  const [formData, setFormData] = useState({
    cropType: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    priceWei: '',
    harvestDate: '',
    qualityScore: '',
    farmName: '',
    farmerName: '',
    images: [],
    metadata: {
      soilType: '',
      growingMethod: '',
      certification: '',
      notes: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const convertToWei = (ethAmount) => {
    return (parseFloat(ethAmount) * 1e18).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cropType || !formData.quantity || !formData.priceWei || !formData.harvestDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const batchData = {
        ...formData,
        priceWei: convertToWei(formData.priceWei),
        quantity: parseFloat(formData.quantity),
        qualityScore: formData.qualityScore ? parseInt(formData.qualityScore) : 0
      };

      const response = await marketplaceAPI.createBatch(batchData);
      
      toast.success('Batch created successfully!');
      onBatchCreated(response.data.data);
      onClose();
      
      // Reset form
      setFormData({
        cropType: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        priceWei: '',
        harvestDate: '',
        qualityScore: '',
        farmName: '',
        farmerName: '',
        images: [],
        metadata: {
          soilType: '',
          growingMethod: '',
          certification: '',
          notes: ''
        }
      });
    } catch (error) {
      console.error('Failed to create batch:', error);
      toast.error(error.response?.data?.error || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create New Batch</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label>
                <Package size={16} />
                Crop Type *
              </Label>
              <Select
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select crop type</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Lettuce">Lettuce</option>
                <option value="Potatoes">Potatoes</option>
                <option value="Wheat">Wheat</option>
                <option value="Corn">Corn</option>
                <option value="Rice">Rice</option>
                <option value="Carrots">Carrots</option>
                <option value="Onions">Onions</option>
                <option value="Peppers">Peppers</option>
                <option value="Cucumbers">Cucumbers</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Variety</Label>
              <Input
                name="variety"
                value={formData.variety}
                onChange={handleInputChange}
                placeholder="e.g., Cherry, Romaine, etc."
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Quantity *</Label>
              <Input
                name="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Unit</Label>
              <Select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
                <option value="tons">tons</option>
                <option value="pieces">pieces</option>
                <option value="boxes">boxes</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>
                <DollarSign size={16} />
                Price (ETH) *
              </Label>
              <PriceInput>
                <PriceSymbol>Ξ</PriceSymbol>
                <PriceInputField
                  name="priceWei"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.priceWei}
                  onChange={handleInputChange}
                  placeholder="0.000"
                  required
                />
              </PriceInput>
            </FormGroup>

            <FormGroup>
              <Label>
                <Calendar size={16} />
                Harvest Date *
              </Label>
              <Input
                name="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>
                <Star size={16} />
                Quality Score
              </Label>
              <Input
                name="qualityScore"
                type="number"
                min="0"
                max="100"
                value={formData.qualityScore}
                onChange={handleInputChange}
                placeholder="0-100"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <MapPin size={16} />
                Farm Name
              </Label>
              <Input
                name="farmName"
                value={formData.farmName}
                onChange={handleInputChange}
                placeholder="Your farm name"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>
              <User size={16} />
              Farmer Name
            </Label>
            <Input
              name="farmerName"
              value={formData.farmerName}
              onChange={handleInputChange}
              placeholder="Your name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Additional Information</Label>
            <FormRow>
              <Input
                name="soilType"
                value={formData.metadata.soilType}
                onChange={handleMetadataChange}
                placeholder="Soil type (e.g., Clay, Sandy)"
              />
              <Input
                name="growingMethod"
                value={formData.metadata.growingMethod}
                onChange={handleMetadataChange}
                placeholder="Growing method (e.g., Organic, Conventional)"
              />
            </FormRow>
            <Input
              name="certification"
              value={formData.metadata.certification}
              onChange={handleMetadataChange}
              placeholder="Certifications (e.g., USDA Organic, Fair Trade)"
            />
            <TextArea
              name="notes"
              value={formData.metadata.notes}
              onChange={handleMetadataChange}
              placeholder="Additional notes about the batch..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Images (Optional)</Label>
            <FileUpload>
              <Upload size={24} color="#6b7280" />
              <FileUploadText>
                Click to upload images or drag and drop
              </FileUploadText>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
              />
            </FileUpload>
            {formData.images.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {formData.images.length} file(s) selected
              </div>
            )}
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" primary disabled={loading}>
              {loading ? 'Creating...' : 'Create Batch'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateBatch;
