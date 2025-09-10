#!/usr/bin/env python3
"""
FarmMate AI Service Flask App
Provides REST API for AI inference and federated learning
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import base64
import io
from inference import FarmMateAI
from federated_stub import FarmMateFederatedLearning
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize AI services
ai_service = FarmMateAI()
fl_service = FarmMateFederatedLearning()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'farmmate-ai',
        'version': '1.0.0'
    })

@app.route('/api/ai/detect-disease', methods=['POST'])
def detect_disease():
    """Disease detection endpoint"""
    try:
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        crop_type = request.form.get('cropType', 'tomato')
        
        # Read image data
        image_data = image_file.read()
        
        # Detect disease
        result = ai_service.disease_detector.detect_disease(image_data)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Disease detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/score-quality', methods=['POST'])
def score_quality():
    """Quality scoring endpoint"""
    try:
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        crop_type = request.form.get('cropType', 'tomato')
        
        # Read image data
        image_data = image_file.read()
        
        # Score quality
        result = ai_service.quality_scorer.score_quality(image_data, crop_type)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Quality scoring error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/analyze-batch', methods=['POST'])
def analyze_batch():
    """Batch analysis endpoint"""
    try:
        # Get images from request
        if 'images' not in request.files:
            return jsonify({'error': 'No image files provided'}), 400
        
        image_files = request.files.getlist('images')
        crop_type = request.form.get('cropType', 'tomato')
        variety = request.form.get('variety', '')
        farm_data = request.form.get('farmData', '{}')
        
        # Parse farm data
        try:
            farm_data = json.loads(farm_data)
        except:
            farm_data = {}
        
        # Analyze each image
        results = {
            'images': [],
            'overall_quality': 0,
            'diseases': [],
            'recommendations': []
        }
        
        total_quality = 0
        diseases = set()
        recommendations = set()
        
        for image_file in image_files:
            image_data = image_file.read()
            
            # Analyze image
            analysis = ai_service.analyze_image(image_data, crop_type)
            
            image_result = {
                'filename': image_file.filename,
                'disease': analysis['disease'],
                'quality': analysis['quality']
            }
            
            results['images'].append(image_result)
            total_quality += analysis['quality']['overall_score']
            
            if analysis['disease']['disease'] != 'Healthy':
                diseases.add(analysis['disease']['disease'])
            
            for rec in analysis['disease']['recommendations']:
                recommendations.add(rec)
        
        # Calculate overall results
        results['overall_quality'] = total_quality / len(image_files) if image_files else 0
        results['diseases'] = list(diseases)
        results['recommendations'] = list(recommendations)
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        logger.error(f"Batch analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/forecast-yield', methods=['POST'])
def forecast_yield():
    """Yield forecasting endpoint"""
    try:
        data = request.get_json()
        farm_data = data.get('farmData', {})
        historical_data = data.get('historicalData', [])
        
        # Generate yield forecast
        result = ai_service.yield_forecaster.forecast_yield(farm_data, historical_data)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Yield forecast error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/forecast-price', methods=['POST'])
def forecast_price():
    """Price forecasting endpoint"""
    try:
        data = request.get_json()
        crop_type = data.get('cropType', 'tomato')
        market_data = data.get('marketData', {})
        
        # Generate price forecast
        result = ai_service.price_forecaster.forecast_price(crop_type, market_data)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Price forecast error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/forecast-production', methods=['POST'])
def forecast_production():
    """Comprehensive production forecasting endpoint"""
    try:
        data = request.get_json()
        farm_data = data.get('farmData', {})
        historical_data = data.get('historicalData', [])
        
        # Generate production forecast
        result = ai_service.forecast_production(farm_data, historical_data)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Production forecast error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/federated-update', methods=['POST'])
def federated_update():
    """Federated learning update endpoint"""
    try:
        data = request.get_json()
        farm_id = data.get('farmId')
        model_parameters = data.get('modelParameters', {})
        sample_count = data.get('sampleCount', 0)
        validation_score = data.get('validationScore')
        
        if not farm_id:
            return jsonify({'error': 'Farm ID required'}), 400
        
        # Submit federated learning update
        result = fl_service.submit_farm_update(
            farm_id=farm_id,
            model_parameters=model_parameters,
            sample_count=sample_count,
            validation_score=validation_score
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Federated learning error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/global-model', methods=['GET'])
def get_global_model():
    """Get global model endpoint"""
    try:
        result = fl_service.get_global_model()
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Get global model error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/federated-status', methods=['GET'])
def get_federated_status():
    """Get federated learning status endpoint"""
    try:
        result = fl_service.get_federated_learning_status()
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Get federated status error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/simulate-training', methods=['POST'])
def simulate_training():
    """Simulate farm training endpoint (for testing)"""
    try:
        data = request.get_json()
        farm_id = data.get('farmId', 'test_farm')
        data_size = data.get('dataSize', 100)
        
        # Simulate training
        result = fl_service.simulate_farm_training(farm_id, data_size)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Simulate training error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/status', methods=['GET'])
def get_ai_status():
    """Get AI service status endpoint"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'services': {
                    'diseaseDetection': 'available',
                    'qualityScoring': 'available',
                    'yieldForecasting': 'available',
                    'priceForecasting': 'available',
                    'federatedLearning': 'available'
                },
                'models': {
                    'leafDisease': 'mobilenet-v1',
                    'yieldForecast': 'lstm-v1',
                    'priceForecast': 'linear-regression-v1'
                },
                'version': '1.0.0',
                'lastUpdated': '2024-01-01T00:00:00Z'
            }
        })
        
    except Exception as e:
        logger.error(f"Get AI status error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
