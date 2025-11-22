class SETIStrategyOptimizer {
    constructor() {
        this.resources = {
            radioTime: 2000,      // hours per year
            opticalTime: 1000,    // hours per year
            technoTime: 500       // hours per year
        };
        
        this.targets = [];
        this.strategies = {
            broadSearch: {
                name: "Broad Search",
                description: "Survey many targets briefly",
                radioWeight: 0.6,
                opticalWeight: 0.3,
                technoWeight: 0.1,
                targetCount: 1000,
                timePerTarget: 2
            },
            deepSearch: {
                name: "Deep Search", 
                description: "Intensive study of few targets",
                radioWeight: 0.4,
                opticalWeight: 0.4,
                technoWeight: 0.2,
                targetCount: 50,
                timePerTarget: 40
            },
            technosignature: {
                name: "Technosignature Focus",
                description: "Search for artificial signals",
                radioWeight: 0.2,
                opticalWeight: 0.3,
                technoWeight: 0.5,
                targetCount: 200,
                timePerTarget: 10
            },
            nearbyStars: {
                name: "Nearby Stars",
                description: "Focus on closest systems",
                radioWeight: 0.5,
                opticalWeight: 0.4,
                technoWeight: 0.1,
                targetCount: 100,
                timePerTarget: 20
            }
        };
        
        this.currentStrategy = 'broadSearch';
        this.chart = null;
        this.detectionScore = 0;
        
        this.initializeTargets();
        this.initializeEventListeners();
        this.initializeChart();
        this.calculateOptimalStrategy();
    }

    initializeEventListeners() {
        // Resource allocation sliders
        ['radioTime', 'opticalTime', 'technoTime'].forEach(resource => {
            const slider = document.getElementById(resource);
            const display = document.getElementById(resource + 'Value');
            
            slider.addEventListener('input', (e) => {
                this.resources[resource] = parseInt(e.target.value);
                display.textContent = e.target.value;
                this.calculateOptimalStrategy();
            });
        });

        // Optimization button
        document.getElementById('optimizeStrategy').addEventListener('click', () => {
            this.runOptimization();
        });
    }

    initializeTargets() {
        // Generate realistic SETI targets based on exoplanet data
        const exoplanetManager = new ExoplanetDataManager();
        const exoplanets = exoplanetManager.generateRealisticExoplanetData();
        
        this.targets = exoplanets.map((planet, index) => {
            const habitabilityScore = exoplanetManager.calculateHabitabilityScore(planet);
            
            return {
                id: index,
                name: planet.name,
                distance: planet.distance,
                habitabilityScore: habitabilityScore,
                stellarType: planet.hostStarType,
                radius: planet.radius,
                temperature: planet.temperature,
                
                // SETI-specific properties
                radioDetectability: this.calculateRadioDetectability(planet),
                opticalDetectability: this.calculateOpticalDetectability(planet),
                technosignatureProb: this.calculateTechnosignatureProbability(planet),
                
                // Observational constraints
                observabilityScore: this.calculateObservabilityScore(planet),
                priority: habitabilityScore * this.calculateObservabilityScore(planet)
            };
        });
        
        // Sort by priority
        this.targets.sort((a, b) => b.priority - a.priority);
    }

    calculateRadioDetectability(planet) {
        let score = 0;
        
        // Distance factor (closer is better)
        score += Math.max(0, 1 - planet.distance / 200) * 0.4;
        
        // Stellar type factor (quiet stars are better)
        if (planet.hostStarType.startsWith('G')) score += 0.3;
        else if (planet.hostStarType.startsWith('K')) score += 0.25;
        else if (planet.hostStarType.startsWith('M')) score += 0.1; // Flare activity
        
        // Habitability factor
        const tempScore = planet.temperature > 250 && planet.temperature < 350 ? 0.3 : 0.1;
        score += tempScore;
        
        return Math.min(score, 1.0);
    }

    calculateOpticalDetectability(planet) {
        let score = 0;
        
        // Distance factor (even more important for optical)
        score += Math.max(0, 1 - planet.distance / 100) * 0.5;
        
        // Size factor (larger planets easier to detect)
        if (planet.radius > 1.5) score += 0.3;
        else if (planet.radius > 0.8) score += 0.2;
        else score += 0.1;
        
        // Atmospheric potential
        if (planet.radius > 0.5 && planet.radius < 3.0) score += 0.2;
        
        return Math.min(score, 1.0);
    }

    calculateTechnosignatureProbability(planet) {
        let score = 0;
        
        // Habitability is prerequisite for technology
        const habitScore = this.calculateBasicHabitability(planet);
        score += habitScore * 0.5;
        
        // Stellar stability (important for long-term development)
        if (planet.hostStarType.startsWith('G') || planet.hostStarType.startsWith('K')) {
            score += 0.3;
        } else if (planet.hostStarType.startsWith('M')) {
            score += 0.1; // M dwarfs have issues but are long-lived
        }
        
        // System age proxy (older systems more likely to have advanced life)
        // Simplified: assume metal-rich stars are younger
        score += 0.2; // Base assumption
        
        return Math.min(score, 1.0);
    }

    calculateBasicHabitability(planet) {
        let score = 0;
        
        if (planet.temperature > 273 && planet.temperature < 373) score += 0.4;
        if (planet.radius > 0.5 && planet.radius < 2.5) score += 0.3;
        if (planet.distance < 100) score += 0.3;
        
        return Math.min(score, 1.0);
    }

    calculateObservabilityScore(planet) {
        let score = 0;
        
        // Distance penalty
        score += Math.max(0, 1 - planet.distance / 300) * 0.4;
        
        // Brightness (stellar type affects this)
        if (planet.hostStarType.startsWith('G')) score += 0.3;
        else if (planet.hostStarType.startsWith('K')) score += 0.25;
        else if (planet.hostStarType.startsWith('M')) score += 0.2;
        else score += 0.1;
        
        // Declination factor (simplified - assume all targets observable)
        score += 0.3;
        
        return Math.min(score, 1.0);
    }

    initializeChart() {
        const ctx = document.getElementById('setiChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'High Priority Targets',
                    data: [],
                    backgroundColor: '#4caf50',
                    borderColor: '#4caf50',
                    pointRadius: 6
                }, {
                    label: 'Medium Priority Targets',
                    data: [],
                    backgroundColor: '#ff9800',
                    borderColor: '#ff9800',
                    pointRadius: 4
                }, {
                    label: 'Low Priority Targets',
                    data: [],
                    backgroundColor: '#f44336',
                    borderColor: '#f44336',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const target = this.targets[context.dataIndex];
                                return `${target.name}: Distance ${target.distance.toFixed(1)} ly, Priority ${target.priority.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Distance (light years)', color: '#ffffff' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: { display: true, text: 'Habitability Score', color: '#ffffff' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        this.updateTargetChart();
    }

    updateTargetChart() {
        const highPriority = [];
        const mediumPriority = [];
        const lowPriority = [];
        
        this.targets.forEach((target, index) => {
            const point = { 
                x: target.distance, 
                y: target.habitabilityScore,
                dataIndex: index
            };
            
            if (target.priority > 0.3) {
                highPriority.push(point);
            } else if (target.priority > 0.1) {
                mediumPriority.push(point);
            } else {
                lowPriority.push(point);
            }
        });
        
        this.chart.data.datasets[0].data = highPriority;
        this.chart.data.datasets[1].data = mediumPriority;
        this.chart.data.datasets[2].data = lowPriority;
        this.chart.update();
    }

    calculateOptimalStrategy() {
        const totalTime = this.resources.radioTime + this.resources.opticalTime + this.resources.technoTime;
        
        if (totalTime === 0) {
            this.detectionScore = 0;
            this.updateScoreDisplay();
            return;
        }
        
        // Calculate detection probability for current resource allocation
        let totalScore = 0;
        const topTargets = this.targets.slice(0, 100); // Focus on top 100 targets
        
        topTargets.forEach(target => {
            // Calculate time allocation per target
            const radioTimePerTarget = (this.resources.radioTime / topTargets.length);
            const opticalTimePerTarget = (this.resources.opticalTime / topTargets.length);
            const technoTimePerTarget = (this.resources.technoTime / topTargets.length);
            
            // Calculate detection probability for each method
            const radioProb = this.calculateDetectionProbability(
                target.radioDetectability, radioTimePerTarget, 'radio'
            );
            const opticalProb = this.calculateDetectionProbability(
                target.opticalDetectability, opticalTimePerTarget, 'optical'
            );
            const technoProb = this.calculateDetectionProbability(
                target.technosignatureProb, technoTimePerTarget, 'techno'
            );
            
            // Combined probability (assuming independent methods)
            const combinedProb = 1 - (1 - radioProb) * (1 - opticalProb) * (1 - technoProb);
            
            totalScore += combinedProb * target.priority;
        });
        
        this.detectionScore = totalScore;
        this.updateScoreDisplay();
    }

    calculateDetectionProbability(targetScore, timeAllocated, method) {
        if (timeAllocated <= 0) return 0;
        
        // Base detection probability based on target characteristics
        let baseProb = targetScore;
        
        // Time factor (diminishing returns)
        const timeFactor = 1 - Math.exp(-timeAllocated / 10);
        
        // Method-specific factors
        const methodFactors = {
            radio: 1.0,     // Radio SETI is most mature
            optical: 0.7,   // Optical SETI is newer but promising
            techno: 0.5     // Technosignatures are speculative
        };
        
        return baseProb * timeFactor * methodFactors[method];
    }

    updateScoreDisplay() {
        document.getElementById('setiScore').textContent = 
            `Detection Score: ${this.detectionScore.toFixed(2)}`;
    }

    runOptimization() {
        // Genetic algorithm for resource optimization
        const button = document.getElementById('optimizeStrategy');
        button.disabled = true;
        button.textContent = 'Optimizing...';
        
        setTimeout(() => {
            const optimized = this.geneticAlgorithmOptimization();
            
            // Update sliders with optimized values
            this.resources = optimized;
            document.getElementById('radioTime').value = optimized.radioTime;
            document.getElementById('radioTimeValue').textContent = optimized.radioTime;
            document.getElementById('opticalTime').value = optimized.opticalTime;
            document.getElementById('opticalTimeValue').textContent = optimized.opticalTime;
            document.getElementById('technoTime').value = optimized.technoTime;
            document.getElementById('technoTimeValue').textContent = optimized.technoTime;
            
            this.calculateOptimalStrategy();
            
            button.disabled = false;
            button.textContent = 'Optimize Strategy';
        }, 1000);
    }

    geneticAlgorithmOptimization() {
        const totalBudget = this.resources.radioTime + this.resources.opticalTime + this.resources.technoTime;
        const populationSize = 50;
        const generations = 100;
        const mutationRate = 0.1;
        
        // Initialize population
        let population = [];
        for (let i = 0; i < populationSize; i++) {
            population.push(this.generateRandomAllocation(totalBudget));
        }
        
        // Evolution loop
        for (let gen = 0; gen < generations; gen++) {
            // Evaluate fitness
            const fitness = population.map(individual => this.evaluateFitness(individual));
            
            // Selection and reproduction
            const newPopulation = [];
            
            // Keep best individuals (elitism)
            const sortedIndices = fitness.map((f, i) => ({fitness: f, index: i}))
                                        .sort((a, b) => b.fitness - a.fitness);
            
            for (let i = 0; i < populationSize * 0.2; i++) {
                newPopulation.push({...population[sortedIndices[i].index]});
            }
            
            // Generate offspring
            while (newPopulation.length < populationSize) {
                const parent1 = this.tournamentSelection(population, fitness);
                const parent2 = this.tournamentSelection(population, fitness);
                const offspring = this.crossover(parent1, parent2, totalBudget);
                
                if (Math.random() < mutationRate) {
                    this.mutate(offspring, totalBudget);
                }
                
                newPopulation.push(offspring);
            }
            
            population = newPopulation;
        }
        
        // Return best solution
        const finalFitness = population.map(individual => this.evaluateFitness(individual));
        const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
        
        return population[bestIndex];
    }

    generateRandomAllocation(totalBudget) {
        const r1 = Math.random();
        const r2 = Math.random();
        
        const radioTime = Math.floor(r1 * totalBudget);
        const opticalTime = Math.floor(r2 * (totalBudget - radioTime));
        const technoTime = totalBudget - radioTime - opticalTime;
        
        return { radioTime, opticalTime, technoTime };
    }

    evaluateFitness(allocation) {
        const originalResources = {...this.resources};
        this.resources = allocation;
        this.calculateOptimalStrategy();
        const fitness = this.detectionScore;
        this.resources = originalResources;
        return fitness;
    }

    tournamentSelection(population, fitness) {
        const tournamentSize = 5;
        let best = Math.floor(Math.random() * population.length);
        
        for (let i = 1; i < tournamentSize; i++) {
            const competitor = Math.floor(Math.random() * population.length);
            if (fitness[competitor] > fitness[best]) {
                best = competitor;
            }
        }
        
        return {...population[best]};
    }

    crossover(parent1, parent2, totalBudget) {
        // Uniform crossover with budget constraint
        const alpha = Math.random();
        
        let radioTime = Math.floor(alpha * parent1.radioTime + (1 - alpha) * parent2.radioTime);
        let opticalTime = Math.floor(alpha * parent1.opticalTime + (1 - alpha) * parent2.opticalTime);
        let technoTime = totalBudget - radioTime - opticalTime;
        
        // Ensure non-negative values
        if (technoTime < 0) {
            const excess = -technoTime;
            radioTime = Math.max(0, radioTime - excess / 2);
            opticalTime = Math.max(0, opticalTime - excess / 2);
            technoTime = totalBudget - radioTime - opticalTime;
        }
        
        return { radioTime, opticalTime, technoTime };
    }

    mutate(individual, totalBudget) {
        // Small random changes while maintaining budget
        const mutationStrength = 0.1;
        const change = Math.floor((Math.random() - 0.5) * totalBudget * mutationStrength);
        
        const methods = ['radioTime', 'opticalTime', 'technoTime'];
        const method1 = methods[Math.floor(Math.random() * methods.length)];
        let method2;
        do {
            method2 = methods[Math.floor(Math.random() * methods.length)];
        } while (method2 === method1);
        
        individual[method1] = Math.max(0, individual[method1] + change);
        individual[method2] = Math.max(0, individual[method2] - change);
    }

    // Export optimization results
    exportOptimizationResults() {
        return {
            currentAllocation: this.resources,
            detectionScore: this.detectionScore,
            topTargets: this.targets.slice(0, 20).map(target => ({
                name: target.name,
                distance: target.distance,
                priority: target.priority,
                habitabilityScore: target.habitabilityScore,
                radioDetectability: target.radioDetectability,
                opticalDetectability: target.opticalDetectability,
                technosignatureProb: target.technosignatureProb
            })),
            strategies: this.strategies
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.setiOptimizer = new SETIStrategyOptimizer();
});