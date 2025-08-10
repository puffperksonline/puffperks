import React, { useRef, useEffect } from 'react';

const AnimatedBackground = ({ particleColor = 'rgba(192, 132, 252, 0.5)', lineColor = 'rgba(192, 132, 252, 0.2)' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        const particleCount = 50;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const createParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 1,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
            });

            ctx.beginPath();
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < 120) {
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 1 - dist / 120;
                        ctx.stroke();
                    }
                }
            }
            

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        createParticles();
        animate();

        const observer = new ResizeObserver(() => {
            resizeCanvas();
            createParticles();
        });
        observer.observe(canvas);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            observer.disconnect();
        };
    }, [particleColor, lineColor]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />;
};

export default AnimatedBackground;