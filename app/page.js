"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Twitter,
  ArrowRight,
  DollarSign,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [floatingNumbers, setFloatingNumbers] = useState([]);

  useEffect(() => {
    const generateFloatingNumbers = () => {
      const numbers = Array.from({ length: 20 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        value: Math.floor(Math.random() * 1000),
        duration: Math.random() * 10 + 5,
        delay: Math.random() * 5,
      }));
      setFloatingNumbers(numbers);
    };

    generateFloatingNumbers();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-background to-accent"
    >
      {/* Hero Section */}
      <motion.div
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{ y, opacity }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 flex items-center justify-center opacity-5"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.2 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Twitter className="w-[800px] h-[800px]" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center flex flex-col justify-center items-center"
          >
            <h1 className="text-6xl font-bold mb-6">
              Invest in
              <motion.span
                className="text-primary mx-2 inline-block"
                animate={{
                  y: [0, -10, 0, 10, 0],
                  color: ["#00ff00", "#ff0000", "#00ff00"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Viral
              </motion.span>
              Tweets
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Put your money where your mouth is when you say "investing at 5
              likes".
            </p>
            <Link href={"/sign-up"}>
              <button className="mr-4 p-4 text-white bg-black flex items-center gap-2 rounded-lg justify-center w-fit">
                Start now <ArrowRight className="ml-2" />
              </button>
            </Link>
          </motion.div>

          {/* /* Floating Numbers */}
          <motion.div className="absolute inset-0 pointer-events-none">
            {floatingNumbers.map((num, i) => (
              <motion.div
                key={i}
                className="absolute text-primary/20 font-mono"
                initial={{ x: num.x, y: num.y, opacity: 0 }}
                animate={{
                  y: -1000,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: num.duration,
                  repeat: Infinity,
                  delay: num.delay,
                }}
              >
                <img
                  src="/like.svg"
                  alt="like"
                  className="inline-block w-4 h-4 mr-1"
                  style={{ fill: "#f91880" }}
                />
                {num.value}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20 bg-background/50 backdrop-blur-sm">
        {/* <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg bg-card"
            >
              <DollarSign className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Real-Time Trading</h3>
              <p className="text-muted-foreground">
                Buy and sell tweet shares instantly with real-time market data and analytics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-lg bg-card"
            >
              <Trophy className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Compete & Win</h3>
              <p className="text-muted-foreground">
                Join daily competitions and climb the leaderboard with your trading skills.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-lg bg-card"
            >
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Social Trading</h3>
              <p className="text-muted-foreground">
                Follow top traders and copy their successful strategies.
              </p>
            </motion.div>
          </div>
        </div> */}
      </div>

      {/* Live Market Section */}
      <div className="py-20">
        {/* <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="p-4 rounded-lg bg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Twitter className="w-8 h-8" />
                    <div>
                      <p className="font-medium">@trending_tweet_{i + 1}</p>
                      <p className="text-sm text-muted-foreground">Volume: 23.4K</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        color: ["#00ff00", "#ff0000"],
                        y: [0, -2, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-lg font-bold"
                    >
                      ${(Math.random() * 100).toFixed(2)}
                    </motion.div>
                    {Math.random() > 0.5 ? (
                      <TrendingUp className="text-green-500" />
                    ) : (
                      <TrendingDown className="text-red-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative h-[400px] rounded-lg bg-card p-6">
              <h3 className="text-2xl font-bold mb-4">Market Activity</h3>
              <div className="absolute inset-0 mt-16">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bottom-0 w-full h-1/2 border-t border-primary/20"
                    style={{ bottom: `${i * 20}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                  />
                ))}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent"
                  animate={{
                    height: ["40%", "60%", "40%"]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
        </div> */}
      </div>
    </div>
  );
}
