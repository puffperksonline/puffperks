import React from 'react';
import { motion } from 'framer-motion';

const VideoShowcaseSection = () => {
    return (
        <div className="relative z-10 w-full -mt-16 md:-mt-24">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
            >
                <div className="relative shadow-2xl">
                    <video
                        src="https://puff-perks.b-cdn.net/Puff%20Perks%20Website%204k.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    ></video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default VideoShowcaseSection;