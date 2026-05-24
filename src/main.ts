import './style.css';



// 1. Grab all our DOM elements and cast them strictly
const landingScreen = document.getElementById('landingScreen') as HTMLDivElement | null;
const videoContainer = document.getElementById('videoContainer') as HTMLDivElement | null;
const introVideo = document.getElementById('introVideo') as HTMLVideoElement | null;
const skipBtn = document.getElementById('skipBtn') as HTMLButtonElement | null;
const mainContent = document.getElementById('mainContent') as HTMLElement | null;
const laceContainer = document.getElementById('laceContainer') as HTMLDivElement | null;
const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement | null;


if (laceContainer) {
    fetch('/img/Cure arcana shadow.svg')
        .then((response: Response) => {
            if (!response.ok) throw new Error("Failed to load layout asset");
            return response.text(); // Converts the file stream into a raw text string
        })
        .then((svgText: string) => {
            // Inject the vector string into your container layer
            laceContainer.innerHTML = svgText;
        })
        .catch((error) => console.error("Asset Loader Error:", error));
}


// 2. Define the State Change to the Main Website
function enterMainSite(): void {


    const audio_path = `${import.meta.env.BASE_URL}audio/ed.mp3`;
    const revealSound = new Audio(audio_path);
    revealSound.volume = 0.4; // Comfortably balanced audio layout boundary
    
    revealSound.loop = true;
    
    revealSound.play().catch((error) => {
        // Keeps the console clean if a browser blocks audio processing flags
        console.warn("Audio playback engine blocked or interrupted:", error);
    });
    if (videoContainer && mainContent) {
        // Hide the video layer, show the main website
        videoContainer.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }
    
    // Stop the video from eating up CPU memory in the background
    if (introVideo) {
        introVideo.pause();
    }

}

// 3. Handle State A -> State B (Clicking the PNG to start video)
if (landingScreen && videoContainer && introVideo) {
    landingScreen.addEventListener('click', (): void => {
        
        // Trigger a CSS fade out effect
        landingScreen.style.opacity = '0';
        
        // Wait 700ms for the fade to finish, then destroy the landing screen and play video
        setTimeout((): void => {
            landingScreen.classList.add('hidden');
            videoContainer.classList.remove('hidden');
            
            // Play the video. The browser allows this because it was triggered by a user click!
            introVideo.play().catch(e => console.error("Video playback failed:", e));
        }, 700); 
    });
} else {
    console.error("Critical Binding Error: Missing elements for the initial sequence.");
}

// 4. Handle State B -> State C (Skipping or finishing the video)
if (skipBtn && introVideo) {
    // If user clicks skip
    skipBtn.addEventListener('click', enterMainSite);
    
    // If the video plays all the way to the end naturally
    introVideo.addEventListener('ended', enterMainSite);
}


if (canvas) {
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        const resizeCanvas = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        interface Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            alpha: number;
            fadeSpeed: number;
        }

        const particleArray: Particle[] = [];
        
        // Luxury Game Palette: Vibrant Gold, Metallic Gold, Deep Cosmic Purple, Soft Lavender
        const colors = [
            'rgba(255, 215, 0, ',   
            'rgba(212, 175, 55, ',  
            'rgba(147, 51, 234, ',  
            'rgba(192, 132, 252, '  
        ];

        const createParticle = (xPos?: number, yPos?: number): Particle => {
            return {
                x: xPos ?? Math.random() * canvas.width,
                y: yPos ?? Math.random() * canvas.height,
                size: Math.random() * 2.5 + 0.5, 
                speedX: (Math.random() - 0.5) * 0.3, 
                speedY: -Math.random() * 0.6 - 0.1,   // Drift upwards slowly
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.6 + 0.2,
                fadeSpeed: Math.random() * 0.002 + 0.0005
            };
        };

        // Pre-populate the background field
        for (let i = 0; i < 60; i++) {
            particleArray.push(createParticle());
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Continuously spawn replacement particles from below the screen
            if (particleArray.length < 80 && Math.random() < 0.2) {
                particleArray.push(createParticle(Math.random() * canvas.width, canvas.height + 5));
            }

            for (let i = particleArray.length - 1; i >= 0; i--) {
                const p = particleArray[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.alpha -= p.fadeSpeed;

                if (p.alpha <= 0 || p.y < -10) {
                    particleArray.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                
                // Subtle neon bloom glow around particles
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color + '1)';
                
                ctx.fill();
            }

            requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }
}