"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"

const LandingPage = () => {
  const [motionReady, setMotionReady] = useState(false)

  useEffect(() => {
    const loadFramerMotion = async () => {
      setMotionReady(true)
    }

    loadFramerMotion()
  }, [])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        className="flex flex-col items-center justify-center h-screen absolute inset-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-9xl font-bold tracking-tight mb-4 text-foreground text-center"
          variants={itemVariants}
        >
          Task<span className="text-primary">V</span>erse
        </motion.h1>
        <motion.p className="text-3xl text-muted-foreground mb-8 text-center" variants={itemVariants}>
          Your gateway to organized productivity
        </motion.p>
        <motion.div className="flex space-x-4" variants={itemVariants}>
          <Link href="/login">
            <Button variant="outline" className="px-20 py-7 text-lg">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="px-20 py-7 text-lg">Register</Button>
          </Link>
        </motion.div>
      </motion.div>
      <motion.footer className="mt-auto text-center text-muted-foreground text-sm" variants={itemVariants}>
        TaskVerse is a modern web application designed to help you organize your tasks and boost your productivity with
        a futuristic and user-friendly interface.
      </motion.footer>
    </div>
  )
}

export default LandingPage
