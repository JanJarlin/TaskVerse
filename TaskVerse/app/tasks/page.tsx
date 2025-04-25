"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClientSupabaseClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"
import { UserAvatar } from "@/components/user-avatar"
import type { User } from "@supabase/supabase-js"

interface Task {
  id: string
  text: string
  completed: boolean
  user_id: string
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const supabase = createClientSupabaseClient()

  // Obtener el usuario actual y sus tareas
  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        // Obtener sesión actual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session?.user) {
          // Si no hay sesión, redirigir al login
          window.location.href = "/login"
          return
        }

        setUser(session.user)

        // Obtener tareas del usuario
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false })

        if (tasksError) throw tasksError

        setTasks(tasksData || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load tasks.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndTasks()

    // Configurar la suscripción solo si tenemos un usuario
    const tasksSubscription = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          // Actualizar la lista de tareas cuando hay cambios
          fetchUserAndTasks()
        },
      )
      .subscribe()

    return () => {
      // Limpiar suscripción al desmontar
      supabase.removeChannel(tasksSubscription)
    }
  }, [supabase])

  const handleAddTask = async () => {
    if (newTaskText.trim() === "") return

    setIsAddingTask(true)

    try {
      const newTask = {
        user_id: user?.id,
        text: newTaskText,
        completed: false,
      }

      const { data, error } = await supabase.from("tasks").insert(newTask).select()

      if (error) throw error

      // Actualizar la lista de tareas localmente para una respuesta más rápida
      if (data && data.length > 0) {
        setTasks([data[0], ...tasks])
      }

      setNewTaskText("")

      // Mostrar mensaje de éxito
      toast({
        title: "Success",
        description: "Task added successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add task.",
        variant: "destructive",
      })
    } finally {
      setIsAddingTask(false)
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      // Actualizar la UI inmediatamente para una respuesta más rápida
      setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !completed } : task)))

      const { error } = await supabase.from("tasks").update({ completed: !completed }).eq("id", id)

      if (error) {
        // Si hay un error, revertir el cambio
        setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: completed } : task)))
        throw error
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      // Guardar las tareas actuales para poder revertir si hay un error
      const previousTasks = [...tasks]

      // Actualizar la UI inmediatamente para una respuesta más rápida
      setTasks(tasks.filter((task) => task.id !== id))

      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) {
        // Si hay un error, revertir el cambio
        setTasks(previousTasks)
        throw error
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task.",
        variant: "destructive",
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  return (
    <AuthGuard>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-background py-4"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Botón de volver a la página principal en la parte superior izquierda */}
        <Header />

        {/* Avatar del usuario en la parte superior derecha */}
        <div className="absolute top-4 right-4">
          <UserAvatar user={user} />
        </div>

        <motion.h1 className="text-7xl font-bold tracking-tight mb-4 text-foreground text-center mt-8">
          Task<span className="text-primary">V</span>erse
        </motion.h1>

        <motion.div className="w-full max-w-md px-4 mt-8" variants={itemVariants}>
          <Card>
            <CardHeader className="text-center">
              <h2 className="text-3xl font-semibold">Add Task</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="New task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTask()
                  }
                }}
                disabled={isAddingTask}
              />
              <Button onClick={handleAddTask} size="sm" disabled={isAddingTask}>
                {isAddingTask ? <Loading /> : "Add Task"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="w-full max-w-md px-4 mt-4" variants={itemVariants}>
          <Card className="h-full">
            <CardContent className="p-0">
              <ScrollArea className="rounded-md h-[300px]">
                {tasks.length === 0 ? (
                  <div className="p-4 text-muted-foreground text-sm text-center">No tasks yet.</div>
                ) : (
                  <ul className="divide-y divide-border">
                    <AnimatePresence initial={false}>
                      {tasks.map((task) => (
                        <motion.li
                          key={task.id}
                          className="flex items-center justify-between p-3"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={task.id}
                              checked={task.completed}
                              onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
                              className="w-5 h-5"
                            />
                            <label
                              htmlFor={task.id}
                              className={`text-sm leading-none peer-disabled:cursor-not-allowed ${
                                task.completed ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {task.text}
                            </label>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AuthGuard>
  )
}

export default TasksPage

// Componente de carga
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
