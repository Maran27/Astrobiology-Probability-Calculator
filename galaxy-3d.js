class Galaxy3DVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.galaxyGroup = null;
        this.civilizations = [];
        this.communicationSpheres = [];
        this.animationId = null;
        this.isAnimating = false;
        this.galaxyTime = 0;
        this.timeScale = 1000; // years per frame
        
        this.initializeScene();
        this.createGalaxyStructure();
        this.generateCivilizations();
        this.initializeEventListeners();
        this.animate();
    }

    initializeScene() {
        const container = document.getElementById('galaxyContainer');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            200000
        );
        this.camera.position.set(0, 30000, 50000);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Controls setup (if OrbitControls is available)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100000);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createGalaxyStructure() {
        this.galaxyGroup = new THREE.Group();
        
        // Create spiral arms
        this.createSpiralArms();
        
        // Create galactic bulge
        this.createGalacticBulge();
        
        // Create halo
        this.createGalacticHalo();
        
        // Add coordinate system
        this.createCoordinateSystem();
        
        this.scene.add(this.galaxyGroup);
    }

    createSpiralArms() {
        const armCount = 4;
        const starsPerArm = 2000;
        
        for (let arm = 0; arm < armCount; arm++) {
            const armGeometry = new THREE.BufferGeometry();
            const positions = [];
            const colors = [];
            
            for (let i = 0; i < starsPerArm; i++) {
                // Logarithmic spiral
                const t = (i / starsPerArm) * Math.PI * 4;
                const armAngle = (arm / armCount) * Math.PI * 2;
                const radius = 5000 + t * 2000;
                
                const x = radius * Math.cos(t + armAngle) + (Math.random() - 0.5) * 2000;
                const z = radius * Math.sin(t + armAngle) + (Math.random() - 0.5) * 2000;
                const y = (Math.random() - 0.5) * 1000;
                
                positions.push(x, y, z);
                
                // Color based on stellar type
                const temp = Math.random();
                if (temp < 0.1) {
                    colors.push(0.6, 0.8, 1.0); // Blue giants
                } else if (temp < 0.3) {
                    colors.push(1.0, 1.0, 0.9); // White stars
                } else if (temp < 0.6) {
                    colors.push(1.0, 0.9, 0.7); // Yellow stars
                } else {
                    colors.push(1.0, 0.6, 0.4); // Red dwarfs
                }
            }
            
            armGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            armGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            
            const armMaterial = new THREE.PointsMaterial({
                size: 100,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });
            
            const armPoints = new THREE.Points(armGeometry, armMaterial);
            this.galaxyGroup.add(armPoints);
        }
    }

    createGalacticBulge() {
        const bulgeGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const starCount = 1000;
        
        for (let i = 0; i < starCount; i++) {
            // Spherical distribution with higher density toward center
            const radius = Math.pow(Math.random(), 0.3) * 8000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi) * 0.3; // Flatten the bulge
            const z = radius * Math.sin(phi) * Math.sin(theta);
            
            positions.push(x, y, z);
            
            // Bulge stars are typically older, redder
            colors.push(1.0, 0.7, 0.4);
        }
        
        bulgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        bulgeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const bulgeMaterial = new THREE.PointsMaterial({
            size: 150,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });
        
        const bulgePoints = new THREE.Points(bulgeGeometry, bulgeMaterial);
        this.galaxyGroup.add(bulgePoints);
    }

    createGalacticHalo() {
        const haloGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const starCount = 500;
        
        for (let i = 0; i < starCount; i++) {
            // Sparse spherical halo
            const radius = 20000 + Math.random() * 30000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            
            positions.push(x, y, z);
            
            // Halo stars are old, metal-poor
            colors.push(0.8, 0.8, 1.0);
        }
        
        haloGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        haloGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const haloMaterial = new THREE.PointsMaterial({
            size: 80,
            vertexColors: true,
            transparent: true,
            opacity: 0.3
        });
        
        const haloPoints = new THREE.Points(haloGeometry, haloMaterial);
        this.galaxyGroup.add(haloPoints);
    }

    createCoordinateSystem() {
        // Add subtle coordinate grid
        const gridHelper = new THREE.GridHelper(100000, 20, 0x444444, 0x222222);
        gridHelper.position.y = -500;
        this.galaxyGroup.add(gridHelper);
        
        // Add axis labels
        const loader = new THREE.FontLoader();
        // Note: In a real implementation, you'd load a font file
        // For now, we'll use simple geometry for markers
        
        // Galactic center marker
        const centerGeometry = new THREE.SphereGeometry(500, 16, 16);
        const centerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        const centerMarker = new THREE.Mesh(centerGeometry, centerMaterial);
        this.galaxyGroup.add(centerMarker);
    }

    generateCivilizations() {
        // Get current Drake equation parameters
        const calculator = window.astrobiologyCalculator;
        let N = 10; // Default value
        
        if (calculator) {
            N = calculator.calculateDrakeEquation();
        }
        
        // Clear existing civilizations
        this.civilizations.forEach(civ => {
            this.galaxyGroup.remove(civ.mesh);
        });
        this.civilizations = [];
        
        // Generate civilizations based on Drake equation result
        const civCount = Math.max(1, Math.min(N, 1000)); // Cap at 1000 for performance
        
        for (let i = 0; i < civCount; i++) {
            const civilization = this.createCivilization();
            this.civilizations.push(civilization);
            this.galaxyGroup.add(civilization.mesh);
        }
        
        this.updateGalaxyInfo();
    }

    createCivilization() {
        // Position civilizations preferentially in habitable zones
        const galacticRadius = this.generateHabitableZoneRadius();
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 2000;
        
        const x = galacticRadius * Math.cos(angle);
        const z = galacticRadius * Math.sin(angle);
        const y = height;
        
        // Create civilization marker
        const geometry = new THREE.SphereGeometry(200, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: this.getCivilizationColor(),
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        
        // Add pulsing animation
        const originalScale = mesh.scale.clone();
        
        return {
            mesh: mesh,
            position: { x, y, z },
            birthTime: this.galaxyTime + Math.random() * 100000,
            lifetime: 1000 + Math.random() * 99000, // 1K to 100K years
            communicationRange: 50 + Math.random() * 200, // light years
            originalScale: originalScale,
            isActive: true
        };
    }

    generateHabitableZoneRadius() {
        // Galactic habitable zone: roughly 13,000 to 33,000 light years from center
        const minRadius = 13000;
        const maxRadius = 33000;
        
        // Use normal distribution centered in the habitable zone
        const mean = (minRadius + maxRadius) / 2;
        const std = (maxRadius - minRadius) / 6;
        
        let radius;
        do {
            radius = this.normalRandom() * std + mean;
        } while (radius < minRadius || radius > maxRadius);
        
        return radius;
    }

    normalRandom() {
        // Box-Muller transformation for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    getCivilizationColor() {
        const colors = [
            0x00ff00, // Green - Type I civilization
            0x0080ff, // Blue - Type II civilization  
            0xff0080, // Magenta - Type III civilization
            0xffff00, // Yellow - Unknown type
            0xff8000  // Orange - Extinct/dormant
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }

    initializeEventListeners() {
        document.getElementById('animateGalaxy').addEventListener('click', () => {
            this.toggleAnimation();
        });
        
        document.getElementById('showCommunication').addEventListener('click', () => {
            this.toggleCommunicationSpheres();
        });
        
        document.getElementById('resetGalaxyView').addEventListener('click', () => {
            this.resetView();
        });
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const button = document.getElementById('animateGalaxy');
        button.textContent = this.isAnimating ? 'Pause Animation' : 'Animate Galaxy';
    }

    toggleCommunicationSpheres() {
        if (this.communicationSpheres.length > 0) {
            // Remove existing spheres
            this.communicationSpheres.forEach(sphere => {
                this.galaxyGroup.remove(sphere);
            });
            this.communicationSpheres = [];
        } else {
            // Create communication spheres
            this.createCommunicationSpheres();
        }
    }

    createCommunicationSpheres() {
        this.civilizations.forEach(civ => {
            if (!civ.isActive) return;
            
            const sphereGeometry = new THREE.SphereGeometry(civ.communicationRange * 50, 16, 16);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.1,
                wireframe: true
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(civ.mesh.position);
            
            this.galaxyGroup.add(sphere);
            this.communicationSpheres.push(sphere);
        });
    }

    resetView() {
        this.camera.position.set(0, 30000, 50000);
        this.camera.lookAt(0, 0, 0);
        
        if (this.controls) {
            this.controls.reset();
        }
        
        this.galaxyTime = 0;
        this.updateGalaxyInfo();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.isAnimating) {
            this.galaxyTime += this.timeScale;
            this.updateCivilizations();
            this.updateGalaxyRotation();
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Animate civilization pulsing
        this.animateCivilizations();
        
        this.renderer.render(this.scene, this.camera);
    }

    updateCivilizations() {
        let activeCivs = 0;
        
        this.civilizations.forEach(civ => {
            const age = this.galaxyTime - civ.birthTime;
            
            if (age > 0 && age < civ.lifetime) {
                civ.isActive = true;
                civ.mesh.visible = true;
                activeCivs++;
            } else {
                civ.isActive = false;
                civ.mesh.visible = false;
            }
        });
        
        this.updateGalaxyInfo();
    }

    updateGalaxyRotation() {
        // Rotate galaxy slowly (differential rotation)
        this.galaxyGroup.rotation.y += 0.0001;
    }

    animateCivilizations() {
        const time = Date.now() * 0.001;
        
        this.civilizations.forEach(civ => {
            if (civ.isActive) {
                // Pulsing effect
                const pulse = 1 + 0.2 * Math.sin(time * 2 + civ.position.x * 0.001);
                civ.mesh.scale.copy(civ.originalScale).multiplyScalar(pulse);
            }
        });
    }

    updateGalaxyInfo() {
        document.getElementById('galaxyTime').textContent = 
            Math.round(this.galaxyTime).toLocaleString();
        
        const activeCivs = this.civilizations.filter(civ => civ.isActive).length;
        document.getElementById('activeCivs').textContent = activeCivs;
    }

    onWindowResize() {
        const container = document.getElementById('galaxyContainer');
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // Public methods for integration with main calculator
    updateFromDrakeEquation(N) {
        this.generateCivilizations();
    }

    exportGalaxyData() {
        return {
            civilizations: this.civilizations.map(civ => ({
                position: civ.position,
                isActive: civ.isActive,
                birthTime: civ.birthTime,
                lifetime: civ.lifetime,
                communicationRange: civ.communicationRange
            })),
            galaxyTime: this.galaxyTime,
            totalCivilizations: this.civilizations.length,
            activeCivilizations: this.civilizations.filter(civ => civ.isActive).length
        };
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const container = document.getElementById('galaxyContainer');
        if (container && this.renderer.domElement) {
            container.removeChild(this.renderer.domElement);
        }
        
        this.renderer.dispose();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Three.js to load
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            window.galaxy3DVisualizer = new Galaxy3DVisualizer();
        } else {
            console.warn('Three.js not loaded, 3D galaxy visualization disabled');
        }
    }, 1000);
});