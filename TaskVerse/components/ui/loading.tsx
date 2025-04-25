"use client"

import { motion } from "framer-motion"

const Loading = () => {
  const circleVariants = {
    start: {
      opacity: 0,
      scale: 0.5,
      y: -20,
    },
    end: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    },
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-4 h-4 rounded-full bg-primary"
          variants={circleVariants}
          initial="start"
          animate="end"
          transition={{ delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export default Loading
