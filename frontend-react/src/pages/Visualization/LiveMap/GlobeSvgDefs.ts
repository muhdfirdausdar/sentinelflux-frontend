import * as d3 from "d3";

/**
 * Creates SVG filter definitions for the Globe visualization
 * Call this function once when initializing the SVG
 */
export const createGlobeFilters = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
  const defs = svg.append("defs");

  // Standard glow filter (medium intensity)
  const glowFilter = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-200%")
    .attr("y", "-200%")
    .attr("width", "400%")
    .attr("height", "400%");
  
  glowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "4")
    .attr("result", "coloredBlur");
  
  const feMerge = glowFilter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Strong glow filter (high intensity) - Enhanced
  const strongGlowFilter = defs.append("filter")
    .attr("id", "strongGlow")
    .attr("x", "-500%")
    .attr("y", "-500%")
    .attr("width", "1000%")
    .attr("height", "1000%");
  
  // First blur pass
  strongGlowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "6")
    .attr("result", "blur1");
  
  // Second blur pass for more spread
  strongGlowFilter.append("feGaussianBlur")
    .attr("in", "blur1")
    .attr("stdDeviation", "3")
    .attr("result", "blur2");
  
  // Brighten the glow
  strongGlowFilter.append("feColorMatrix")
    .attr("in", "blur2")
    .attr("type", "matrix")
    .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0")
    .attr("result", "brightBlur");
  
  const feMerge2 = strongGlowFilter.append("feMerge");
  feMerge2.append("feMergeNode").attr("in", "brightBlur");
  feMerge2.append("feMergeNode").attr("in", "blur2");
  feMerge2.append("feMergeNode").attr("in", "SourceGraphic");

  // Subtle glow filter (light intensity)
  const subtleGlowFilter = defs.append("filter")
    .attr("id", "subtleGlow")
    .attr("x", "-150%")
    .attr("y", "-150%")
    .attr("width", "300%")
    .attr("height", "300%");
  
  subtleGlowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "2")
    .attr("result", "coloredBlur");
  
  const feMerge3 = subtleGlowFilter.append("feMerge");
  feMerge3.append("feMergeNode").attr("in", "coloredBlur");
  feMerge3.append("feMergeNode").attr("in", "SourceGraphic");

  // Pulsing glow filter (animated effect) - Enhanced
  const pulsingGlowFilter = defs.append("filter")
    .attr("id", "pulsingGlow")
    .attr("x", "-400%")
    .attr("y", "-400%")
    .attr("width", "800%")
    .attr("height", "800%");
  
  pulsingGlowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "5")
    .attr("result", "coloredBlur");
  
  // Add brightness to make it more visible
  pulsingGlowFilter.append("feColorMatrix")
    .attr("in", "coloredBlur")
    .attr("type", "matrix")
    .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.5 0")
    .attr("result", "brightBlur");
  
  const feMerge4 = pulsingGlowFilter.append("feMerge");
  feMerge4.append("feMergeNode").attr("in", "brightBlur");
  feMerge4.append("feMergeNode").attr("in", "coloredBlur");
  feMerge4.append("feMergeNode").attr("in", "SourceGraphic");

  // Ultra glow filter (very intense, for dramatic effect)
  const ultraGlowFilter = defs.append("filter")
    .attr("id", "ultraGlow")
    .attr("x", "-600%")
    .attr("y", "-600%")
    .attr("width", "1200%")
    .attr("height", "1200%");
  
  // Multiple blur layers for maximum spread
  ultraGlowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "8")
    .attr("result", "blur1");
  
  ultraGlowFilter.append("feGaussianBlur")
    .attr("in", "blur1")
    .attr("stdDeviation", "4")
    .attr("result", "blur2");
  
  // Triple brightness
  ultraGlowFilter.append("feColorMatrix")
    .attr("in", "blur2")
    .attr("type", "matrix")
    .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0")
    .attr("result", "ultraBright");
  
  const feMerge5 = ultraGlowFilter.append("feMerge");
  feMerge5.append("feMergeNode").attr("in", "ultraBright");
  feMerge5.append("feMergeNode").attr("in", "blur2");
  feMerge5.append("feMergeNode").attr("in", "blur1");
  feMerge5.append("feMergeNode").attr("in", "SourceGraphic");

  console.log('SVG filters created: glow, strongGlow, subtleGlow, pulsingGlow, ultraGlow');
};

/**
 * Available filter IDs for use with .attr("filter", "url(#filterId)")
 */
export const GlobeFilters = {
  SUBTLE_GLOW: "subtleGlow",   // Subtle glow (stdDeviation: 2)
  GLOW: "glow",                // Standard glow (stdDeviation: 4)
  PULSING_GLOW: "pulsingGlow", // Pulsing glow (stdDeviation: 5, brightness: 1.5x)
  STRONG_GLOW: "strongGlow",   // Strong glow (double blur: 6+3, brightness: 2x)
  ULTRA_GLOW: "ultraGlow"      // Ultra glow (triple blur: 8+4, brightness: 3x)
} as const;
