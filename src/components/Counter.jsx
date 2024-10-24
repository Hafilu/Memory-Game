import React, { useState, useEffect } from 'react';

const Counter = ({ handleLose,isRunning,setIsRunning,seconds,setSeconds }) => {
 
  // Track whether the timer is running
 
  useEffect(() => {
    let timer;

    if (isRunning && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      handleLose(); // Call handleLose when time is up
    }

    return () => clearInterval(timer); // Cleanup the interval
  }, [  seconds ,isRunning]);

  

 

  return (
    <div className="flex flex-col items-center justify-center pb-6 ">
      <div className="text-center">
        <h1 className="text-xl  ">{seconds} seconds</h1>
        <div className="mt-4">
           
          
        </div>
      </div>
    </div>
  );
};

export default Counter;
