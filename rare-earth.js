class RareEarthAnalyzer {
    constructor() {
        this.factors = {
            // Planetary System Requirements
            jupiterProtector: 0.1,      // Probability of having a Jupiter-like protector
            largeMoon: 0.05,            // Probability of having a large stabilizing moon
            plateTectonics: 0.2,        // Probability of active plate tectonics
            
            // Galactic Environment
            galacticHZ: 0.3,            // Fraction of galaxy in habitable zone
            gammaRayBursts: 0.8,        // Probability of avoiding nearby GRBs
            metalRich: 0.4              // Probability of metal-rich environment
        };
        
        this.factorDescriptions = {
            jupiterProtector: {
                name: "Jupiter-like Protector",
                description: "Large outer planet that deflects comets and asteroids",
                importance: "Critical for preventing mass extinctions",
                earthValue: 1.0,
                references: ["Wetherill (1994)", "Horner & Jones (2008)"]
            },
            largeMoon: {
                name: "Large Moon Stabilizer", 
                description: "Moon large enough to stabilize planetary obliquity",
                importance: "Prevents extreme climate variations",
                earthValue: 1.0,
                references: ["Laskar et al. (1993)", "Ward & Brownlee (2000)"]
            },
            plateTectonics: {
                name: "Plate Tectonics",
                description: "Active geological recycling of surface materials",
                importance: "Regulates climate and provides chemical diversity",
                earthValue: 1.0,
                references: ["Kasting & Catling (2003)", "Valencia et al. (2007)"]
            },
            galacticHZ: {
                name: "Galactic Habitable Zone",
                description: "Region with sufficient metals but low radiation",
                importance: "Balance between planet formation and sterilization",
                earthValue: 1.0,
                references: ["Gonzalez et al. (2001)", "Lineweaver et al. (2004)"]
            },
            gammaRayBursts: {
                name: "Gamma-Ray Burst Avoidance",
                description: "Avoiding nearby supernovae and GRBs",
                importance: "Prevents atmospheric ozone depletion",
                earthValue: 1.0,
                references: ["Thorsett (1995)", "Melott & Thomas (2011)"]
            },
            metalRich: {
                name: "Metal-Rich Environment",
                description: "Sufficient heavy elements for rocky planet formation",
                importance: "Required for terrestrial planets and life chemistry",
                earthValue: 1.0,
                references: ["Gonzalez (1999)", "Fischer & Valenti (2005)"]
            }
        };
        
        this.additionalFactors = {
            // Additional factors that could be included
            magneticField: 0.3,         // Strong magnetic field
            waterDelivery: 0.1,         // Appropriate water delivery mechanism
            atmosphericRetention: 0.4,   // Ability to retain atmosphere
            stellarStability: 0.6,      // Stable host star
            tidalLocking: 0.7,          // Avoiding tidal locking
            obliquityStability: 0.2,    // Stable axial tilt
            carbonCycle: 0.3,           // Long-term carbon cycle
            oxygenCatastrophe: 0.1      // Surviving the oxygen catastrophe
        };
        
        this.chart = null;
        this.totalProbability = 0;
        
        this.initializeEventListeners();
        this.initializeChart();
        this.calculateRareEarthProbability();
    }

    initializeEventListeners() {
        Object.keys(this.factors).forEach(factor => {
            const slider = document.getElementById(factor);
            const display = document.getElementById(factor + 'Value');
            
            if (slider && display) {
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.factors[factor] = value;
                    display.textContent = value.toFixed(2);
                    this.calculateRareEarthProbability();
                });
                
                // Initialize display
                display.textContent = this.factors[factor].toFixed(2);
            }
        });
    }

    initializeChart() {
        const ctx = document.getElementById('rareEarthChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
                        '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: '#ffffff',
                            font: { size: 10 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const factor = Object.keys(this.factors)[context.dataIndex];
                                const description = this.factorDescriptions[factor];
                                return `${description.name}: ${(context.parsed * 100).toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
        
        this.updateChart();
    }

    calculateRareEarthProbability() {
        // Calculate combined probability (assuming independence)
        this.totalProbability = Object.values(this.factors).reduce((product, factor) => {
            return product * factor;
        }, 1.0);
        
        // Update display
        const percentage = (this.totalProbability * 100).toFixed(4);
        document.getElementById('rareEarthProb').textContent = `${percentage}%`;
        
        this.updateChart();
        this.analyzeBottlenecks();
    }

    updateChart() {
        const labels = Object.keys(this.factors).map(key => 
            this.factorDescriptions[key].name
        );
        const data = Object.values(this.factors);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    analyzeBottlenecks() {
        // Identify the most restrictive factors
        const sortedFactors = Object.entries(this.factors)
            .map(([key, value]) => ({
                key,
                value,
                name: this.factorDescriptions[key].name,
                impact: this.calculateImpact(key)
            }))
            .sort((a, b) => a.value - b.value);
        
        // The factors with lowest probability are the biggest bottlenecks
        this.displayBottleneckAnalysis(sortedFactors);
    }

    calculateImpact(factorKey) {
        // Calculate how much the total probability would change if this factor was 1.0
        const currentTotal = this.totalProbability;
        const factorValue = this.factors[factorKey];
        
        if (factorValue === 0) return Infinity;
        
        const potentialTotal = currentTotal / factorValue;
        return potentialTotal / currentTotal;
    }

    displayBottleneckAnalysis(sortedFactors) {
        // This could be displayed in a separate panel if desired
        console.log("Rare Earth Bottleneck Analysis:");
        sortedFactors.slice(0, 3).forEach((factor, index) => {
            console.log(`${index + 1}. ${factor.name}: ${(factor.value * 100).toFixed(2)}% (${factor.impact.toFixed(1)}x impact)`);
        });
    }

    // Advanced analysis methods
    sensitivityAnalysis() {
        const results = {};
        const baselineProbability = this.totalProbability;
        
        Object.keys(this.factors).forEach(factor => {
            const originalValue = this.factors[factor];
            
            // Test 10% increase
            this.factors[factor] = Math.min(1.0, originalValue * 1.1);
            const increasedProb = Object.values(this.factors).reduce((p, f) => p * f, 1.0);
            
            // Test 10% decrease  
            this.factors[factor] = Math.max(0.0, originalValue * 0.9);
            const decreasedProb = Object.values(this.factors).reduce((p, f) => p * f, 1.0);
            
            // Restore original value
            this.factors[factor] = originalValue;
            
            // Calculate sensitivity
            const sensitivity = (increasedProb - decreasedProb) / (2 * 0.1 * originalValue);
            
            results[factor] = {
                name: this.factorDescriptions[factor].name,
                sensitivity: sensitivity,
                elasticity: (sensitivity * originalValue) / baselineProbability
            };
        });
        
        return results;
    }

    monteCarloAnalysis(iterations = 10000) {
        const results = [];
        
        // Define uncertainty ranges for each factor
        const uncertaintyRanges = {
            jupiterProtector: { min: 0.01, max: 0.5 },
            largeMoon: { min: 0.001, max: 0.2 },
            plateTectonics: { min: 0.05, max: 0.8 },
            galacticHZ: { min: 0.1, max: 0.6 },
            gammaRayBursts: { min: 0.5, max: 0.95 },
            metalRich: { min: 0.1, max: 0.7 }
        };
        
        for (let i = 0; i < iterations; i++) {
            let probability = 1.0;
            
            Object.keys(this.factors).forEach(factor => {
                const range = uncertaintyRanges[factor];
                const randomValue = range.min + Math.random() * (range.max - range.min);
                probability *= randomValue;
            });
            
            results.push(probability);
        }
        
        // Calculate statistics
        results.sort((a, b) => a - b);
        
        return {
            mean: results.reduce((sum, val) => sum + val, 0) / results.length,
            median: results[Math.floor(results.length / 2)],
            percentile5: results[Math.floor(results.length * 0.05)],
            percentile95: results[Math.floor(results.length * 0.95)],
            min: results[0],
            max: results[results.length - 1],
            distribution: results
        };
    }

    // Compare with other habitability models
    compareWithDrakeEquation(drakeN) {
        // Rare Earth hypothesis suggests Drake equation overestimates
        const rareEarthN = drakeN * this.totalProbability;
        
        return {
            drakeEstimate: drakeN,
            rareEarthEstimate: rareEarthN,
            reductionFactor: this.totalProbability,
            interpretation: this.interpretComparison(drakeN, rareEarthN)
        };
    }

    interpretComparison(drakeN, rareEarthN) {
        const ratio = rareEarthN / drakeN;
        
        if (ratio > 0.1) {
            return "Rare Earth factors still allow for multiple civilizations";
        } else if (ratio > 0.01) {
            return "Rare Earth significantly reduces expectations but doesn't eliminate possibility";
        } else if (ratio > 0.001) {
            return "Rare Earth suggests we may be among very few civilizations";
        } else {
            return "Rare Earth implies we are likely alone in the galaxy";
        }
    }

    // Geological timeline analysis
    getEarthTimelineFactors() {
        return {
            hadeanEon: {
                period: "4.6 - 4.0 Ga",
                challenges: ["Heavy bombardment", "No solid crust", "No atmosphere"],
                rareEarthFactors: ["Planet formation", "Water delivery", "Magnetic field formation"]
            },
            archeanEon: {
                period: "4.0 - 2.5 Ga", 
                challenges: ["Reducing atmosphere", "No oxygen", "Extreme volcanism"],
                rareEarthFactors: ["First life emergence", "Plate tectonics initiation", "Atmospheric evolution"]
            },
            proterozoicEon: {
                period: "2.5 - 0.54 Ga",
                challenges: ["Oxygen catastrophe", "Snowball Earth events", "Eukaryotic evolution"],
                rareEarthFactors: ["Atmospheric oxygenation", "Complex cell evolution", "Climate stability"]
            },
            phanerozoicEon: {
                period: "0.54 Ga - present",
                challenges: ["Mass extinctions", "Climate variations", "Asteroid impacts"],
                rareEarthFactors: ["Complex life diversification", "Intelligence evolution", "Technology development"]
            }
        };
    }

    // Export analysis results
    exportRareEarthAnalysis() {
        const sensitivity = this.sensitivityAnalysis();
        const monteCarlo = this.monteCarloAnalysis();
        
        return {
            currentFactors: this.factors,
            totalProbability: this.totalProbability,
            sensitivityAnalysis: sensitivity,
            monteCarloResults: monteCarlo,
            factorDescriptions: this.factorDescriptions,
            bottlenecks: Object.entries(this.factors)
                .map(([key, value]) => ({
                    factor: key,
                    name: this.factorDescriptions[key].name,
                    probability: value,
                    impact: this.calculateImpact(key)
                }))
                .sort((a, b) => a.probability - b.probability)
        };
    }

    // Integration with main calculator
    updateDrakeEquationWithRareEarth(calculator) {
        if (calculator && calculator.parameters) {
            // Modify the life emergence probability based on Rare Earth factors
            const originalLifeEmergence = calculator.parameters.lifeEmergence;
            const rareEarthModified = originalLifeEmergence * this.totalProbability;
            
            return {
                original: calculator.calculateDrakeEquation(),
                rareEarthModified: calculator.calculateDrakeEquation({
                    ...calculator.parameters,
                    lifeEmergence: rareEarthModified
                }),
                reductionFactor: this.totalProbability
            };
        }
        
        return null;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rareEarthAnalyzer = new RareEarthAnalyzer();
});