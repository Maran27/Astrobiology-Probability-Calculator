// Advanced Monte Carlo simulation for astrobiology probability calculations
class MonteCarloSimulator {
    constructor() {
        this.distributionTypes = {
            NORMAL: 'normal',
            LOG_NORMAL: 'log_normal',
            UNIFORM: 'uniform',
            BETA: 'beta',
            EXPONENTIAL: 'exponential'
        };
    }

    // Generate random samples from different probability distributions
    generateSample(distribution, params) {
        switch (distribution) {
            case this.distributionTypes.NORMAL:
                return this.normalDistribution(params.mean, params.std);
            case this.distributionTypes.LOG_NORMAL:
                return this.logNormalDistribution(params.median, params.factor);
            case this.distributionTypes.UNIFORM:
                return this.uniformDistribution(params.min, params.max);
            case this.distributionTypes.BETA:
                return this.betaDistribution(params.alpha, params.beta);
            case this.distributionTypes.EXPONENTIAL:
                return this.exponentialDistribution(params.lambda);
            default:
                return params.value || 0;
        }
    }

    normalDistribution(mean, std) {
        // Box-Muller transformation
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + std * z0;
    }

    logNormalDistribution(median, factor) {
        const normal = this.normalDistribution(0, 1);
        const logMedian = Math.log(median);
        const logSigma = Math.log(factor);
        return Math.exp(logMedian + logSigma * normal);
    }

    uniformDistribution(min, max) {
        return min + Math.random() * (max - min);
    }

    betaDistribution(alpha, beta) {
        // Using rejection sampling for Beta distribution
        const gamma1 = this.gammaDistribution(alpha, 1);
        const gamma2 = this.gammaDistribution(beta, 1);
        return gamma1 / (gamma1 + gamma2);
    }

    gammaDistribution(shape, scale) {
        // Marsaglia and Tsang's method for Gamma distribution
        if (shape < 1) {
            return this.gammaDistribution(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
        }

        const d = shape - 1/3;
        const c = 1 / Math.sqrt(9 * d);
        
        while (true) {
            let x, v;
            do {
                x = this.normalDistribution(0, 1);
                v = 1 + c * x;
            } while (v <= 0);
            
            v = v * v * v;
            const u = Math.random();
            
            if (u < 1 - 0.0331 * x * x * x * x) {
                return d * v * scale;
            }
            
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
                return d * v * scale;
            }
        }
    }

    exponentialDistribution(lambda) {
        return -Math.log(Math.random()) / lambda;
    }

    // Advanced Drake Equation simulation with correlated parameters
    runAdvancedDrakeSimulation(iterations, parameterDistributions, correlations = {}) {
        const results = [];
        const parameterSamples = {};

        for (let i = 0; i < iterations; i++) {
            const sample = {};
            
            // Generate correlated samples
            Object.keys(parameterDistributions).forEach(param => {
                if (correlations[param]) {
                    // Apply correlation with previously sampled parameter
                    const correlatedParam = correlations[param].with;
                    const correlation = correlations[param].coefficient;
                    
                    if (sample[correlatedParam] !== undefined) {
                        const baseValue = this.generateSample(
                            parameterDistributions[param].distribution,
                            parameterDistributions[param].params
                        );
                        
                        // Apply correlation (simplified linear correlation)
                        const correlatedValue = baseValue + correlation * 
                            (sample[correlatedParam] - parameterDistributions[correlatedParam].params.mean || 0);
                        
                        sample[param] = Math.max(0, correlatedValue);
                    } else {
                        sample[param] = this.generateSample(
                            parameterDistributions[param].distribution,
                            parameterDistributions[param].params
                        );
                    }
                } else {
                    sample[param] = this.generateSample(
                        parameterDistributions[param].distribution,
                        parameterDistributions[param].params
                    );
                }
            });

            // Calculate Drake equation result
            const N = sample.starFormationRate * 
                     sample.planetaryFraction * 
                     sample.habitablePlanets * 
                     sample.lifeEmergence * 
                     sample.intelligentLife * 
                     sample.communicatingLife * 
                     sample.civilizationLifetime;

            results.push({
                N: N,
                parameters: { ...sample },
                nearestDistance: this.calculateNearestDistance(N),
                detectionProbability: this.calculateDetectionProbability(N)
            });

            // Store samples for correlation analysis
            Object.keys(sample).forEach(param => {
                if (!parameterSamples[param]) parameterSamples[param] = [];
                parameterSamples[param].push(sample[param]);
            });
        }

        return {
            results: results,
            statistics: this.calculateStatistics(results),
            parameterSamples: parameterSamples,
            correlationAnalysis: this.analyzeCorrelations(parameterSamples, results)
        };
    }

    calculateNearestDistance(N) {
        if (N <= 0) return Infinity;
        
        // More sophisticated model considering galactic structure
        const galaxyRadius = 50000; // light years
        const galaxyThickness = 1000; // light years
        const galaxyVolume = Math.PI * galaxyRadius * galaxyRadius * galaxyThickness;
        
        // Account for stellar density variations
        const stellarDensityFactor = 0.1; // Only ~10% of galaxy volume has significant stellar density
        const effectiveVolume = galaxyVolume * stellarDensityFactor;
        
        const density = N / effectiveVolume;
        return Math.pow(1 / density, 1/3);
    }

    calculateDetectionProbability(N) {
        const distance = this.calculateNearestDistance(N);
        if (distance === Infinity) return 0;
        
        // More realistic detection model
        const radioHorizon = 100; // light years for radio detection
        const opticalHorizon = 50; // light years for optical detection
        
        const radioProb = Math.exp(-distance / radioHorizon);
        const opticalProb = Math.exp(-distance / opticalHorizon);
        
        return Math.max(radioProb, opticalProb);
    }

    calculateStatistics(results) {
        const values = results.map(r => r.N).sort((a, b) => a - b);
        const distances = results.map(r => r.nearestDistance).filter(d => d !== Infinity);
        const detectionProbs = results.map(r => r.detectionProbability);

        return {
            civilizations: {
                mean: this.mean(values),
                median: this.median(values),
                mode: this.mode(values),
                std: this.standardDeviation(values),
                percentiles: {
                    p5: this.percentile(values, 0.05),
                    p25: this.percentile(values, 0.25),
                    p75: this.percentile(values, 0.75),
                    p95: this.percentile(values, 0.95)
                },
                confidenceInterval: this.confidenceInterval(values, 0.95)
            },
            nearestDistance: {
                mean: distances.length > 0 ? this.mean(distances) : Infinity,
                median: distances.length > 0 ? this.median(distances) : Infinity,
                std: distances.length > 0 ? this.standardDeviation(distances) : 0
            },
            detectionProbability: {
                mean: this.mean(detectionProbs),
                median: this.median(detectionProbs),
                std: this.standardDeviation(detectionProbs)
            }
        };
    }

    analyzeCorrelations(parameterSamples, results) {
        const correlations = {};
        const paramNames = Object.keys(parameterSamples);
        const outcomes = results.map(r => r.N);

        // Calculate correlation between parameters and outcome
        paramNames.forEach(param => {
            correlations[param] = {
                withOutcome: this.pearsonCorrelation(parameterSamples[param], outcomes),
                withOtherParams: {}
            };

            // Calculate correlations between parameters
            paramNames.forEach(otherParam => {
                if (param !== otherParam) {
                    correlations[param].withOtherParams[otherParam] = 
                        this.pearsonCorrelation(parameterSamples[param], parameterSamples[otherParam]);
                }
            });
        });

        return correlations;
    }

    pearsonCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    // Statistical utility functions
    mean(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    median(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? 
            (sorted[mid - 1] + sorted[mid]) / 2 : 
            sorted[mid];
    }

    mode(values) {
        const frequency = {};
        let maxFreq = 0;
        let mode = values[0];

        values.forEach(value => {
            const rounded = Math.round(value * 100) / 100; // Round to avoid floating point issues
            frequency[rounded] = (frequency[rounded] || 0) + 1;
            if (frequency[rounded] > maxFreq) {
                maxFreq = frequency[rounded];
                mode = rounded;
            }
        });

        return mode;
    }

    standardDeviation(values) {
        const avg = this.mean(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }

    percentile(values, p) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = p * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;

        if (upper >= sorted.length) return sorted[sorted.length - 1];
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    confidenceInterval(values, confidence) {
        const alpha = 1 - confidence;
        const lowerP = alpha / 2;
        const upperP = 1 - alpha / 2;
        
        return {
            lower: this.percentile(values, lowerP),
            upper: this.percentile(values, upperP)
        };
    }

    // Fermi Paradox analysis
    fermiParadoxAnalysis(simulationResults) {
        const results = simulationResults.results;
        const highCivCount = results.filter(r => r.N > 1000).length;
        const mediumCivCount = results.filter(r => r.N > 10 && r.N <= 1000).length;
        const lowCivCount = results.filter(r => r.N > 0 && r.N <= 10).length;
        const noCivCount = results.filter(r => r.N <= 0).length;

        const totalSims = results.length;

        return {
            scenarios: {
                'Great Filter Ahead': noCivCount / totalSims,
                'Rare Earth': lowCivCount / totalSims,
                'Zoo Hypothesis': mediumCivCount / totalSims,
                'Transcension': highCivCount / totalSims
            },
            paradoxResolution: this.suggestParadoxResolution(simulationResults.statistics)
        };
    }

    suggestParadoxResolution(statistics) {
        const meanCivs = statistics.civilizations.mean;
        
        if (meanCivs < 0.1) {
            return "Great Filter: Life or intelligence is extremely rare";
        } else if (meanCivs < 1) {
            return "Rare Earth: Complex life requires very specific conditions";
        } else if (meanCivs < 100) {
            return "Short-lived civilizations: Technology leads to self-destruction";
        } else {
            return "Hidden civilizations: Advanced species avoid detection";
        }
    }
}

// Export for use in main application
window.MonteCarloSimulator = MonteCarloSimulator;