class AstrobiologyCalculator {
    constructor() {
        this.parameters = {
            starFormationRate: 7,
            planetaryFraction: 0.8,
            habitablePlanets: 0.2,
            lifeEmergence: 0.1,
            intelligentLife: 0.01,
            communicatingLife: 0.1,
            civilizationLifetime: 10000
        };
        
        this.charts = {};
        this.initializeEventListeners();
        this.initializeCharts();
        this.updateCalculations();
        this.loadExoplanetData();
    }

    initializeEventListeners() {
        // Add event listeners for all parameter sliders
        Object.keys(this.parameters).forEach(param => {
            const slider = document.getElementById(param);
            const display = document.getElementById(param + 'Value');
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.parameters[param] = value;
                display.textContent = this.formatValue(param, value);
                this.updateCalculations();
            });
            
            // Initialize display values
            display.textContent = this.formatValue(param, this.parameters[param]);
        });

        // Monte Carlo simulation button
        document.getElementById('runSimulation').addEventListener('click', () => {
            this.runMonteCarloSimulation();
        });
    }

    formatValue(param, value) {
        if (param === 'civilizationLifetime') {
            return value.toLocaleString();
        } else if (value < 0.01) {
            return value.toExponential(2);
        } else {
            return value.toFixed(2);
        }
    }

    calculateDrakeEquation() {
        const {
            starFormationRate,
            planetaryFraction,
            habitablePlanets,
            lifeEmergence,
            intelligentLife,
            communicatingLife,
            civilizationLifetime
        } = this.parameters;

        const N = starFormationRate * 
                  planetaryFraction * 
                  habitablePlanets * 
                  lifeEmergence * 
                  intelligentLife * 
                  communicatingLife * 
                  civilizationLifetime;

        return N;
    }

    calculateNearestCivilizationDistance(N) {
        if (N <= 0) return Infinity;
        
        // Assume civilizations are distributed uniformly in a disk
        // Galaxy diameter ~100,000 light years, thickness ~1,000 light years
        const galaxyVolume = Math.PI * Math.pow(50000, 2) * 1000; // cubic light years
        const density = N / galaxyVolume;
        
        // Average distance between nearest neighbors in 3D
        const averageDistance = Math.pow(1 / density, 1/3);
        
        return averageDistance;
    }

    calculateDetectionProbability(distance) {
        // Probability of detecting a civilization within 50 light years
        const detectionRadius = 50;
        if (distance === Infinity) return 0;
        
        // Simple model: probability decreases with distance
        const prob = Math.max(0, 1 - (distance / detectionRadius));
        return prob * 100;
    }

    updateCalculations() {
        const N = this.calculateDrakeEquation();
        const distance = this.calculateNearestCivilizationDistance(N);
        const detectionProb = this.calculateDetectionProbability(distance);

        document.getElementById('drakeResult').textContent = N.toFixed(2);
        document.getElementById('nearestDistance').textContent = 
            distance === Infinity ? '∞' : distance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' ly';
        document.getElementById('detectionProb').textContent = detectionProb.toFixed(1) + '%';

        this.updateProbabilityChart();
    }

    initializeCharts() {
        // Probability distribution chart
        const ctx1 = document.getElementById('probabilityChart').getContext('2d');
        this.charts.probability = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Civilization Count',
                    data: [],
                    borderColor: '#64b5f6',
                    backgroundColor: 'rgba(100, 181, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
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
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });

        // Exoplanet data chart
        const ctx2 = document.getElementById('exoplanetChart').getContext('2d');
        this.charts.exoplanet = new Chart(ctx2, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Potentially Habitable',
                    data: [],
                    backgroundColor: '#4caf50',
                    borderColor: '#4caf50'
                }, {
                    label: 'Other Exoplanets',
                    data: [],
                    backgroundColor: '#ff9800',
                    borderColor: '#ff9800'
                }]
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
                    x: {
                        title: { display: true, text: 'Distance (light years)', color: '#ffffff' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: { display: true, text: 'Planet Radius (Earth radii)', color: '#ffffff' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    updateProbabilityChart() {
        // Generate sensitivity analysis data
        const baseValue = this.parameters.lifeEmergence;
        const labels = [];
        const data = [];

        for (let i = 0.001; i <= 1; i += 0.05) {
            this.parameters.lifeEmergence = i;
            const N = this.calculateDrakeEquation();
            labels.push(i.toFixed(3));
            data.push(N);
        }

        // Restore original value
        this.parameters.lifeEmergence = baseValue;

        this.charts.probability.data.labels = labels;
        this.charts.probability.data.datasets[0].data = data;
        this.charts.probability.update();
    }

    async loadExoplanetData() {
        // Simulated exoplanet data (in a real app, this would come from NASA Exoplanet Archive)
        const exoplanets = this.generateSimulatedExoplanetData();
        
        const habitable = [];
        const other = [];

        exoplanets.forEach(planet => {
            const point = { x: planet.distance, y: planet.radius };
            if (planet.habitable) {
                habitable.push(point);
            } else {
                other.push(point);
            }
        });

        this.charts.exoplanet.data.datasets[0].data = habitable;
        this.charts.exoplanet.data.datasets[1].data = other;
        this.charts.exoplanet.update();

        this.displayBiosignatureTargets(exoplanets.filter(p => p.habitable));
    }

    generateSimulatedExoplanetData() {
        const planets = [];
        const names = ['Kepler-442b', 'TOI-715b', 'K2-18b', 'TRAPPIST-1e', 'Proxima Centauri b', 
                      'LHS 1140b', 'TOI-849b', 'HD 40307g', 'Gliese 667Cc', 'Kepler-186f'];

        for (let i = 0; i < 50; i++) {
            const distance = Math.random() * 200 + 10; // 10-210 light years
            const radius = Math.random() * 4 + 0.5; // 0.5-4.5 Earth radii
            const temp = Math.random() * 400 + 200; // 200-600 K
            
            // Simple habitability criteria
            const habitable = radius < 2.5 && temp > 273 && temp < 373 && distance < 100;
            
            planets.push({
                name: i < names.length ? names[i] : `Exoplanet-${i}`,
                distance: distance,
                radius: radius,
                temperature: temp,
                habitable: habitable
            });
        }

        return planets;
    }

    displayBiosignatureTargets(habitablePlanets) {
        const container = document.getElementById('biosignatureTargets');
        container.innerHTML = '';

        habitablePlanets.slice(0, 6).forEach(planet => {
            const card = document.createElement('div');
            card.className = 'target-card';
            
            card.innerHTML = `
                <h4>${planet.name}</h4>
                <div class="target-info">
                    <span>Distance:</span> <strong>${planet.distance.toFixed(1)} ly</strong>
                    <span>Radius:</span> <strong>${planet.radius.toFixed(2)} R⊕</strong>
                    <span>Temperature:</span> <strong>${planet.temperature.toFixed(0)} K</strong>
                    <span>JWST Priority:</span> <strong>${planet.distance < 50 ? 'High' : 'Medium'}</strong>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    async runMonteCarloSimulation() {
        const button = document.getElementById('runSimulation');
        const status = document.getElementById('simulationStatus');
        
        button.disabled = true;
        button.textContent = 'Running Simulation...';
        status.textContent = 'Initializing Monte Carlo simulation...';

        // Run simulation in chunks to avoid blocking UI
        const results = await this.performMonteCarloSimulation(10000);
        
        this.displaySimulationResults(results);
        
        button.disabled = false;
        button.textContent = 'Run Monte Carlo Simulation';
        status.textContent = `Simulation complete: ${results.length} iterations`;
    }

    async performMonteCarloSimulation(iterations) {
        const results = [];
        const chunkSize = 1000;
        
        for (let i = 0; i < iterations; i += chunkSize) {
            const chunkResults = [];
            const currentChunkSize = Math.min(chunkSize, iterations - i);
            
            for (let j = 0; j < currentChunkSize; j++) {
                // Add uncertainty to each parameter
                const params = {
                    starFormationRate: this.addUncertainty(this.parameters.starFormationRate, 0.2),
                    planetaryFraction: this.addUncertainty(this.parameters.planetaryFraction, 0.1),
                    habitablePlanets: this.addUncertainty(this.parameters.habitablePlanets, 0.3),
                    lifeEmergence: this.addLogNormalUncertainty(this.parameters.lifeEmergence, 2),
                    intelligentLife: this.addLogNormalUncertainty(this.parameters.intelligentLife, 2),
                    communicatingLife: this.addUncertainty(this.parameters.communicatingLife, 0.3),
                    civilizationLifetime: this.addUncertainty(this.parameters.civilizationLifetime, 0.5)
                };
                
                const N = params.starFormationRate * params.planetaryFraction * params.habitablePlanets * 
                         params.lifeEmergence * params.intelligentLife * params.communicatingLife * 
                         params.civilizationLifetime;
                
                chunkResults.push(N);
            }
            
            results.push(...chunkResults);
            
            // Update status
            document.getElementById('simulationStatus').textContent = 
                `Progress: ${Math.round((i + currentChunkSize) / iterations * 100)}%`;
            
            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        return results;
    }

    addUncertainty(value, relativeError) {
        const error = value * relativeError;
        return Math.max(0, value + (Math.random() - 0.5) * 2 * error);
    }

    addLogNormalUncertainty(value, factor) {
        // Log-normal distribution for highly uncertain parameters
        const logValue = Math.log(value);
        const logError = Math.log(factor);
        const randomLogValue = logValue + (Math.random() - 0.5) * 2 * logError;
        return Math.exp(randomLogValue);
    }

    displaySimulationResults(results) {
        // Calculate statistics
        results.sort((a, b) => a - b);
        const median = results[Math.floor(results.length / 2)];
        const p25 = results[Math.floor(results.length * 0.25)];
        const p75 = results[Math.floor(results.length * 0.75)];
        const mean = results.reduce((a, b) => a + b, 0) / results.length;

        // Update probability chart with histogram
        const bins = 50;
        const max = Math.max(...results);
        const min = Math.min(...results);
        const binSize = (max - min) / bins;
        
        const histogram = new Array(bins).fill(0);
        const labels = [];
        
        for (let i = 0; i < bins; i++) {
            labels.push((min + i * binSize).toFixed(1));
        }
        
        results.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
            histogram[binIndex]++;
        });

        this.charts.probability.data.labels = labels;
        this.charts.probability.data.datasets[0].data = histogram;
        this.charts.probability.data.datasets[0].label = 'Simulation Results (Frequency)';
        this.charts.probability.update();

        // Display statistics
        document.getElementById('simulationStatus').innerHTML = `
            <strong>Simulation Statistics:</strong><br>
            Mean: ${mean.toFixed(2)} | Median: ${median.toFixed(2)}<br>
            25th percentile: ${p25.toFixed(2)} | 75th percentile: ${p75.toFixed(2)}
        `;
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AstrobiologyCalculator();
});