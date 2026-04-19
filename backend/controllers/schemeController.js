const Scheme = require('../models/Scheme');

const getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching schemes' });
  }
};

const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching scheme' });
  }
};

// Helper function to evaluate criteria
const evaluateCriteria = (user, criteria) => {
  let matchedAll = true;
  let almostEligibleCount = 0;
  const totalCriteria = Object.keys(criteria).length;

  for (const [key, expectedValue] of Object.entries(criteria)) {
    if (key === 'occupation' || key === 'casteCategory') {
      if (!expectedValue.includes(user[key]? user[key].toLowerCase() : '')) {
        matchedAll = false;
        almostEligibleCount++;
      }
    } else if (key === 'max_income' && user.annualIncome > expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'min_age' && user.age < expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'max_age' && user.age > expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'gender' && user.gender !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'has_land' && user.hasLandHolding !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'has_pucca_house' && user.hasPuccaHouse !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'is_bpl' && user.hasBPLCard !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'has_lpg_connection' && user.hasLpgConnection !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'has_bank_account' && user.hasBankAccount !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'has_ration_card' && user.hasRationCard !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'has_girl_child' && user.hasGirlChild !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'location' && user.location !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'is_pregnant' && user.isPregnant !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'is_covid_orphan' && user.isCovidOrphan !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'breadwinner_died' && user.breadwinnerDied !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'isDifferentlyAbled' && user.isDifferentlyAbled !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'min_disability_percentage' && user.disabilityPercentage < expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'has_registered_startup' && user.hasRegisteredStartup !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'startup_stage' && user.startupStage !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    } else if (key === 'sector' && user.sector !== expectedValue) {
      matchedAll = false;
      almostEligibleCount++;
    }
  }

  // If failed by exactly 1 criteria, it's almost eligible
  const isAlmostEligible = !matchedAll && almostEligibleCount === 1;

  return { isEligible: matchedAll, isAlmostEligible, missedCriteriaCount: almostEligibleCount, totalCriteria };
};

const matchSchemesToUser = async (req, res) => {
  try {
    // Expect user profile directly in request body for anonymous matching
    const userProfile = req.body;
    
    // Convert necessary strings to lower case for uniform matching
    if (userProfile.occupation) userProfile.occupation = userProfile.occupation.toLowerCase();

    const schemes = await Scheme.find({ isActive: true });
    
    const eligible = [];
    const almostEligible = [];
    const notEligible = [];
    let totalBenefitAmount = 0;

    schemes.forEach((scheme) => {
      const matchResult = evaluateCriteria(userProfile, scheme.criteria);
      
      if (matchResult.isEligible) {
        eligible.push(scheme);
        totalBenefitAmount += scheme.benefit_amount || 0;
      } else if (matchResult.isAlmostEligible) {
        // Tag scheme with missed details
        const schemeObj = scheme.toObject ? scheme.toObject() : { ...scheme };
        schemeObj.missedBy = 1;
        almostEligible.push(schemeObj);
      } else {
        notEligible.push(scheme);
      }
    });

    res.json({
      eligible,
      almostEligible,
      notEligible,
      totalBenefitAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error matching schemes' });
  }
};

module.exports = {
  getAllSchemes,
  getSchemeById,
  matchSchemesToUser
};
