#!/usr/bin/env python3
"""
FarmMate AI Inference Module
Provides disease detection, quality scoring, and yield forecasting
"""

import os
import json
import base64
import numpy as np
import cv2
from PIL import Image
import io
import requests
from typing import Dict, List, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DiseaseDetector:
    """Mock disease detection using computer vision techniques"""
    
    def __init__(self):
        self.disease_classes = [
            'Healthy', 'Leaf Spot', 'Powdery Mildew', 'Rust', 'Blight', 
            'Anthracnose', 'Bacterial Spot', 'Virus'
        ]
        
    def preprocess_image(self, image_data: bytes) -> np.ndarray:
        """Preprocess image for model input"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to model input size (224x224 for MobileNet)
            image = image.resize((224, 224))
            
            # Convert to numpy array and normalize
            image_array = np.array(image, dtype=np.float32) / 255.0
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            return image_array
        except Exception as e:
            logger.error(f"Image preprocessing error: {e}")
            raise
    
    def detect_disease(self, image_data: bytes) -> Dict:
        """Detect disease in crop image"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_data)
            
            # Mock disease detection using computer vision
            # In real implementation, this would use a trained TFLite model
            disease_result = self._mock_disease_detection(processed_image)
            
            return {
                'disease': disease_result['disease'],
                'confidence': disease_result['confidence'],
                'recommendations': disease_result['recommendations'],
                'severity': disease_result['severity']
            }
        except Exception as e:
            logger.error(f"Disease detection error: {e}")
            return {
                'disease': 'Unknown',
                'confidence': 0.0,
                'recommendations': ['Unable to analyze image'],
                'severity': 'Unknown'
            }
    
    def _mock_disease_detection(self, image: np.ndarray) -> Dict:
        """Mock disease detection using image analysis"""
        # Analyze image characteristics
        mean_color = np.mean(image)
        std_color = np.std(image)
        
        # Simulate disease detection based on image properties
        if mean_color < 0.3:
            disease = 'Blight'
            confidence = 0.85
            severity = 'High'
        elif std_color > 0.4:
            disease = 'Leaf Spot'
            confidence = 0.78
            severity = 'Medium'
        elif mean_color > 0.7:
            disease = 'Powdery Mildew'
            confidence = 0.72
            severity = 'Medium'
        else:
            disease = 'Healthy'
            confidence = 0.90
            severity = 'None'
        
        recommendations = self._get_recommendations(disease, severity)
        
        return {
            'disease': disease,
            'confidence': confidence,
            'recommendations': recommendations,
            'severity': severity
        }
    
    def _get_recommendations(self, disease: str, severity: str) -> List[str]:
        """Get treatment recommendations based on disease and severity"""
        recommendations = {
            'Healthy': ['Continue current practices', 'Monitor regularly'],
            'Leaf Spot': [
                'Remove affected leaves',
                'Improve air circulation',
                'Apply fungicide if severe'
            ],
            'Powdery Mildew': [
                'Increase air circulation',
                'Reduce humidity',
                'Apply sulfur-based fungicide'
            ],
            'Rust': [
                'Remove infected plant parts',
                'Apply copper fungicide',
                'Improve drainage'
            ],
            'Blight': [
                'Remove and destroy infected plants',
                'Apply fungicide preventively',
                'Improve soil drainage'
            ],
            'Anthracnose': [
                'Prune affected areas',
                'Apply fungicide',
                'Improve air circulation'
            ],
            'Bacterial Spot': [
                'Remove infected parts',
                'Apply copper-based bactericide',
                'Avoid overhead watering'
            ],
            'Virus': [
                'Remove infected plants',
                'Control insect vectors',
                'Use virus-free seeds'
            ]
        }
        
        base_recs = recommendations.get(disease, ['Consult agricultural expert'])
        
        if severity == 'High':
            base_recs.insert(0, 'Immediate action required')
        elif severity == 'Medium':
            base_recs.insert(0, 'Monitor closely')
        
        return base_recs

class QualityScorer:
    """Crop quality scoring based on visual analysis"""
    
    def __init__(self):
        self.quality_factors = {
            'color': 0.3,
            'size': 0.25,
            'shape': 0.2,
            'defects': 0.15,
            'freshness': 0.1
        }
    
    def score_quality(self, image_data: bytes, crop_type: str) -> Dict:
        """Score crop quality based on image analysis"""
        try:
            # Preprocess image
            image = self._preprocess_for_quality(image_data)
            
            # Analyze different quality factors
            color_score = self._analyze_color(image)
            size_score = self._analyze_size(image)
            shape_score = self._analyze_shape(image)
            defects_score = self._analyze_defects(image)
            freshness_score = self._analyze_freshness(image)
            
            # Calculate weighted overall score
            overall_score = (
                color_score * self.quality_factors['color'] +
                size_score * self.quality_factors['size'] +
                shape_score * self.quality_factors['shape'] +
                defects_score * self.quality_factors['defects'] +
                freshness_score * self.quality_factors['freshness']
            ) * 100
            
            return {
                'overall_score': round(overall_score, 1),
                'breakdown': {
                    'color': round(color_score * 100, 1),
                    'size': round(size_score * 100, 1),
                    'shape': round(shape_score * 100, 1),
                    'defects': round(defects_score * 100, 1),
                    'freshness': round(freshness_score * 100, 1)
                },
                'grade': self._get_quality_grade(overall_score),
                'recommendations': self._get_quality_recommendations(overall_score)
            }
        except Exception as e:
            logger.error(f"Quality scoring error: {e}")
            return {
                'overall_score': 0,
                'breakdown': {},
                'grade': 'F',
                'recommendations': ['Unable to analyze quality']
            }
    
    def _preprocess_for_quality(self, image_data: bytes) -> np.ndarray:
        """Preprocess image for quality analysis"""
        image = Image.open(io.BytesIO(image_data))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        return np.array(image)
    
    def _analyze_color(self, image: np.ndarray) -> float:
        """Analyze color quality (0-1)"""
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Calculate color saturation and brightness
        saturation = np.mean(hsv[:, :, 1]) / 255.0
        brightness = np.mean(hsv[:, :, 2]) / 255.0
        
        # Good color should have moderate saturation and brightness
        color_score = min(saturation * 0.7 + brightness * 0.3, 1.0)
        return color_score
    
    def _analyze_size(self, image: np.ndarray) -> float:
        """Analyze size consistency (0-1)"""
        # Convert to grayscale for size analysis
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Find contours to estimate object size
        contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) == 0:
            return 0.5  # Default if no contours found
        
        # Calculate size consistency
        areas = [cv2.contourArea(contour) for contour in contours]
        if len(areas) == 0:
            return 0.5
        
        mean_area = np.mean(areas)
        std_area = np.std(areas)
        
        # Consistency score based on coefficient of variation
        cv = std_area / mean_area if mean_area > 0 else 1.0
        size_score = max(0, 1 - cv)
        
        return min(size_score, 1.0)
    
    def _analyze_shape(self, image: np.ndarray) -> float:
        """Analyze shape regularity (0-1)"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) == 0:
            return 0.5
        
        # Analyze shape regularity using contour properties
        shape_scores = []
        for contour in contours:
            if cv2.contourArea(contour) < 100:  # Skip small contours
                continue
            
            # Calculate aspect ratio
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = w / h if h > 0 else 1.0
            
            # Calculate circularity
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
            
            # Good shape should have reasonable aspect ratio and circularity
            shape_score = min(aspect_ratio, 1.0) * circularity
            shape_scores.append(shape_score)
        
        return np.mean(shape_scores) if shape_scores else 0.5
    
    def _analyze_defects(self, image: np.ndarray) -> float:
        """Analyze defects and damage (0-1, higher is better)"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Detect edges to find potential defects
        edges = cv2.Canny(gray, 50, 150)
        
        # Count edge pixels (potential defects)
        edge_pixels = np.sum(edges > 0)
        total_pixels = edges.size
        
        # Defect score (inverse of edge density)
        defect_ratio = edge_pixels / total_pixels
        defect_score = max(0, 1 - defect_ratio * 2)  # Scale factor for better scoring
        
        return min(defect_score, 1.0)
    
    def _analyze_freshness(self, image: np.ndarray) -> float:
        """Analyze freshness indicators (0-1)"""
        # Convert to HSV for freshness analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Fresh produce typically has vibrant colors
        saturation = np.mean(hsv[:, :, 1]) / 255.0
        brightness = np.mean(hsv[:, :, 2]) / 255.0
        
        # Freshness score based on color vibrancy
        freshness_score = (saturation * 0.6 + brightness * 0.4)
        
        return min(freshness_score, 1.0)
    
    def _get_quality_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 60:
            return 'C'
        elif score >= 50:
            return 'D'
        else:
            return 'F'
    
    def _get_quality_recommendations(self, score: float) -> List[str]:
        """Get recommendations based on quality score"""
        if score >= 80:
            return ['Excellent quality', 'Ready for premium market']
        elif score >= 60:
            return ['Good quality', 'Suitable for standard market']
        elif score >= 40:
            return ['Fair quality', 'Consider processing or local market']
        else:
            return ['Poor quality', 'Not suitable for fresh market', 'Consider composting']

class YieldForecaster:
    """Yield forecasting based on farm data and historical patterns"""
    
    def __init__(self):
        self.crop_yields = {
            'tomato': {'base': 25, 'range': 15},  # tons per hectare
            'potato': {'base': 40, 'range': 20},
            'wheat': {'base': 3, 'range': 1.5},
            'corn': {'base': 10, 'range': 5},
            'rice': {'base': 6, 'range': 3}
        }
    
    def forecast_yield(self, farm_data: Dict, historical_data: Optional[List] = None) -> Dict:
        """Forecast crop yield based on farm conditions"""
        try:
            crop_type = farm_data.get('cropType', 'tomato').lower()
            base_yield = self.crop_yields.get(crop_type, {'base': 10, 'range': 5})
            
            # Calculate yield factors
            weather_factor = self._calculate_weather_factor(farm_data)
            soil_factor = self._calculate_soil_factor(farm_data)
            management_factor = self._calculate_management_factor(farm_data)
            historical_factor = self._calculate_historical_factor(historical_data)
            
            # Calculate predicted yield
            predicted_yield = (
                base_yield['base'] * 
                weather_factor * 
                soil_factor * 
                management_factor * 
                historical_factor
            )
            
            # Add some randomness for realism
            variation = np.random.normal(1.0, 0.1)
            predicted_yield *= variation
            
            # Calculate confidence based on data quality
            confidence = self._calculate_confidence(farm_data, historical_data)
            
            return {
                'predicted_yield': round(predicted_yield, 2),
                'confidence': round(confidence, 2),
                'factors': {
                    'weather': round(weather_factor, 2),
                    'soil': round(soil_factor, 2),
                    'management': round(management_factor, 2),
                    'historical': round(historical_factor, 2)
                },
                'recommendations': self._get_yield_recommendations(farm_data, predicted_yield)
            }
        except Exception as e:
            logger.error(f"Yield forecasting error: {e}")
            return {
                'predicted_yield': 0,
                'confidence': 0,
                'factors': {},
                'recommendations': ['Unable to generate forecast']
            }
    
    def _calculate_weather_factor(self, farm_data: Dict) -> float:
        """Calculate weather impact factor"""
        # Mock weather data - in real implementation, use weather API
        temperature = farm_data.get('temperature', 25)  # Celsius
        rainfall = farm_data.get('rainfall', 100)  # mm/month
        humidity = farm_data.get('humidity', 60)  # %
        
        # Optimal ranges for most crops
        temp_factor = 1.0 - abs(temperature - 25) / 50  # Optimal at 25°C
        rain_factor = 1.0 - abs(rainfall - 100) / 200  # Optimal at 100mm
        humidity_factor = 1.0 - abs(humidity - 60) / 80  # Optimal at 60%
        
        return max(0.1, (temp_factor + rain_factor + humidity_factor) / 3)
    
    def _calculate_soil_factor(self, farm_data: Dict) -> float:
        """Calculate soil quality factor"""
        ph = farm_data.get('soilPh', 6.5)
        organic_matter = farm_data.get('organicMatter', 3)  # %
        nutrients = farm_data.get('nutrients', 'medium')  # low, medium, high
        
        # pH factor (optimal range 6-7)
        ph_factor = 1.0 - abs(ph - 6.5) / 3
        
        # Organic matter factor
        om_factor = min(1.0, organic_matter / 5)
        
        # Nutrient factor
        nutrient_factors = {'low': 0.6, 'medium': 0.8, 'high': 1.0}
        nutrient_factor = nutrient_factors.get(nutrients, 0.8)
        
        return max(0.1, (ph_factor + om_factor + nutrient_factor) / 3)
    
    def _calculate_management_factor(self, farm_data: Dict) -> float:
        """Calculate management practices factor"""
        irrigation = farm_data.get('irrigation', 'adequate')  # poor, adequate, excellent
        pest_control = farm_data.get('pestControl', 'good')  # poor, good, excellent
        fertilization = farm_data.get('fertilization', 'regular')  # irregular, regular, optimal
        
        irrigation_factors = {'poor': 0.5, 'adequate': 0.8, 'excellent': 1.0}
        pest_factors = {'poor': 0.6, 'good': 0.8, 'excellent': 1.0}
        fert_factors = {'irregular': 0.6, 'regular': 0.8, 'optimal': 1.0}
        
        return (
            irrigation_factors.get(irrigation, 0.8) +
            pest_factors.get(pest_control, 0.8) +
            fert_factors.get(fertilization, 0.8)
        ) / 3
    
    def _calculate_historical_factor(self, historical_data: Optional[List]) -> float:
        """Calculate historical performance factor"""
        if not historical_data or len(historical_data) < 2:
            return 1.0  # No historical data, use neutral factor
        
        # Calculate trend from historical yields
        yields = [record.get('yield', 0) for record in historical_data[-5:]]  # Last 5 records
        if len(yields) < 2:
            return 1.0
        
        # Simple trend calculation
        trend = np.polyfit(range(len(yields)), yields, 1)[0]
        trend_factor = 1.0 + (trend / np.mean(yields)) if np.mean(yields) > 0 else 1.0
        
        return max(0.5, min(1.5, trend_factor))
    
    def _calculate_confidence(self, farm_data: Dict, historical_data: Optional[List]) -> float:
        """Calculate forecast confidence"""
        confidence = 0.5  # Base confidence
        
        # More data = higher confidence
        if farm_data.get('temperature') is not None:
            confidence += 0.1
        if farm_data.get('rainfall') is not None:
            confidence += 0.1
        if farm_data.get('soilPh') is not None:
            confidence += 0.1
        if historical_data and len(historical_data) > 0:
            confidence += 0.2
        
        return min(0.95, confidence)
    
    def _get_yield_recommendations(self, farm_data: Dict, predicted_yield: float) -> List[str]:
        """Get yield optimization recommendations"""
        recommendations = []
        
        if farm_data.get('irrigation') == 'poor':
            recommendations.append('Improve irrigation system')
        if farm_data.get('soilPh', 7) < 6 or farm_data.get('soilPh', 7) > 7:
            recommendations.append('Adjust soil pH to optimal range (6-7)')
        if farm_data.get('organicMatter', 0) < 3:
            recommendations.append('Increase organic matter content')
        if predicted_yield < 10:
            recommendations.append('Consider crop rotation or soil improvement')
        
        if not recommendations:
            recommendations.append('Maintain current practices')
        
        return recommendations

class PriceForecaster:
    """Price forecasting based on market data and trends"""
    
    def __init__(self):
        self.base_prices = {
            'tomato': 2.50,  # USD per kg
            'potato': 1.20,
            'wheat': 0.80,
            'corn': 1.50,
            'rice': 1.80
        }
    
    def forecast_price(self, crop_type: str, market_data: Optional[Dict] = None) -> Dict:
        """Forecast crop price based on market conditions"""
        try:
            base_price = self.base_prices.get(crop_type.lower(), 1.00)
            
            # Calculate price factors
            season_factor = self._calculate_season_factor()
            demand_factor = self._calculate_demand_factor(market_data)
            supply_factor = self._calculate_supply_factor(market_data)
            quality_factor = self._calculate_quality_factor(market_data)
            
            # Calculate predicted price
            predicted_price = (
                base_price * 
                season_factor * 
                demand_factor * 
                supply_factor * 
                quality_factor
            )
            
            # Add some market volatility
            volatility = np.random.normal(1.0, 0.05)
            predicted_price *= volatility
            
            # Calculate confidence
            confidence = self._calculate_price_confidence(market_data)
            
            # Determine trend
            trend = self._determine_trend(season_factor, demand_factor, supply_factor)
            
            return {
                'predicted_price': round(predicted_price, 2),
                'confidence': round(confidence, 2),
                'factors': {
                    'season': round(season_factor, 2),
                    'demand': round(demand_factor, 2),
                    'supply': round(supply_factor, 2),
                    'quality': round(quality_factor, 2)
                },
                'trend': trend,
                'recommendations': self._get_price_recommendations(trend, predicted_price)
            }
        except Exception as e:
            logger.error(f"Price forecasting error: {e}")
            return {
                'predicted_price': 0,
                'confidence': 0,
                'factors': {},
                'trend': 'unknown',
                'recommendations': ['Unable to generate forecast']
            }
    
    def _calculate_season_factor(self) -> float:
        """Calculate seasonal price factor"""
        month = np.random.randint(1, 13)  # Mock month
        
        # Seasonal patterns (simplified)
        if month in [6, 7, 8]:  # Summer
            return 0.9  # Lower prices due to abundance
        elif month in [12, 1, 2]:  # Winter
            return 1.2  # Higher prices due to scarcity
        else:
            return 1.0  # Normal prices
    
    def _calculate_demand_factor(self, market_data: Optional[Dict]) -> float:
        """Calculate demand impact factor"""
        if not market_data:
            return 1.0
        
        # Mock demand indicators
        population_growth = market_data.get('populationGrowth', 0.01)
        income_growth = market_data.get('incomeGrowth', 0.02)
        health_trends = market_data.get('healthTrends', 'stable')
        
        demand_factor = 1.0 + population_growth + income_growth
        
        if health_trends == 'increasing':
            demand_factor += 0.1
        elif health_trends == 'decreasing':
            demand_factor -= 0.1
        
        return max(0.5, min(1.5, demand_factor))
    
    def _calculate_supply_factor(self, market_data: Optional[Dict]) -> float:
        """Calculate supply impact factor"""
        if not market_data:
            return 1.0
        
        # Mock supply indicators
        production_trend = market_data.get('productionTrend', 'stable')
        weather_impact = market_data.get('weatherImpact', 'normal')
        storage_levels = market_data.get('storageLevels', 'normal')
        
        supply_factor = 1.0
        
        if production_trend == 'increasing':
            supply_factor -= 0.1
        elif production_trend == 'decreasing':
            supply_factor += 0.1
        
        if weather_impact == 'drought':
            supply_factor += 0.2
        elif weather_impact == 'flood':
            supply_factor += 0.15
        
        if storage_levels == 'low':
            supply_factor += 0.1
        elif storage_levels == 'high':
            supply_factor -= 0.1
        
        return max(0.5, min(1.5, supply_factor))
    
    def _calculate_quality_factor(self, market_data: Optional[Dict]) -> float:
        """Calculate quality premium factor"""
        if not market_data:
            return 1.0
        
        quality_grade = market_data.get('qualityGrade', 'B')
        organic = market_data.get('organic', False)
        certified = market_data.get('certified', False)
        
        quality_factor = 1.0
        
        # Quality grade premium
        grade_factors = {'A+': 1.3, 'A': 1.2, 'B': 1.0, 'C': 0.9, 'D': 0.8, 'F': 0.7}
        quality_factor *= grade_factors.get(quality_grade, 1.0)
        
        # Organic premium
        if organic:
            quality_factor *= 1.2
        
        # Certification premium
        if certified:
            quality_factor *= 1.1
        
        return quality_factor
    
    def _calculate_price_confidence(self, market_data: Optional[Dict]) -> float:
        """Calculate price forecast confidence"""
        confidence = 0.6  # Base confidence
        
        if market_data:
            if market_data.get('productionTrend'):
                confidence += 0.1
            if market_data.get('weatherImpact'):
                confidence += 0.1
            if market_data.get('storageLevels'):
                confidence += 0.1
        
        return min(0.9, confidence)
    
    def _determine_trend(self, season_factor: float, demand_factor: float, supply_factor: float) -> str:
        """Determine price trend"""
        overall_factor = (season_factor + demand_factor + supply_factor) / 3
        
        if overall_factor > 1.1:
            return 'increasing'
        elif overall_factor < 0.9:
            return 'decreasing'
        else:
            return 'stable'
    
    def _get_price_recommendations(self, trend: str, price: float) -> List[str]:
        """Get pricing recommendations"""
        recommendations = []
        
        if trend == 'increasing':
            recommendations.append('Consider holding inventory for better prices')
            recommendations.append('Monitor market closely for optimal selling time')
        elif trend == 'decreasing':
            recommendations.append('Consider selling soon to avoid price drops')
            recommendations.append('Focus on quality to maintain premium pricing')
        else:
            recommendations.append('Market is stable, focus on production efficiency')
        
        return recommendations

class FarmMateAI:
    """Main AI service class that coordinates all AI functions"""
    
    def __init__(self):
        self.disease_detector = DiseaseDetector()
        self.quality_scorer = QualityScorer()
        self.yield_forecaster = YieldForecaster()
        self.price_forecaster = PriceForecaster()
    
    def analyze_image(self, image_data: bytes, crop_type: str) -> Dict:
        """Comprehensive image analysis"""
        try:
            # Run both disease detection and quality scoring
            disease_result = self.disease_detector.detect_disease(image_data)
            quality_result = self.quality_scorer.score_quality(image_data, crop_type)
            
            return {
                'disease': disease_result,
                'quality': quality_result,
                'timestamp': np.datetime64('now').astype(str),
                'crop_type': crop_type
            }
        except Exception as e:
            logger.error(f"Image analysis error: {e}")
            return {
                'disease': {'disease': 'Unknown', 'confidence': 0},
                'quality': {'overall_score': 0, 'grade': 'F'},
                'error': str(e)
            }
    
    def forecast_production(self, farm_data: Dict, historical_data: Optional[List] = None) -> Dict:
        """Comprehensive production forecasting"""
        try:
            yield_forecast = self.yield_forecaster.forecast_yield(farm_data, historical_data)
            price_forecast = self.price_forecaster.forecast_price(
                farm_data.get('cropType', 'tomato'), 
                farm_data.get('marketData')
            )
            
            # Calculate potential revenue
            potential_revenue = yield_forecast['predicted_yield'] * price_forecast['predicted_price']
            
            return {
                'yield': yield_forecast,
                'price': price_forecast,
                'potential_revenue': round(potential_revenue, 2),
                'recommendations': self._combine_recommendations(
                    yield_forecast.get('recommendations', []),
                    price_forecast.get('recommendations', [])
                )
            }
        except Exception as e:
            logger.error(f"Production forecasting error: {e}")
            return {
                'yield': {'predicted_yield': 0, 'confidence': 0},
                'price': {'predicted_price': 0, 'confidence': 0},
                'potential_revenue': 0,
                'error': str(e)
            }
    
    def _combine_recommendations(self, yield_recs: List[str], price_recs: List[str]) -> List[str]:
        """Combine recommendations from different forecasts"""
        all_recs = yield_recs + price_recs
        # Remove duplicates while preserving order
        seen = set()
        unique_recs = []
        for rec in all_recs:
            if rec not in seen:
                seen.add(rec)
                unique_recs.append(rec)
        return unique_recs

# Example usage and testing
if __name__ == "__main__":
    # Initialize AI service
    ai = FarmMateAI()
    
    # Example farm data
    farm_data = {
        'cropType': 'tomato',
        'temperature': 25,
        'rainfall': 100,
        'humidity': 60,
        'soilPh': 6.5,
        'organicMatter': 3.5,
        'irrigation': 'adequate',
        'pestControl': 'good',
        'fertilization': 'regular'
    }
    
    # Example historical data
    historical_data = [
        {'yield': 20, 'year': 2022},
        {'yield': 22, 'year': 2023}
    ]
    
    # Test production forecasting
    print("=== Production Forecast ===")
    forecast = ai.forecast_production(farm_data, historical_data)
    print(json.dumps(forecast, indent=2))
    
    # Test price forecasting
    print("\n=== Price Forecast ===")
    price_forecast = ai.price_forecaster.forecast_price('tomato', {
        'populationGrowth': 0.015,
        'incomeGrowth': 0.03,
        'healthTrends': 'increasing',
        'productionTrend': 'stable',
        'weatherImpact': 'normal',
        'storageLevels': 'normal'
    })
    print(json.dumps(price_forecast, indent=2))
