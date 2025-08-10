import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronsRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
const faqs = [{
  question: "My customers keep going to other vape shops. How does Puff Perks help with retention?",
  answer: "Puff Perks creates a 'sticky' experience. By offering digital stamps and tangible rewards, you give customers a powerful reason to choose your store over competitors. Every purchase brings them closer to a reward, making them less likely to shop elsewhere. It turns casual buyers into loyal regulars."
}, {
  question: "I'm not a tech person. Is this system complicated to set up and manage?",
  answer: "Not at all! We designed Puff Perks for busy store owners, not IT experts. Setup takes minutes: you sign up, and we instantly generate your unique QR code. Your dashboard is incredibly intuitive—adding stamps is a single click. It's simpler and faster than fumbling with paper punch cards."
}, {
  question: "How is this better than the paper punch cards I'm using now?",
  answer: "Digital cards solve all the problems of paper. They can't be lost, forgotten, or run through the wash. Plus, Puff Perks gives you valuable data. You'll see who your top customers are and how often they visit—insights you can't get from a piece of cardboard. It's a professional upgrade that customers love."
}, {
  question: "Will my customers actually use this? Do they need to download an app?",
  answer: "Absolutely, and that's the best part: **no app download is required!** Customers just scan a QR code with their phone's camera. The loyalty card opens instantly in their web browser. They can even save it to their phone's home screen for one-tap access, just like a real app."
}, {
  question: "Is it really free to start? What's the catch?",
  answer: "There's no catch. You get a 7-day, full-featured free trial to see the value for yourself. We don't even ask for your credit card details to sign up. We're confident that once you see how Puff Perks boosts your customer loyalty, you'll find our affordable plans to be a no-brainer investment."
}, {
  question: "How does the referral program work to get me new customers?",
  answer: "It turns your best customers into your sales team! When a customer refers a friend, both of them get bonus stamps after the new friend makes their first purchase. It's a powerful, automated way to drive word-of-mouth marketing and grow your customer base without any extra effort."
}];
const FaqItem = ({
  q,
  a
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return <motion.div layout className="border-b border-gray-700/50" initial={{
    borderRadius: 12
  }}>
      <motion.header initial={false} onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center p-6 cursor-pointer">
        <h3 className="text-lg font-semibold text-white">{q}</h3>
        <motion.div animate={{
        rotate: isOpen ? 180 : 0
      }} transition={{
        duration: 0.2
      }}>
          <ChevronDown className="w-6 h-6 text-purple-400" />
        </motion.div>
      </motion.header>
      <motion.div initial={false} animate={{
      height: isOpen ? 'auto' : 0,
      opacity: isOpen ? 1 : 0,
      paddingBottom: isOpen ? '24px' : '0px'
    }} className="overflow-hidden">
        <p className="px-6 text-gray-300">{a}</p>
      </motion.div>
    </motion.div>;
};
const FaqPage = () => {
  return <>
      <Helmet>
        <title>FAQs - Puff Perks</title>
        <meta name="description" content="Frequently asked questions about Puff Perks. Learn how our digital loyalty program helps vape stores increase customer retention and grow their business." />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24">
        <div className="container mx-auto px-4 py-16">
          <motion.div initial={{
          opacity: 0,
          y: -30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7
        }} className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">You may have some questions, we definitely have the answers!</p>
          </motion.div>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.3,
          duration: 0.7
        }} className="max-w-4xl mx-auto bg-gray-800/40 rounded-xl shadow-2xl backdrop-blur-md">
            {faqs.map((faq, index) => <FaqItem key={index} q={faq.question} a={faq.answer} />)}
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6,
          duration: 0.7
        }} className="text-center mt-20">
            <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-lg text-gray-400 mb-8">
              We're here to help you succeed. Get started today and see the difference for yourself.
            </p>
            <Link to="/store/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105">
                <Rocket className="w-5 h-5 mr-2" />
                Start Your Free Trial
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>;
};
export default FaqPage;