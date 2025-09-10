# Sample Images for FarmMate AI Testing

This directory contains sample images for testing the AI inference capabilities of FarmMate.

## Image Categories

### Healthy Crops
- `healthy_tomato_1.jpg` - Healthy tomato plant
- `healthy_tomato_2.jpg` - Healthy tomato fruits
- `healthy_potato_1.jpg` - Healthy potato plant
- `healthy_corn_1.jpg` - Healthy corn plant

### Diseased Crops
- `diseased_tomato_leaf_spot.jpg` - Tomato with leaf spot disease
- `diseased_tomato_blight.jpg` - Tomato with blight
- `diseased_potato_scab.jpg` - Potato with scab
- `diseased_corn_rust.jpg` - Corn with rust

### Quality Examples
- `high_quality_tomato.jpg` - Premium quality tomatoes
- `medium_quality_tomato.jpg` - Standard quality tomatoes
- `low_quality_tomato.jpg` - Poor quality tomatoes

## Usage

These images can be used to test:
1. Disease detection accuracy
2. Quality scoring algorithms
3. AI model performance
4. User interface functionality

## Image Specifications

- Format: JPEG
- Resolution: 224x224 pixels (for model input)
- Color space: RGB
- File size: < 1MB each

## Testing

To test with these images:

```bash
# Test disease detection
curl -X POST http://localhost:5000/api/ai/detect-disease \
  -F "image=@healthy_tomato_1.jpg" \
  -F "cropType=tomato"

# Test quality scoring
curl -X POST http://localhost:5000/api/ai/score-quality \
  -F "image=@high_quality_tomato.jpg" \
  -F "cropType=tomato"
```

## Note

These are placeholder images. In a real deployment, you would use actual crop images from participating farms.
