import arcjet, { shield, detectBot, tokenBucket, slidingWindow } from '@arcjet/node';
import express from 'express';

// Environment-specific configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Development configuration - more permissive
const developmentRules = [
  // Shield in DRY_RUN mode for development
  shield({ mode: 'DRY_RUN' }),
  // Bot detection in DRY_RUN mode (logs but doesn't block)
  detectBot({
    mode: 'DRY_RUN',
    allow: [
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW',
      'CATEGORY:API', // Allow API testing tools like Postman
    ],
  }),
  // More lenient rate limiting for development
  slidingWindow({
    mode: 'DRY_RUN',
    interval: '10s',
    max: 50
  })
];

// Production configuration - strict security
const productionRules = [
  // Shield protects your app from common attacks e.g. SQL injection
  shield({ mode: 'LIVE' }),
  // Create a bot detection rule
  detectBot({
    mode: 'LIVE',
    allow: [
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW',
    ],
  }),
  slidingWindow({
    mode: 'LIVE',
    interval: '2s',
    max: 5
  })
];

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: isDevelopment ? developmentRules : productionRules,
});

export default aj;