// TreasureHunt.tsx
import React, { useState, useRef, useEffect } from "react";
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "./ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Camera, Weight } from "lucide-react";
import { useZxing } from "react-zxing";
import { InstagramEmbed } from 'react-social-media-embed';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import logo from '@/assets/logo.png'; // Tell webpack this JS file uses this image
//import axios from 'axios';
import  QrReader   from 'react-qr-reader';
import { Scanner } from "@yudiel/react-qr-scanner";

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
  "Marouan Zibout": "box",
  "Yahya Boujrah": "football"
};

const personKeys = Object.keys(personHobbies);

const initialTasks: Task[] = [
  //{ id: 3, title: "Take a selfie", description: "Take a selfie with X person and the X person verifies the selfie by entering a code", completed: false, type: "image" },
  { id: 6, title: "Answer question", description: "Answer a question in the stand (and scan the QR Code)", completed: false, type: "scan" },
  { id: 5, title: "Salesforce character", description: "Who's the Salesforce character (genie, ....)", completed: false, type: "text" },
  { id: 1, title: "Follow Instagram", description: "Follow Instagram accounts Oreivaton", completed: false, type: "social" },
  { id: 2, title: "Follow Instagram", description: "Follow Instagram accounts NBS", completed: false, type: "social" },
  { id: 4, title: "Scan code", description: "Scan code bar only when nad session finishes (Marouan & Badr)", completed: false, type: "scan" },
  //{ id: 7, title: "Hobby", description: "What is the hobby of XXX (random of 4 persons) person?", completed: false, type: "text" },
  //{ id: 8, title: "Oreivaton creation", description: "When was oreivaton created (ask someone of the team)", completed: false, type: "text" },
  //{ id: 9, title: "NBS creation", description: "When was NBS created (ask someone of the team)", completed: false, type: "text" },
];

const API_URL = "https://fathomless-sea-47280-fc55bb4ea773.herokuapp.com/"; // Back-End-Url

export function TreasureHunt() {
  // Initialize state from cookies or use default values
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = Cookies.get('currentStep');
    return savedStep ? parseInt(savedStep, 10) : 0;//change to 0
  });
  console.log(currentStep);
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
  //new var
  const [selfieImageFile, setSelfieImageFile] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const debounceTimeoutRef = useRef(null);
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
    // Step 1 validation the QR scan code First
    if (currentStep === 1) {
      if (currentAnswer !== "3dX9$Zk!Qp7#tWm2") {
        console.log("currentAnswer:", currentAnswer)
        toast.error("Please scan the right code.");
        return;
      }
      window.location.reload();
      setCurrentStep(currentStep + 1);
    }

    // Step 2 validation for Salesforce character
    if (currentStep === 2) {
      console.log(selectedCharacter!.name);
      console.log(currentAnswer.toLowerCase());
      const validAnswers = ["hootie", "earnie", "meta", "saasy", "genie", "astro", "brandy", "zig", "koa", "flo", "codey", "einstein", "ruth", "appy", "blaze", "max", "genie", "cloudy"];
      // if (!validAnswers.includes(currentAnswer.toLowerCase())) {
      if (selectedCharacter?.name !== currentAnswer.toLowerCase()) {
        toast.error("Invalid answer. Please try again.");
        return;
      }
    }

    // Step 5 validation the QR scan code 
    if (currentStep === 5) {
      if (currentAnswer !== "3dX9$Zk!Qp7#tWm2") {
        console.log("currentAnswer:", currentAnswer)
        toast.error("Please scan the right code.");
        return;
      }
      window.location.reload();
      // setCurrentStep(6);
    }

    if (currentStep === 0) {
      try {
        await createUser(playerInfo);
        setCurrentStep(1);
        setStartTime(Date.now()); // Record start time
        toast.success("Player information saved! Starting the game.");
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "User with this email already exists") {
            toast.error("Please try again with a different email.");
          } else {
            toast.error("An error occurred. Please try again.");
          }
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
      console.log("HANDLE FORM")
      setCurrentAnswer("");
    }
  };
  interface QrCodeResult {
    text: string;
  }
  

  const handleNext = async () => {
    // 5 Last Step to Update the END DATE
    if (currentStep === 5) {
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
      setSelfieImageFile(file); // Save the File object
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfieImage(reader.result as string); // For preview purposes only
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

  //the First Form
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
  let isScanned = false
  //Render The Tasks
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

          {/*1 SCAN QR Stand*/}
          {currentStep === 1 && task.type === "scan" && (
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowCameraModal(true);
                  setIsQRScanned(false);
                }}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                Open Camera
              </Button>

              {hasCameraPermission && isCameraOpen && !isQRScanned && (
                //  <Scanner onScan={(result) =>   {
                //     if (result) {
                //       const firstResult = result[0];
                //       handleQRScan(firstResult.rawValue);
                //     }
                //   }}/>
                <QrReader
                  scanDelay={300}
                  onResult={(result: QrCodeResult | null, error: Error | null) => {
                    if (result?.text) {
                      handleQRScan(result.text);
                    }
                    if (error) {
                      // console.error("QR Scan Error:", error);
                    }
                  }}
                  style={{ width: '100%' }}
                />
              )}
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)} // Allow manual input
                placeholder="Enter or scan code"
                className="border border-gray-300 p-2 rounded mt-4 w-full"
              />
            </div>
          )}


          {/*2 Salesforce character*/}
          {currentStep === 2 && (
            <Card className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm">
              <CardContent>
                {selectedCharacter && (
                  <>
                    <div className="text-center mb-4">
                      <img
                        src={selectedCharacter.imageUrl}
                        alt={selectedCharacter.name}
                        className="max-w-full h-auto rounded-lg"
                        style={{ width: "auto ", height: "100%" }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
          }

          {/*3 Follow Oreivaton*/}
          {currentStep === 3 && task.type === "social" && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <InstagramEmbed url="https://www.instagram.com/oreivaton/" width={328} />
              </div>
            </div>
          )}

          {/*4 Follow NBS*/}
          {currentStep === 4 && task.type === "social" && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <InstagramEmbed url="https://www.instagram.com/nbsconsultingsalesforcepartner/" width={328} />
              </div>
            </div>
          )}

          {/*5 SCAN QR Marouan & Bader*/}
          {currentStep === 5 && task.type === "scan" && (
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowCameraModal(true);
                  setIsQRScanned(false);
                }}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                Open Camera
              </Button>

              {hasCameraPermission && isCameraOpen && !isQRScanned && (
                <QrReader
                  scanDelay={300}
                  onResult={(result: QrCodeResult | null, error: Error | null) => {
                    if (result?.text) {
                      handleQRScan(result.text);
                    }
                    if (error) {
                      // console.error("QR Scan Error:", error);
                    }
                  }}
                  style={{ width: '100%' }}
                />
              )}
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)} // Allow manual input
                placeholder="Enter or scan code"
                className="border border-gray-300 p-2 rounded mt-4 w-full"
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white">
            Submit Answer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
  interface SalesforceCharacter {
    name: string;
    imageUrl: string;
    // other properties...
  }
  const [selectedCharacter, setSelectedCharacter] = useState<SalesforceCharacter | null>(null);
  const [userInput, setUserInput] = useState("");
  const salesforceCharacters = [
    { name: "astro", imageUrl: "https://images.squarespace-cdn.com/content/v1/5e51ea8f4f456572ed1b06ef/51df277e-0dbb-4711-9ba1-88752fff7e29/loresASTRO_Tshirt_ArmsUpRight_SFS20_sRGB.jpg" },
    { name: "codey", imageUrl: "https://www.salesforce.com/blog/wp-content/uploads/sites/2/2021/12/2021-12-360Blog-2D-IndividualIllustrations-Codey.png?strip=all&quality=95" },
    { name: "cloudy", imageUrl: "https://www.salesforce.com/news/wp-content/uploads/sites/3/2020/08/Cloudy.png?w=243" },
    { name: "einstein", imageUrl: "https://www.salesforce.com/news/wp-content/uploads/sites/3/2023/03/Newsroom-Press-Release.png" },
    { name: "genie", imageUrl: "https://gettectonic.com/wp-content/uploads/2024/04/Salesforce-Genie-Announced2.webp" },
    { name: "hootie", imageUrl: "https://developer.salesforce.com/files/ti/blogs/img/Blog-ContextualDrivers-336x360-Hootie.png" },
    { name: "meta", imageUrl: "https://cloudanalysts.com/wp-content/uploads/2021/01/Salesforce-characters_Meta_Moose.png" },
    { name: "ruth", imageUrl: "https://www.salesforce.com/blog/wp-content/uploads/sites/2/2021/12/2021-12-360Blog-2D-IndividualIllustrations-Ruth.png?strip=all&quality=95" },
    { name: "saasy", imageUrl: "https://i0.wp.com/cloudvandana.com/wp-content/uploads/2022/10/EKy1GbMW4AEMtx5-1024x1024.jpg?resize=1024%2C1024&ssl=1" },
    { name: "max", imageUrl: "https://www.salesforce.com/de/blog/wp-content/uploads/sites/7/2022/12/mulesoft-rpa-lifecycle-image.png" },
    { name: "blaze", imageUrl: "https://acsgbl.com/wp-content/uploads/2022/09/Salesforce-Characters-5.png" },
    { name: "brandy", imageUrl: "https://cloudanalysts.com/wp-content/uploads/2021/01/Salesforce-characters-Brandy-the-fox.png" },
    { name: "earnie", imageUrl: "https://cloudanalysts.com/wp-content/uploads/2021/01/Salesforce-mascots_ernie-the-badger.png" },
    { name: "flo", imageUrl: "https://www.salesforce.com/au/blog/wp-content/uploads/sites/4/2023/03/Flo-Blog-Image-03-1500x844-1.png" },
    { name: "zig", imageUrl: "https://www.salesforce.com/blog/wp-content/uploads/sites/2/2023/05/2023-05-360Blog-ContextualDriver-Zig-567x844-1.png" },
    { name: "koa", imageUrl: "https://acsgbl.com/wp-content/uploads/2022/09/Salesforce-Characters-2.png" },
    { name: "appy", imageUrl: "https://www.salesforce.com/news/wp-content/uploads/sites/3/2023/10/Gartner_AppExchange.jpg" }
  ];

  // Call this function to set the initial character when the component mounts
  useEffect(() => {
    /* 3 ===> 2 */
    if (currentStep === 2) {
      selectRandomCharacter();
    }
  }, [currentStep]);


  // Function to randomly select a character
  const selectRandomCharacter = () => {
    const randomIndex = Math.floor(Math.random() * salesforceCharacters.length);
    setSelectedCharacter(salesforceCharacters[randomIndex]);
  };
  const [isQRScanned, setIsQRScanned] = useState(false);

  // Function to handle the QR code scan
  const handleQRScan = (scannedValue: string) => {
    if (scannedValue === "3dX9$Zk!Qp7#tWm2" && hasCameraPermission && isCameraOpen && !isQRScanned && !isScanned) {
      console.log({ isQRScanned, isScanned })
      setCurrentAnswer(scannedValue); // Update the state with the valid value
      toast.success("QR code is correct!"); // Show success message
      setIsQRScanned(true); // Mark as successfully scanned
      setIsCameraOpen(false); // Close the camera

      stopCamera();
      isScanned = true
    } else if (scannedValue !== "3dX9$Zk!Qp7#tWm2") {
      toast.error("Invalid QR code! Please scan again.");
    }
  };


  // Stop camera function
  const stopCamera = () => {
    console.log("Stopping camera...");
    console.log("MediaStream Reference Before Stopping:", mediaStreamRef.current);

    if (mediaStreamRef.current) {
      // Stop all tracks in the media stream
      mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });

      // Clear the media stream reference
      mediaStreamRef.current = null;
      setIsCameraOpen(false); // Close the camera

      console.log("Camera stopped successfully.");
    } else {
      console.log("No active camera stream to stop.");
    }
  };

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
            setSelfieImageFile(null);
            toast.info("Game has been restarted.");
          }}
          className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white"
        >
          Restart Game
        </Button>

      </CardContent>
    </Card>
  );

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
      const typedError = error as Error; // Assert error type
      console.error("Caught error:", typedError);
      throw new Error(typedError.message || "An unexpected error occurred");
    }
  };
  //const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // Use back camera
        }
      });
      mediaStreamRef.current = stream;
      setHasCameraPermission(true);
      setIsCameraOpen(true);
      setShowCameraModal(false);
      toast.success("Camera access granted!");
    } catch (error) {
      console.error("Camera permission denied:", error);
      toast.error("Camera access is required to scan the QR code.");
      //setShowCameraModal(false);
    }
  };

  // Render the camera modal
  const renderCameraModal = () => (
    <Modal isOpen={showCameraModal}
      onClose={() => setShowCameraModal(false)}>
      <h2 style={{ color: '#000000', fontSize: '24px', fontWeight: '600', marginBottom: '2px' }} className="text-teal-400">Camera Permission</h2>
      <p style={{ color: '#000000', fontWeight: '600', marginBottom: '16px' }} className="text-teal-300">To scan the QR code, we need access to your camera. Please allow camera access.</p>
      <Button onClick={requestCameraPermission} className="bg-teal-500 hover:bg-teal-600 text-white">
        Allow Camera Access
      </Button>
      <Button onClick={() => setShowCameraModal(false)} className="mt-2 text-teal-500">
        Cancel
      </Button>
    </Modal>
  );

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
      <Modal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Camera Permission Required
        </h2>
        <p className="text-gray-600 mb-6">
          To scan the QR code, we need access to your camera. Please allow camera access.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={requestCameraPermission}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
          >
            Allow Camera Access
          </Button>
          <Button
            onClick={() => setShowCameraModal(false)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </Button>
        </div>
      </Modal>

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
