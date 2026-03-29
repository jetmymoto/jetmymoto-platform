/**
 * Mission Copy Engine
 * 
 * Generates structured, high-impact mission copy for motorcycle reservations.
 * Implements a controlled hybrid layer with deterministic fallbacks.
 */

const CACHE_KEY = "jetmymoto_mission_copy_cache";
const TIMEOUT_MS = 1500;

/**
 * Generates structured copy based on mission context.
 * 
 * @param {Object} context - Mission parameters
 * @returns {Promise<Object>} Structured copy object
 */
export async function generateMissionCopy(context) {
  const { machineName, category, airportCode, airportCity, operatorName, terrainType, durationDays } = context;

  // 1. Check Session Cache
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.machineName === machineName && parsed.durationDays === durationDays) {
        return parsed.copy;
      }
    }
  } catch (e) {
    // Ignore cache errors
  }

  // 2. Prepare Fallback Copy (Deterministic)
  const categoryLabel = category?.toLowerCase() || "adventure";
  const terrain = terrainType || (categoryLabel.includes("adventure") ? "mixed terrain" : "paved passes");
  
  const fallbackCopy = {
    hook: `Ah, the ${machineName}. Staged at ${airportCode}, configured for ${categoryLabel} deployment. Ready to lock your window?`,
    valueStack: `${operatorName} has this unit staged and verified. Optimal for ${terrain}. You're looking at the right platform.`,
    durationAdvice: durationDays < 3 
      ? "That’s a tight window. Extending to 4–5 days unlocks the full route potential in this region." 
      : "Good window. That gives you proper range for this terrain.",
    insuranceAdvice: "Conditions in this region can shift fast. Most riders choose Premium to eliminate deposit risk.",
    confirmFrame: `Everything is aligned. Machine: ${machineName}. Window: ${durationDays} days. Proceed to secure?`
  };

  // 3. Attempt LLM Call (Controlled)
  // Note: In Phase 2D, this points to a placeholder endpoint that would be handled 
  // by a serverless function. We implement the robust fetch + timeout + fallback pattern.
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Placeholder for actual LLM proxy endpoint
    // const response = await fetch('/api/mission-copy', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(context),
    //   signal: controller.signal
    // });
    
    // For Phase 2D Implementation, we simulate a successful refined response 
    // to demonstrate the architecture while maintaining ZLS and stability.
    // In a production environment, the above fetch would be uncommented.
    
    const useSimulation = true; // Set to false when endpoint is live
    
    if (useSimulation) {
      // Simulate "Smart" refined copy that matches the prompt design
      const refinedCopy = {
        hook: `Ah, the ${machineName}. Staged at ${airportCode} and tuned for ${categoryLabel} deployment. This is the right class of machine for ${terrain}. Ready to lock your window?`,
        valueStack: `${operatorName} has this unit staged and verified. Most riders deploy this setup for ${terrain} and long-range missions. You're looking at the right platform.`,
        durationAdvice: durationDays < 3 
          ? `A ${durationDays}-day mission is tight. Extending your window would unlock the full range of routes staged from ${airportCity}.`
          : `Excellent window. ${durationDays} days provides the range needed to truly exploit this ${categoryLabel} setup.`,
        insuranceAdvice: `Conditions in ${airportCity} can shift rapidly. Most riders opt for Premium to eliminate deposit friction and ride without hesitation.`,
        confirmFrame: `Everything is aligned. The ${machineName} will be reserved under your name at ${airportCode} for your ${durationDays}-day mission. Proceed?`
      };

      // Safety Guardrails
      if (refinedCopy.hook && refinedCopy.hook.length < 300) {
        // Cache result
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ machineName, durationDays, copy: refinedCopy }));
        clearTimeout(timeoutId);
        return refinedCopy;
      }
    }
  } catch (error) {
    console.warn("Mission Copy Engine: LLM call failed or timed out. Using fallback.", error);
  }

  return fallbackCopy;
}
