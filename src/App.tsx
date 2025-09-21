import { useEffect, useState } from 'react';
import './App.css'
import axios from 'axios';

const URL = "https://0819-lesson-ecr.com/api";
//const URL = "http://127.0.0.1:8070/api";


const App = () => {

  const [display,setDisplay] = useState("");

  useEffect(() => { 
    const fetchData = async() => {
      const response = await axios.get(URL)
      setDisplay(response.data.date);
    }
    fetchData();
  },[])

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        Response from REST API2 is {display ? display : "..."}
      </div>
    </>
  )
}

export default App
