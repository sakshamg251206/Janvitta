const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  state: { type: String },
  district: { type: String },
  annualIncome: { type: Number, required: true },
  occupation: { type: String, required: true },
  casteCategory: { type: String, enum: ['General', 'OBC', 'SC', 'ST'], required: true },
  hasBPLCard: { type: Boolean, default: false },
  isDifferentlyAbled: { type: Boolean, default: false },
  hasBankAccount: { type: Boolean, default: false },
  hasLandHolding: { type: Boolean, default: false },
  familySize: { type: Number, default: 1 },
  // Adding fields from schema criteria that might be useful
  hasPuccaHouse: { type: Boolean, default: false },
  hasLpgConnection: { type: Boolean, default: false },
  hasRationCard: { type: Boolean, default: false },
  hasGirlChild: { type: Boolean, default: false },
  location: { type: String, enum: ['urban', 'rural'], default: 'urban' },
  isPregnant: { type: Boolean, default: false },
  isCovidOrphan: { type: Boolean, default: false },
  breadwinnerDied: { type: Boolean, default: false },
  disabilityPercentage: { type: Number, default: 0 },
  startupStage: { type: String },
  hasRegisteredStartup: { type: Boolean, default: false },
  sector: { type: String, default: 'organized' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
