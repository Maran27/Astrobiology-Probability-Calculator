class MultiScenarioAnalyzer {
    constructor() {
        this.scenarios = {
            optimistic: {
                name: "Optimistic",
                description: "Life emerges readily, intelligence is common",
                parameters: {
                    starFormationRate: 10,
                    planetaryFraction: 0.9,
                    habitablePlanets: 0.5,
                    lifeEmergence: 0.8,
                    intelligentLife: 0.1,
                    communicatingLife: 0.5,
                    civilizationLifetime: 100000
                },
                color: '#4caf50'
            },
            pessimistic: {
                name: "Pessimistic",
                description: "Life is rare, intelligence rarer still",
                parameters: {
                    starFormationRate: 5,
                    planetaryFraction: 0.6,
                    habitablePlanets: 0.05,
                    lifeEmergence: 0.001,
                    intelligentLife: 0.001,
                    communicatingLife: 0.01,
                    civilizationLifetime: 1000
                },
                color: '#f44336'
            },
            historical: {
                name: "Historical (Drake 1961)",
                description: "Original Drake Equation estimates",
                parameters: {
                    starFormationRate: 1,
                    planetaryFraction: 0.2,
                    habitablePlanets: 1,
                    lifeEmergence: 1,
                    intelligentLife: 1,
                    communicatingLife: 0.01,
                    civilizationLifetime: 10000
                },
                color: '#ff9800'
            },
            custom: {
                name: "Custom",
                description: "User-defined parameters",
                parameters: null, // Will use current calculator values
                color: '#9c27b0'
            }
        };

        this.currentScenario = 'optimistic';
        this.chart = null;
        this.initializeEventListeners();
        this.initializeChart();
        this.updateScenarioAnalysis();
    }

    initializeEventListeners() {
        // Scenario selection buttons
        Object.keys(this.scenarios).forEach(scenarioKey => {
            const button = document.getElementById(`${scenarioKey}Scenario`);
            if (button) {
                button.addEventListener('click', () => {
                    this.selectScenario(scenarioKey);
                });
            }
        });
    }

    selectScenario(scenarioKey) {
        // Update active button
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${scenarioKey}Scenario`).classList.add('active');

        this.currentScenario = scenarioKey;
        this.updateScenarioAnalysis();
    }

    initializeChart() {
        const ctx = document.getElementById('scenarioChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'Star Formation',
                    'Planetary Systems',
                    'Habitable Planets',
                    'Life Emergence',
                    'Intelligence',
                    'Communication',
                    'Longevity'
                ],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1,
                        ticks: { 
                            color: '#ffffff',
                            backdropColor: 'transparent'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#ffffff' }
                    }
                }
            }
        });
    }

    updateScenarioAnalysis() {
        // Get current calculator parameters for custom scenario
        if (this.currentScenario === 'custom') {
            this.scenarios.custom.parameters = this.getCurrentCalculatorParameters();
        }

        // Update radar chart with all scenarios
        this.updateRadarChart();
        
        // Calculate and display results for all scenarios
        this.calculateScenarioResults();
    }

    getCurrentCalculatorParameters() {
        // Get parameters from main calculator
        const calculator = window.astrobiologyCalculator;
        if (calculator) {
            return { ...calculator.parameters };
        }
        
        // Fallback to reading from DOM
        return {
            starFormationRate: parseFloat(document.getElementById('starFormationRate').value),
            planetaryFraction: parseFloat(document.getElementById('planetaryFraction').value),
            habitablePlanets: parseFloat(document.getElementById('habitablePlanets').value),
            lifeEmergence: parseFloat(document.getElementById('lifeEmergence').value),
            intelligentLife: parseFloat(document.getElementById('intelligentLife').value),
            communicatingLife: parseFloat(document.getElementById('communicatingLife').value),
            civilizationLifetime: parseFloat(document.getElementById('civilizationLifetime').value)
        };
    }

    updateRadarChart() {
        const datasets = [];

        Object.keys(this.scenarios).forEach(scenarioKey => {
            const scenario = this.scenarios[scenarioKey];
            if (!scenario.parameters) return;

            // Normalize parameters for radar chart (0-1 scale)
            const normalizedData = [
                Math.min(scenario.parameters.starFormationRate / 50, 1),
                scenario.parameters.planetaryFraction,
                scenario.parameters.habitablePlanets,
                scenario.parameters.lifeEmergence,
                scenario.parameters.intelligentLife,
                scenario.parameters.communicatingLife,
                Math.min(scenario.parameters.civilizationLifetime / 1000000, 1)
            ];

            datasets.push({
                label: scenario.name,
                data: normalizedData,
                borderColor: scenario.color,
                backgroundColor: scenario.color + '20',
                pointBackgroundColor: scenario.color,
                pointBorderColor: scenario.color,
                pointHoverBackgroundColor: scenario.color,
                pointHoverBorderColor: scenario.color,
                borderWidth: 2
            });
        });

        this.chart.data.datasets = datasets;
        this.chart.update();
    }

    calculateScenarioResults() {
        const resultsContainer = document.getElementById('scenarioResults');
        resultsContainer.innerHTML = '';

        Object.keys(this.scenarios).forEach(scenarioKey => {
            const scenario = this.scenarios[scenarioKey];
            if (!scenario.parameters) return;

            const result = this.calculateDrakeEquation(scenario.parameters);
            const distance = this.calculateNearestDistance(result.N);
            const detectionProb = this.calculateDetectionProbability(distance);

            const card = document.createElement('div');
            card.className = 'scenario-result-card';
            card.style.borderLeft = `4px solid ${scenario.color}`;

            card.innerHTML = `
                <h4>${scenario.name}</h4>
                <div style="font-size: 0.9rem; color: #b0bec5; margin-bottom: 10px;">
                    ${scenario.description}
                </div>
                <div style="font-size: 1.2rem; color: ${scenario.color}; font-weight: bold;">
                    ${result.N.toFixed(1)} civilizations
                </div>
                <div style="font-size: 0.8rem; color: #90caf9; margin-top: 5px;">
                    Nearest: ${distance === Infinity ? '∞' : Math.round(distance).toLocaleString()} ly
                </div>
                <div style="font-size: 0.8rem; color: #90caf9;">
                    Detection: ${detectionProb.toFixed(1)}%
                </div>
            `;

            resultsContainer.appendChild(card);
        });
    }

    calculateDrakeEquation(params) {
        const N = params.starFormationRate * 
                  params.planetaryFraction * 
                  params.habitablePlanets * 
                  params.lifeEmergence * 
                  params.intelligentLife * 
                  params.communicatingLife * 
                  params.civilizationLifetime;

        return { N, parameters: params };
    }

    calculateNearestDistance(N) {
        if (N <= 0) return Infinity;
        
        const galaxyVolume = Math.PI * Math.pow(50000, 2) * 1000;
        const density = N / galaxyVolume;
        return Math.pow(1 / density, 1/3);
    }

    calculateDetectionProbability(distance) {
        if (distance === Infinity) return 0;
        const detectionRadius = 50;
        return Math.max(0, (1 - (distance / detectionRadius)) * 100);
    }

    // Historical parameter evolution analysis
    getHistoricalParameterEvolution() {
        return {
            1961: { // Original Drake
                lifeEmergence: 1.0,
                intelligentLife: 1.0,
                rationale: "Drake assumed life would emerge on all suitable planets"
            },
            1980: { // Post-Viking missions
                lifeEmergence: 0.1,
                intelligentLife: 0.1,
                rationale: "Mars appeared sterile, reduced optimism"
            },
            1995: { // First exoplanet discoveries
                planetaryFraction: 0.5,
                habitablePlanets: 0.1,
                rationale: "Hot Jupiters suggested planetary systems differ from ours"
            },
            2009: { // Kepler mission begins
                planetaryFraction: 0.8,
                habitablePlanets: 0.2,
                rationale: "Planets are common, many in habitable zones"
            },
            2020: { // Modern estimates
                planetaryFraction: 0.9,
                habitablePlanets: 0.15,
                lifeEmergence: 0.01,
                intelligentLife: 0.001,
                rationale: "Planets ubiquitous, but life may be rare"
            }
        };
    }

    // Comparative analysis methods
    compareScenarios(scenario1Key, scenario2Key) {
        const s1 = this.scenarios[scenario1Key];
        const s2 = this.scenarios[scenario2Key];
        
        if (!s1.parameters || !s2.parameters) return null;

        const result1 = this.calculateDrakeEquation(s1.parameters);
        const result2 = this.calculateDrakeEquation(s2.parameters);

        return {
            scenario1: { name: s1.name, result: result1.N },
            scenario2: { name: s2.name, result: result2.N },
            ratio: result1.N / result2.N,
            difference: result1.N - result2.N,
            mostSensitiveParameter: this.findMostSensitiveParameter(s1.parameters, s2.parameters)
        };
    }

    findMostSensitiveParameter(params1, params2) {
        const paramNames = Object.keys(params1);
        let maxSensitivity = 0;
        let mostSensitive = '';

        paramNames.forEach(param => {
            const sensitivity = Math.abs(params1[param] - params2[param]) / 
                              Math.max(params1[param], params2[param]);
            if (sensitivity > maxSensitivity) {
                maxSensitivity = sensitivity;
                mostSensitive = param;
            }
        });

        return { parameter: mostSensitive, sensitivity: maxSensitivity };
    }

    // Export scenario data for further analysis
    exportScenarioData() {
        const data = {};
        
        Object.keys(this.scenarios).forEach(scenarioKey => {
            const scenario = this.scenarios[scenarioKey];
            if (scenario.parameters) {
                const result = this.calculateDrakeEquation(scenario.parameters);
                data[scenarioKey] = {
                    name: scenario.name,
                    description: scenario.description,
                    parameters: scenario.parameters,
                    result: result.N,
                    nearestDistance: this.calculateNearestDistance(result.N),
                    detectionProbability: this.calculateDetectionProbability(
                        this.calculateNearestDistance(result.N)
                    )
                };
            }
        });

        return data;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.multiScenarioAnalyzer = new MultiScenarioAnalyzer();
});