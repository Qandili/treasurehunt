// TreasureHunt.tsx
import React, { useState, useRef, useEffect } from "react";
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { useZxing } from "react-zxing";
import { InstagramEmbed } from 'react-social-media-embed';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import logo from '@/assets/logo.png'; // Tell webpack this JS file uses this image
import axios from 'axios';


interface Task {
  id: number;
  title: string;
  description: string;
  timeSpent?: number; // New property to track time in seconds
  completed: boolean;
  type: "text" | "image" | "social" | "scan";
}

// Mapping for persons and their hobbies
const personHobbies = {
  "Nizar krimis": "music",
  "Bader Toumi": "design",
  "Mohamed Elqandili": "surf",
  "Marouan Zibout": "box"
};

const personKeys = Object.keys(personHobbies);

const initialTasks: Task[] = [
  { id: 3, title: "Take a selfie", description: "Take a selfie with X person and the X person verifies the selfie by entering a code", score: 15, completed: false, type: "image" },
  { id: 4, title: "Scan code", description: "Scan code bar only when nad session finishes (chakib and marouanXbadr)", score: 10, completed: false, type: "scan" },
  { id: 5, title: "Salesforce character", description: "Who's the Salesforce character (genie, ....)", score: 10, completed: false, type: "text" },
  { id: 1, title: "Follow LinkedIn", description: "Follow LinkedIn accounts", score: 10, completed: false, type: "social" },
  { id: 2, title: "Follow Instagram", description: "Follow Instagram accounts", score: 10, completed: false, type: "social" },
  { id: 6, title: "Answer question", description: "Answer a question in the stand (the one in the stand validates with a code)", score: 15, completed: false, type: "text" },
  { id: 7, title: "Hobby", description: "What is the hobby of XXX (random of 4 persons) person?", score: 10, completed: false, type: "text" },
  { id: 8, title: "Oreivaton creation", description: "When was oreivaton created (ask someone of the team)", score: 10, completed: false, type: "text" },
  { id: 9, title: "NBS creation", description: "When was NBS created (ask someone of the team)", score: 5, completed: false, type: "text" },
];

const API_URL = "http://localhost:8087"; // Back-End-Url
//const [endGameDate, setEndGameDate] = useState<Date | null>(null);

export function TreasureHunt() {
  // Initialize state from cookies or use default values
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = Cookies.get('currentStep');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [result, setResult] = useState("");
  const [playerInfo, setPlayerInfo] = useState<{ firstName: string; lastName: string; email: string; experience: string }>(() => {
    const savedInfo = Cookies.get('playerInfo');
    return savedInfo ? JSON.parse(savedInfo) : { firstName: "", lastName: "", email: "", experience: "" };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = Cookies.get('tasks');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });

  const [totalTime, setTotalTime] = useState<number>(() => {
    const savedTime = Cookies.get('totalTime');
    return savedTime ? parseInt(savedTime, 10) : 0;
  });
  const [startTime, setStartTime] = useState<number | null>(null);


  const [gameCompleted, setGameCompleted] = useState<boolean>(() => {
    const savedGameStatus = Cookies.get('gameCompleted');
    return savedGameStatus === 'true';
  });

  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  const [selectedPerson, setSelectedPerson] = useState<string>(() => {
    // Generate a random person initially if step 7 is the first step
    return personKeys[Math.floor(Math.random() * personKeys.length)];
  });

  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  // Vanta.js setup
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (currentStep === 7) {
      const randomPerson = personKeys[Math.floor(Math.random() * personKeys.length)];
      setSelectedPerson(randomPerson);
    }
  }, [currentStep]);


  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE,
          color: 0x10b981, // Teal color for the web lines
          backgroundColor: 0x0f172a, // Dark navy blue background
          points: 12.0,
          maxDistance: 20.0,
          spacing: 15.0,
          showDots: false,
          showLines: true,
          lineColor: 0xffffff, // White lines
          lineWidth: 1.0,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minSpeed: 0.2,
          maxSpeed: 0.4,
          scale: 1.0,
          scaleMobile: 1.0
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  // Persist state to cookies
  useEffect(() => {
    Cookies.set('currentStep', currentStep.toString(), { expires: 7 }); // Expires in 7 days
  }, [currentStep]);

  useEffect(() => {
    Cookies.set('playerInfo', JSON.stringify(playerInfo), { expires: 7 });
  }, [playerInfo]);

  useEffect(() => {
    Cookies.set('tasks', JSON.stringify(tasks), { expires: 7 });
  }, [tasks]);

  useEffect(() => {
    Cookies.set('totalTime', totalTime.toString(), { expires: 7 });
  }, [totalTime]);


  useEffect(() => {
    Cookies.set('gameCompleted', gameCompleted.toString(), { expires: 7 });
  }, [gameCompleted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerInfo(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (currentStep === 7) {
      // Validate the hobby for the selected person
      if (currentAnswer.toLowerCase() === personHobbies[selectedPerson]) {
        toast.success("Correct! Moving to the next step.");
        //setCurrentStep((prev) => prev + 1);
        //setCurrentAnswer("");
      } else {
        toast.error("Incorrect hobby. Please try again.");
        return;
      }
    }

     // Step 3 validation for Salesforce character
     if (currentStep === 6) { 
      const validAnswers = ["apex"];
      if (!validAnswers.includes(currentAnswer.toLowerCase())) {
        toast.error("Invalid answer. Please try again.");
        return;
      }
    }

    // Step 3 validation for Salesforce character
    if (currentStep === 3) { 
      const validAnswers = ["hootie","earnie","meta","saasy","genie","astro","brandy","zig","koa","flo","codey", "einstein", "ruth", "appy", "blaze", "max", "genie", "cloudy"];
      if (!validAnswers.includes(currentAnswer.toLowerCase())) {
        toast.error("Invalid answer. Please try again.");
        return;
      }
    }
  
    if (currentStep === 0) {
      try {
        await createUser(playerInfo);
        setCurrentStep(1);
        setStartTime(Date.now()); // Record start time
        toast.success("Player information saved! Starting the game.");
      } catch (error) {
        if (error.message === "User with this email already exists") {
          toast.error("Please try again with a different email.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      }
    } else {
      const currentTask = tasks[currentStep - 1];
      const timeTaken = startTime ? (Date.now() - startTime) / 1000 : 0;
      const updatedTasks = tasks.map((task, index) =>
        index === currentStep - 1 ? { ...task, completed: true, timeSpent: timeTaken } : task
      );
      setTasks(updatedTasks);
      setTotalTime((prev) => prev + timeTaken);
      setStartTime(Date.now()); // Reset start time for the next task
      toast.success(`Task "${currentTask.title}" completed! Time taken: ${timeTaken.toFixed(2)} seconds.`);
      setCurrentAnswer("");
    }
  };
  




  const handleNext = async () => {
    if (currentStep === 9) { // Step 9 corresponds to index 8
        const userId = localStorage.getItem('userId'); // Replace with the actual key used to store user ID
        const endGameDate = new Date().toISOString(); // Get the current date and time in ISO format

        try {
            const response = await fetch(`${API_URL}/user/${userId}/endGame`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(endGameDate), // Send the end game date as JSON
            });

            if (!response.ok) {
                throw new Error('Failed to update end game date');
            }

            const data = await response.json();
            console.log(data); // Handle the response as needed
        } catch (error) {
            console.error('Error:', error);
            // Optionally show an error message to the user
        }
    }
    
    if (currentStep < tasks.length) {
        setCurrentStep(prev => prev + 1);
    } else {
        setGameCompleted(true);
        setCurrentStep(prev => prev + 1); // Move to game completed step
        toast.success("Congratulations! You've completed the Treasure Hunt.");
    }
};



  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfieImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderHeader = () => (
    <div className="w-full max-w-4xl mb-6 p-4 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md flex justify-between items-center">
      <div>
        <p className="text-lg font-semibold text-teal-400">Welcome, {playerInfo.firstName || "Player"}!</p>
        {currentStep > 0 && (
          <p className="text-sm text-teal-300">
            Step {currentStep > tasks.length ? tasks.length : currentStep} of {tasks.length}
          </p>
        )}
      </div>
      <div>
        <p className="text-lg font-semibold text-teal-400">Total Time: {totalTime.toFixed(2)} seconds</p>
      </div>
    </div>
  );


  const renderForm = () => (
    <div className="flex items-center justify-center p-4 relative z-10">
      <Card className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-teal-400">Welcome to the Treasure Hunt</CardTitle>
          <CardDescription className="text-center text-teal-300">Please enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-teal-300">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={playerInfo.firstName}
                onChange={handleInputChange}
                required
                className="border-teal-500 focus:ring-teal-500 bg-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-teal-300">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={playerInfo.lastName}
                onChange={handleInputChange}
                required
                className="border-teal-500 focus:ring-teal-500 bg-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-teal-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={playerInfo.email}
                onChange={handleInputChange}
                required
                className="border-teal-500 focus:ring-teal-500 bg-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-teal-300">Years of Experience</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                placeholder="5"
                value={playerInfo.experience}
                onChange={handleInputChange}
                required
                min="0"
                className="border-teal-500 focus:ring-teal-500 bg-gray-700 text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white">
              Start Game <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderTask = (task: Task) => (
    <Card className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-teal-400">{task.title}</CardTitle>
        <CardDescription className="text-teal-300">{task.description.replace("XXX", selectedPerson)}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {task.type === "text" && (
            <Input
              placeholder="Enter your answer"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border-teal-500 focus:ring-teal-500 bg-gray-700 text-white"
              required
            />
          )}
          {task.type === "image" && (
            <div className="space-y-2">
              <Button onClick={() => fileInputRef.current?.click()} type="button" className="w-full bg-teal-500 hover:bg-teal-600 text-white">
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
              <div className="flex justify-center">
                <InstagramEmbed url="https://www.instagram.com/oreivaton/" width={328} />
              </div>
            </div>
          )}
          {task.type === "scan" && (
            <div className="space-y-2">
              <video ref={ref} className="w-full" />
              <p className="text-teal-300">Scanned Code: {currentAnswer}</p>
            </div>
          )}
          <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white">
            Submit Answer
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderGameComplete = () => (
    <Card className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-teal-400">Game Complete!</CardTitle>
        <CardDescription className="text-teal-300">Congratulations on finishing the Treasure Hunt!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-teal-300">Your total time: {totalTime.toFixed(2)} seconds</p>
        <p className="text-teal-300">Thank you for playing, {playerInfo.firstName}!</p>
        <Button
          onClick={() => {
            Cookies.remove("currentStep");
            Cookies.remove("playerInfo");
            Cookies.remove("tasks");
            Cookies.remove("totalTime");
            Cookies.remove("gameCompleted");
            localStorage.removeItem("userId"); // Clear user ID from local storage
            setCurrentStep(0);
            setPlayerInfo({ firstName: "", lastName: "", email: "", experience: "" });
            setTasks(initialTasks);
            setTotalTime(0);
            setGameCompleted(false);
            setCurrentAnswer("");
            setSelfieImage(null);
            toast.info("Game has been restarted.");
          }}
          className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white"
        >
          Restart Game
        </Button>

      </CardContent>
    </Card>
  );

  // const createUser = async (userInfo: { firstName: string; lastName: string; email: string; experience: string }) => {
  //   try {
  //     const response = await fetch(`${API_URL}/user`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(userInfo),
  //     });

  //     if (!response.ok) {
  //       if (response.status === 409) {
  //         throw new Error("User with this email already exists");
  //       }
  //       // Attempt to parse the error response as JSON
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to create user");
  //     }

  //     const data = await response.json(); // Ensure successful response parsing
  //     toast.success("User created successfully");
  //     return data;
  //   } catch (error) {
  //     console.error("Caught error:", error);
  //     throw new Error(error.message || "An unexpected error occurred");
  //   }
  // };

  const createUser = async (userInfo: { firstName: string; lastName: string; email: string; experience: string }) => {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("User with this email already exists");
        }
        // Attempt to parse the error response as JSON
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const data = await response.json(); // Ensure successful response parsing
      localStorage.setItem("userId", data.id); // Store user ID in local storage
      toast.success("User created successfully");
      return data;
    } catch (error) {
      console.error("Caught error:", error);
      throw new Error(error.message || "An unexpected error occurred");
    }
  };

//   const updateEndGame = async (userId, endGameDate) => {
//     try {
//         const response = await axios.patch(`/api/users/${userId}/endGame`, endGameDate);
//         // Handle the response here (e.g., updating state or displaying a message)
//         console.log('End game updated successfully:', response.data);
//     } catch (error) {
//         // Handle error appropriately
//         console.error('Error updating end game:', error);
//     }
// };

  


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Vanta.js Background */}
      <div ref={vantaRef} className="absolute top-0 left-0 w-full h-full z-0"></div>
      {/* Main Content */}
      <div className="w-full max-w-4xl z-10 relative">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="w-48" /> {/* Adjust size as needed */}
        </div>
        {currentStep > 0 && !gameCompleted && renderHeader()}
        {currentStep === 0 && renderForm()}
        {currentStep > 0 && currentStep <= tasks.length && (
          <div className="space-y-4">
            {renderTask(tasks[currentStep - 1])}
            <div className="flex justify-between">
              <Button onClick={handlePrevious} disabled={currentStep === 1} className="bg-teal-500 hover:bg-teal-600 text-white disabled:bg-teal-300">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={handleNext} disabled={!tasks[currentStep - 1].completed} className="bg-teal-500 hover:bg-teal-600 text-white disabled:bg-teal-300">
                {currentStep === tasks.length ? "Complete" : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {gameCompleted && renderGameComplete()}
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
