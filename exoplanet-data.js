// Exoplanet data integration and analysis
class ExoplanetDataManager {
    constructor() {
        this.exoplanetDatabase = [];
        this.habitabilityMetrics = {
            temperatureRange: [273, 373], // Kelvin (liquid water range)
            radiusRange: [0.5, 2.5], // Earth radii
            massRange: [0.1, 10], // Earth masses
            stellarFluxRange: [0.25, 4.0] // Earth flux units
        };
    }

    // Simulate NASA Exoplanet Archive data
    generateRealisticExoplanetData() {
        const realExoplanets = [
            {
                name: "Proxima Centauri b",
                distance: 4.24,
                radius: 1.17,
                mass: 1.27,
                orbitalPeriod: 11.2,
                stellarFlux: 1.5,
                hostStarType: "M5.5V",
                discoveryMethod: "Radial Velocity",
                discoveryYear: 2016,
                temperature: 234
            },
            {
                name: "TRAPPIST-1e",
                distance: 40.7,
                radius: 0.92,
                mass: 0.77,
                orbitalPeriod: 6.1,
                stellarFlux: 0.66,
                hostStarType: "M8V",
                discoveryMethod: "Transit",
                discoveryYear: 2017,
                temperature: 251
            },
            {
                name: "Kepler-442b",
                distance: 1206,
                radius: 1.34,
                mass: 2.3,
                orbitalPeriod: 112.3,
                stellarFlux: 0.7,
                hostStarType: "K0V",
                discoveryMethod: "Transit",
                discoveryYear: 2015,
                temperature: 233
            },
            {
                name: "K2-18b",
                distance: 124,
                radius: 2.3,
                mass: 8.6,
                orbitalPeriod: 33.0,
                stellarFlux: 1.33,
                hostStarType: "M2.5V",
                discoveryMethod: "Transit",
                discoveryYear: 2015,
                temperature: 279
            },
            {
                name: "TOI-715b",
                distance: 137,
                radius: 1.55,
                mass: 3.02,
                orbitalPeriod: 19.3,
                stellarFlux: 1.37,
                hostStarType: "M4V",
                discoveryMethod: "Transit",
                discoveryYear: 2023,
                temperature: 280
            },
            {
                name: "LHS 1140b",
                distance: 48.6,
                radius: 1.73,
                mass: 6.6,
                orbitalPeriod: 24.7,
                stellarFlux: 0.43,
                hostStarType: "M4.5V",
                discoveryMethod: "Transit",
                discoveryYear: 2017,
                temperature: 230
            }
        ];

        // Add more simulated planets based on statistical distributions
        const additionalPlanets = this.generateStatisticalPlanets(44);
        
        return [...realExoplanets, ...additionalPlanets];
    }

    generateStatisticalPlanets(count) {
        const planets = [];
        const starTypes = ["M0V", "M1V", "M2V", "M3V", "M4V", "M5V", "K0V", "K1V", "K2V", "G0V", "G1V", "G2V"];
        const discoveryMethods = ["Transit", "Radial Velocity", "Direct Imaging", "Microlensing"];

        for (let i = 0; i < count; i++) {
            const distance = this.generateLogNormal(50, 2); // Most within ~200 ly
            const radius = this.generateLogNormal(1.5, 1.5);
            const mass = Math.pow(radius, 2.06); // Mass-radius relation
            const stellarFlux = this.generateLogNormal(1.0, 2);
            const temperature = Math.pow(stellarFlux, 0.25) * 255; // Simplified temperature calculation

            planets.push({
                name: `Simulated-${i + 1}`,
                distance: Math.min(distance, 2000),
                radius: Math.min(radius, 20),
                mass: Math.min(mass, 100),
                orbitalPeriod: this.generateLogNormal(30, 3),
                stellarFlux: stellarFlux,
                hostStarType: starTypes[Math.floor(Math.random() * starTypes.length)],
                discoveryMethod: discoveryMethods[Math.floor(Math.random() * discoveryMethods.length)],
                discoveryYear: 2009 + Math.floor(Math.random() * 15),
                temperature: temperature
            });
        }

        return planets;
    }

    generateLogNormal(median, factor) {
        const normal = this.boxMullerTransform();
        const logMedian = Math.log(median);
        const logSigma = Math.log(factor);
        return Math.exp(logMedian + logSigma * normal);
    }

    boxMullerTransform() {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    calculateHabitabilityScore(planet) {
        let score = 0;
        let maxScore = 0;

        // Temperature score (30% weight)
        const tempWeight = 0.3;
        if (planet.temperature >= this.habitabilityMetrics.temperatureRange[0] && 
            planet.temperature <= this.habitabilityMetrics.temperatureRange[1]) {
            score += tempWeight;
        } else {
            // Partial score for near-habitable temperatures
            const tempDiff = Math.min(
                Math.abs(planet.temperature - this.habitabilityMetrics.temperatureRange[0]),
                Math.abs(planet.temperature - this.habitabilityMetrics.temperatureRange[1])
            );
            score += tempWeight * Math.max(0, 1 - tempDiff / 100);
        }
        maxScore += tempWeight;

        // Radius score (25% weight)
        const radiusWeight = 0.25;
        if (planet.radius >= this.habitabilityMetrics.radiusRange[0] && 
            planet.radius <= this.habitabilityMetrics.radiusRange[1]) {
            score += radiusWeight;
        } else {
            const radiusDiff = Math.min(
                Math.abs(planet.radius - this.habitabilityMetrics.radiusRange[0]),
                Math.abs(planet.radius - this.habitabilityMetrics.radiusRange[1])
            );
            score += radiusWeight * Math.max(0, 1 - radiusDiff / 2);
        }
        maxScore += radiusWeight;

        // Stellar flux score (25% weight)
        const fluxWeight = 0.25;
        if (planet.stellarFlux >= this.habitabilityMetrics.stellarFluxRange[0] && 
            planet.stellarFlux <= this.habitabilityMetrics.stellarFluxRange[1]) {
            score += fluxWeight;
        } else {
            const fluxDiff = Math.min(
                Math.abs(planet.stellarFlux - this.habitabilityMetrics.stellarFluxRange[0]),
                Math.abs(planet.stellarFlux - this.habitabilityMetrics.stellarFluxRange[1])
            );
            score += fluxWeight * Math.max(0, 1 - fluxDiff / 3);
        }
        maxScore += fluxWeight;

        // Distance bonus (20% weight) - closer planets are easier to study
        const distanceWeight = 0.2;
        if (planet.distance < 50) {
            score += distanceWeight;
        } else if (planet.distance < 200) {
            score += distanceWeight * (1 - (planet.distance - 50) / 150);
        }
        maxScore += distanceWeight;

        return score / maxScore;
    }

    getBiosignatureTargets() {
        const planets = this.generateRealisticExoplanetData();
        
        return planets
            .map(planet => ({
                ...planet,
                habitabilityScore: this.calculateHabitabilityScore(planet),
                jwstObservable: planet.distance < 300 && planet.radius > 1.0,
                biosignaturePotential: this.calculateBiosignaturePotential(planet)
            }))
            .filter(planet => planet.habitabilityScore > 0.3)
            .sort((a, b) => b.habitabilityScore - a.habitabilityScore);
    }

    calculateBiosignaturePotential(planet) {
        // Simplified biosignature detection probability
        let potential = 0;

        // Atmospheric retention (larger planets retain atmospheres better)
        if (planet.radius > 0.8 && planet.radius < 3.0) {
            potential += 0.3;
        }

        // Temperature for liquid water
        if (planet.temperature > 250 && planet.temperature < 350) {
            potential += 0.3;
        }

        // Host star stability (M dwarfs have flares, but are long-lived)
        if (planet.hostStarType.startsWith('K') || planet.hostStarType.startsWith('G')) {
            potential += 0.2;
        } else if (planet.hostStarType.startsWith('M')) {
            potential += 0.1;
        }

        // Observational feasibility
        if (planet.distance < 100) {
            potential += 0.2;
        } else if (planet.distance < 300) {
            potential += 0.1;
        }

        return Math.min(potential, 1.0);
    }

    getExoplanetStatistics() {
        const planets = this.generateRealisticExoplanetData();
        
        return {
            totalPlanets: planets.length,
            habitablePlanets: planets.filter(p => this.calculateHabitabilityScore(p) > 0.5).length,
            nearbyPlanets: planets.filter(p => p.distance < 100).length,
            transitPlanets: planets.filter(p => p.discoveryMethod === "Transit").length,
            averageDistance: planets.reduce((sum, p) => sum + p.distance, 0) / planets.length,
            averageRadius: planets.reduce((sum, p) => sum + p.radius, 0) / planets.length
        };
    }
}

// Export for use in main calculator
window.ExoplanetDataManager = ExoplanetDataManager;