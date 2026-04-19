const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name_en: { type: String, required: true },
  name_hi: { type: String, required: true },
  ministry: { type: String },
  benefit_amount: { type: Number, required: true },
  benefit_type: { type: String, enum: ['cash', 'loan', 'insurance', 'subsidy', 'savings', 'pension', 'support', 'grant', 'employment'], required: true },
  criteria: { type: Object, required: true },
  apply_link: { type: String, required: true },
  documents: [{ type: String }],
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Scheme', schemeSchema);
