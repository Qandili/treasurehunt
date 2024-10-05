import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Camera } from "lucide-react"
import { useZxing } from "react-zxing"
import { InstagramEmbed } from 'react-social-media-embed';
import Cookies from 'js-cookie'

interface Task {
  id: number
  title: string
  description: string
  score: number
  completed: boolean
  type: "text" | "image" | "social" | "scan"
}

const initialTasks: Task[] = [
  { id: 1, title: "Follow LinkedIn", description: "Follow LinkedIn accounts", score: 10, completed: false, type: "social" },
  { id: 2, title: "Follow Instagram", description: "Follow Instagram accounts", score: 10, completed: false, type: "social" },
  { id: 3, title: "Take a selfie", description: "Take a selfie with X person and the X person verifies the selfie by entering a code", score: 15, completed: false, type: "image" },
  { id: 4, title: "Scan code", description: "Scan code bar only when nad session finishes (chakib and marouanXbadr)", score: 10, completed: false, type: "scan" },
  { id: 5, title: "Salesforce character", description: "Who's the Salesforce character (genie, ....)", score: 10, completed: false, type: "text" },
  { id: 6, title: "Answer question", description: "Answer a question in the stand (the one in the stand validates with a code)", score: 15, completed: false, type: "text" },
  { id: 7, title: "Hobby", description: "What is the hobby of X(random of 4 persons) person?", score: 10, completed: false, type: "text" },
  { id: 8, title: "Oreivaton creation", description: "When was oreivaton created (ask someone of the team)", score: 10, completed: false, type: "text" },
  { id: 9, title: "NBS creation", description: "When was NBS created (ask someone of the team)", score: 5, completed: false, type: "text" },
]

export function TreasureHunt() {
  const [currentStep, setCurrentStep] = useState(0)
  const [playerInfo, setPlayerInfo] = useState({ firstName: "", lastName: "", email: "", experience: "" })
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [totalScore, setTotalScore] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { ref } = useZxing({
    onResult(result) {
      setCurrentAnswer(result.getText())
    },
  })

  useEffect(() => {
    const savedSession = Cookies.get('treasureHuntSession')
    if (savedSession) {
      const session = JSON.parse(savedSession)
      setCurrentStep(session.currentStep)
      setPlayerInfo(session.playerInfo)
      setTasks(session.tasks)
      setTotalScore(session.totalScore)
      setGameCompleted(session.gameCompleted)
    }
  }, [])

  const saveSession = () => {
    const session = {
      currentStep,
      playerInfo,
      tasks,
      totalScore,
      gameCompleted
    }
    Cookies.set('treasureHuntSession', JSON.stringify(session), { expires: 1 }) // Expires in 1 day
  }

  useEffect(() => {
    saveSession()
  }, [currentStep, playerInfo, tasks, totalScore, gameCompleted])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPlayerInfo(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep === 0) {
      setCurrentStep(1)
    } else {
      const updatedTasks = tasks.map((task, index) => 
        index === currentStep - 1 ? { ...task, completed: true } : task
      )
      setTasks(updatedTasks)
      setTotalScore(prev => prev + tasks[currentStep - 1].score)
    }
  }

  const handleNext = () => {
    if (currentStep < tasks.length) {
      setCurrentStep(prev => prev + 1)
    } else {
      setGameCompleted(true)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfieImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    Cookies.remove('treasureHuntSession')
    setCurrentStep(0)
    setPlayerInfo({ firstName: "", lastName: "", email: "", experience: "" })
    setTasks(initialTasks)
    setTotalScore(0)
    setGameCompleted(false)
    setCurrentAnswer("")
    setSelfieImage(null)
  }

  const renderForm = () => (
    <div className="min-h-screen bg-[#34D399] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full opacity-20"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white rounded-full opacity-20"></div>
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#059669]">Welcome to the Treasure Hunt</CardTitle>
          <CardDescription className="text-center text-[#059669]">Please enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#059669]">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={playerInfo.firstName}
                onChange={handleInputChange}
                required
                className="border-[#059669] focus:ring-[#059669]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#059669]">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={playerInfo.lastName}
                onChange={handleInputChange}
                required
                className="border-[#059669] focus:ring-[#059669]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#059669]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={playerInfo.email}
                onChange={handleInputChange}
                required
                className="border-[#059669] focus:ring-[#059669]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-[#059669]">Years of Experience</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                placeholder="5"
                value={playerInfo.experience}
                onChange={handleInputChange}
                required
                min="0"
                className="border-[#059669] focus:ring-[#059669]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#059669] hover:bg-[#047857] text-white">
              Start Game <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  const renderTask = (task: Task) => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {task.type === "text" && (
            <Input 
              placeholder="Enter your answer" 
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border-[#059669] focus:ring-[#059669]" 
            />
          )}
          {task.type === "image" && (
            <div className="space-y-2">
              <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                <Camera className="mr-2 h-4 w-4" /> Take Selfie
              </Button>
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              {selfieImage && (
                <div className="mt-2">
                  <img src={selfieImage} alt="Selfie" className="max-w-full h-auto rounded-lg" />
                </div>
              )}
            </div>
          )}
          {task.type === "social" && (
            <div className="space-y-2">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <InstagramEmbed url="https://www.instagram.com/oreivaton/" width={328} />
              </div>
            </div>
          )}
          {task.type === "scan" && (
            <div className="space-y-2">
              <video ref={ref} className="w-full" />
              <p>Scanned Code: {currentAnswer}</p>
            </div>
          )}
          <Button type="submit" className="w-full bg-[#059669] hover:bg-[#047857] text-white">
            Submit Answer
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderGameComplete = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Game Complete!</CardTitle>
        <CardDescription>Congratulations on finishing the Treasure Hunt!</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your total score: {totalScore}</p>
        <p>Thank you for playing, {playerInfo.firstName}!</p>
        <Button onClick={handleReset} className="mt-4 w-full bg-[#059669] hover:bg-[#047857] text-white">
          Start New Game
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-[#34D399] flex items-center justify-center p-4">
      {currentStep === 0 && renderForm()}
      {currentStep > 0 && currentStep <= tasks.length && (
        <div className="space-y-4">
          {renderTask(tasks[currentStep - 1])}
          <div className="flex justify-between">
            <Button onClick={handlePrevious} disabled={currentStep === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === tasks.length ? "Complete" : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {gameCompleted && renderGameComplete()}
    </div>
  )
}