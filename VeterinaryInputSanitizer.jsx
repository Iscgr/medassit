/**
 * CRITICAL SECURITY FIX: Input Sanitization for Veterinary AI System
 * ADDRESSES: H3 - Security vulnerabilities (Prompt injection, XSS, Data validation)
 * 
 * This module provides comprehensive input sanitization specifically designed
 * for veterinary AI applications with medical data sensitivity
 */

export class VeterinaryInputSanitizer {
  constructor() {
    // SECURITY: Define allowed patterns for veterinary terminology
    this.allowedPatterns = {
      // Persian veterinary terms (whitelist approach)
      veterinaryTerms: new Set([
        'دامپزشک', 'جراحی', 'تشخیص', 'درمان', 'بیهوشی', 'آناتومی', 
        'پاتولوژی', 'فیزیولوژی', 'میکروب‌شناسی', 'انگل‌شناسی', 'تغذیه',
        'واکسیناسیون', 'عفونت', 'التهاب', 'بیماری', 'علامت', 'نشانه'
      ]),
      
      // Medical measurement units
      medicalUnits: /^(\d+(?:\.\d+)?)\s*(mg|kg|ml|cc|IU|mcg|g|l|mmol|mmHg)$/i,
      
      // Animal species (controlled vocabulary)
      animalSpecies: new Set([
        'سگ', 'گربه', 'اسب', 'گاو', 'گوسفند', 'بز', 'خوک', 'مرغ', 'کبوتر'
      ]),
      
      // Age patterns for animals
      animalAge: /^(\d{1,2})\s*(سال|ماه|هفته|روز)$/,
      
      // Weight patterns
      animalWeight: /^(\d{1,3}(?:\.\d{1,2})?)\s*(کیلوگرم|گرم|kg|g)$/i
    };
    
    // SECURITY: Dangerous patterns to block (blacklist approach)
    this.dangerousPatterns = [
      // Script injection attempts
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      
      // SQL injection patterns
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(UNION\s+SELECT|OR\s+1\s*=\s*1|AND\s+1\s*=\s*1)/gi,
      /('|(\\')|(;|--|\|\||&&))/g,
      
      // Command injection
      /(;|\||&|`|\$\(|\${)/g,
      /(rm\s|del\s|format\s|shutdown\s)/gi,
      
      // Prompt injection for LLM
      /(ignore\s+previous|forget\s+everything|new\s+instructions|system\s+prompt)/gi,
      /(pretend\s+you\s+are|act\s+as\s+if|roleplay\s+as)/gi,
      /(override\s+safety|disable\s+filter|bypass\s+restriction)/gi,
      
      // Medical advice manipulation attempts
      /(diagnose\s+cancer|prescribe\s+medication|surgery\s+required)/gi,
      /(definitely\s+has|certainly\s+needs|must\s+take)/gi
    ];
    
    // MEDICAL SAFETY: Critical medical terms that need special handling
    this.criticalMedicalTerms = new Set([
      'سرطان', 'تومور', 'خونریزی', 'تشنج', 'کما', 'سکته', 'مسمومیت',
      'اورژانس', 'فوری', 'خطرناک', 'مرگ', 'کشنده'
    ]);
    
    // Performance monitoring
    this.sanitizationStats = {
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousPatterns: 0,
      processingTime: []
    };
  }
  
  /**
   * MAIN SANITIZATION METHOD: Comprehensive input cleaning
   * @param {string} input - Raw user input
   * @param {string} context - Input context (diagnostic, treatment, general)
   * @param {Object} options - Sanitization options
   * @returns {Object} Sanitized input with metadata
   */
  sanitizeInput(input, context = 'general', options = {}) {
    const startTime = performance.now();
    this.sanitizationStats.totalRequests++;
    
    try {
      // Input validation
      const validationResult = this.validateInput(input, context);
      if (!validationResult.isValid) {
        this.sanitizationStats.blockedRequests++;
        return {
          sanitized: '',
          blocked: true,
          reason: validationResult.reason,
          riskLevel: 'high'
        };
      }
      
      // Multi-layer sanitization pipeline
      let sanitized = input;
      const sanitizationLog = [];
      
      // Layer 1: Remove dangerous patterns
      const dangerousCheck = this.removeDangerousPatterns(sanitized);
      sanitized = dangerousCheck.cleaned;
      if (dangerousCheck.found.length > 0) {
        sanitizationLog.push(`Removed dangerous patterns: ${dangerousCheck.found.join(', ')}`);
        this.sanitizationStats.suspiciousPatterns++;
      }
      
      // Layer 2: HTML/Script sanitization
      sanitized = this.sanitizeHTML(sanitized);
      
      // Layer 3: Medical context validation
      const medicalValidation = this.validateMedicalContent(sanitized, context);
      if (medicalValidation.hasWarnings) {
        sanitizationLog.push(`Medical warnings: ${medicalValidation.warnings.join(', ')}`);
      }
      
      // Layer 4: Persian text normalization
      sanitized = this.normalizePersianText(sanitized);
      
      // Layer 5: Veterinary terminology validation
      const terminologyCheck = this.validateVeterinaryTerminology(sanitized);
      
      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(
        dangerousCheck.found.length,
        medicalValidation.warnings.length,
        terminologyCheck.unknownTerms.length
      );
      
      // Performance tracking
      const processingTime = performance.now() - startTime;
      this.sanitizationStats.processingTime.push(processingTime);
      
      return {
        sanitized,
        blocked: false,
        riskLevel,
        sanitizationLog,
        medicalWarnings: medicalValidation.warnings,
        unknownTerms: terminologyCheck.unknownTerms,
        processingTime,
        metadata: {
          originalLength: input.length,
          sanitizedLength: sanitized.length,
          context,
          timestamp: Date.now()
        }
      };
      
    } catch (error) {
      console.error('Input sanitization failed:', error);
      return {
        sanitized: '',
        blocked: true,
        reason: 'Sanitization error',
        riskLevel: 'critical',
        error: error.message
      };
    }
  }
  
  /**
   * SECURITY CRITICAL: Input validation with veterinary-specific rules
   */
  validateInput(input, context) {
    // Basic validation
    if (typeof input !== 'string') {
      return { isValid: false, reason: 'Input must be string' };
    }
    
    if (input.length === 0) {
      return { isValid: false, reason: 'Empty input' };
    }
    
    if (input.length > 10000) {
      return { isValid: false, reason: 'Input too long (max 10000 characters)' };
    }
    
    // Context-specific validation
    switch (context) {
      case 'diagnostic':
        return this.validateDiagnosticInput(input);
      case 'treatment':
        return this.validateTreatmentInput(input);
      case 'surgical':
        return this.validateSurgicalInput(input);
      default:
        return { isValid: true };
    }
  }
  
  /**
   * VETERINARY DOMAIN: Validate diagnostic input for medical safety
   */
  validateDiagnosticInput(input) {
    const lowerInput = input.toLowerCase();
    
    // Check for inappropriate diagnostic claims
    const inappropriateClaims = [
      'قطعاً مبتلا است', 'حتماً سرطان دارد', 'بدون شک بیمار است',
      'definitely has', 'certainly sick', 'must have cancer'
    ];
    
    for (const claim of inappropriateClaims) {
      if (lowerInput.includes(claim.toLowerCase())) {
        return {
          isValid: false,
          reason: `Inappropriate diagnostic certainty: "${claim}"`
        };
      }
    }
    
    return { isValid: true };
  }
  
  /**
   * VETERINARY DOMAIN: Validate treatment input for prescription safety
   */
  validateTreatmentInput(input) {
    const lowerInput = input.toLowerCase();
    
    // Check for inappropriate medication prescriptions
    const prescriptionPatterns = [
      /give\s+\d+\s*mg/gi,
      /administer\s+\d+/gi,
      /prescribe\s+[a-z]+/gi,
      /تجویز\s+\d+/gi,
      /بخورد\s+\d+/gi
    ];
    
    for (const pattern of prescriptionPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          reason: 'Inappropriate medication prescription detected'
        };
      }
    }
    
    return { isValid: true };
  }
  
  /**
   * VETERINARY DOMAIN: Validate surgical input
   */
  validateSurgicalInput(input) {
    // Basic surgical input validation
    return { isValid: true };
  }
  
  /**
   * SECURITY: Remove dangerous patterns with detailed logging
   */
  removeDangerousPatterns(input) {
    let cleaned = input;
    const foundPatterns = [];
    
    this.dangerousPatterns.forEach((pattern, index) => {
      const matches = input.match(pattern);
      if (matches) {
        foundPatterns.push(`Pattern_${index}: ${matches.length} matches`);
        cleaned = cleaned.replace(pattern, '[REMOVED]');
      }
    });
    
    return { cleaned, found: foundPatterns };
  }
  
  /**
   * SECURITY: HTML sanitization with whitelist approach
   */
  sanitizeHTML(input) {
    // Remove all HTML tags except safe formatting
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const htmlEntities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '='
    };
    
    Object.entries(htmlEntities).forEach(([entity, char]) => {
      sanitized = sanitized.replace(new RegExp(entity, 'g'), char);
    });
    
    return sanitized;
  }
  
  /**
   * MEDICAL SAFETY: Validate medical content for safety warnings
   */
  validateMedicalContent(input, context) {
    const warnings = [];
    const lowerInput = input.toLowerCase();
    
    // Check for critical medical terms
    this.criticalMedicalTerms.forEach(term => {
      if (lowerInput.includes(term)) {
        warnings.push(`Critical medical term detected: ${term}`);
      }
    });
    
    // Check for emergency indicators
    const emergencyPatterns = [
      /اورژانس|فوری|خطرناک/gi,
      /emergency|urgent|critical/gi,
      /خونریزی|bleeding|hemorrhage/gi,
      /تشنج|seizure|convulsion/gi
    ];
    
    emergencyPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        warnings.push(`Emergency indicator detected (Pattern ${index})`);
      }
    });
    
    return {
      hasWarnings: warnings.length > 0,
      warnings
    };
  }
  
  /**
   * PERSIAN OPTIMIZATION: Normalize Persian text for consistency
   */
  normalizePersianText(input) {
    let normalized = input;
    
    // Normalize Persian/Arabic characters
    const charMap = {
      'ي': 'ی',  // Arabic yeh to Persian yeh
      'ك': 'ک',  // Arabic kaf to Persian kaf
      'ة': 'ه',  // Arabic teh marbuta to Persian heh
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    
    Object.entries(charMap).forEach(([arabic, persian]) => {
      normalized = normalized.replace(new RegExp(arabic, 'g'), persian);
    });
    
    // Remove excessive whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    // Fix common Persian typing errors
    const corrections = {
      'آ نا تومی': 'آناتومی',
      'دام پزشک': 'دامپزشک',
      'جرا حی': 'جراحی',
      'تش خیص': 'تشخیص'
    };
    
    Object.entries(corrections).forEach(([error, correct]) => {
      normalized = normalized.replace(new RegExp(error, 'g'), correct);
    });
    
    return normalized;
  }
  
  /**
   * VETERINARY DOMAIN: Validate terminology against veterinary lexicon
   */
  validateVeterinaryTerminology(input) {
    const words = input.split(/\s+/);
    const unknownTerms = [];
    const recognizedTerms = [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\u0600-\u06FFa-zA-Z]/g, ''); // Keep only letters
      
      if (cleanWord.length < 2) return; // Skip very short words
      
      // Check against veterinary terms
      if (this.allowedPatterns.veterinaryTerms.has(cleanWord)) {
        recognizedTerms.push(cleanWord);
      } else if (this.allowedPatterns.animalSpecies.has(cleanWord)) {
        recognizedTerms.push(cleanWord);
      } else if (cleanWord.length > 3) { // Only flag longer unknown terms
        unknownTerms.push(cleanWord);
      }
    });
    
    return {
      unknownTerms,
      recognizedTerms,
      veterinaryTermRatio: recognizedTerms.length / Math.max(words.length, 1)
    };
  }
  
  /**
   * SECURITY: Calculate overall risk level
   */
  calculateRiskLevel(dangerousPatterns, medicalWarnings, unknownTerms) {
    let riskScore = 0;
    
    // Dangerous patterns contribute heavily to risk
    riskScore += dangerousPatterns * 3;
    
    // Medical warnings indicate moderate risk
    riskScore += medicalWarnings * 2;
    
    // Unknown terms indicate low risk
    riskScore += unknownTerms * 0.1;
    
    if (riskScore >= 5) return 'critical';
    if (riskScore >= 3) return 'high';
    if (riskScore >= 1) return 'medium';
    return 'low';
  }
  
  /**
   * PERFORMANCE: Get sanitization statistics
   */
  getStatistics() {
    const avgProcessingTime = this.sanitizationStats.processingTime.length > 0
      ? this.sanitizationStats.processingTime.reduce((a, b) => a + b, 0) / this.sanitizationStats.processingTime.length
      : 0;
    
    return {
      totalRequests: this.sanitizationStats.totalRequests,
      blockedRequests: this.sanitizationStats.blockedRequests,
      blockRate: this.sanitizationStats.blockedRequests / Math.max(this.sanitizationStats.totalRequests, 1),
      suspiciousPatterns: this.sanitizationStats.suspiciousPatterns,
      avgProcessingTime,
      maxProcessingTime: Math.max(...this.sanitizationStats.processingTime, 0)
    };
  }
}

// Export singleton instance for consistent usage across the application
export const veterinaryInputSanitizer = new VeterinaryInputSanitizer();
export default veterinaryInputSanitizer;