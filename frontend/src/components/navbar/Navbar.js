import React, { useEffect, useState } from 'react'
// import { ethers } from "ethers";
import Web3 from 'web3';
import "./navbar.css";

const web3 = new Web3(window.ethereum);
export default function Navbar() {
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState("");
  useEffect(()=>{
    const fun = async() => {
      const { ethereum } = window;
      if (!ethereum) {
        setError(true);
        setErrorMessage("Please install Metamask to connect.");
        return;
      }
      if (ethereum.isMetaMask && ethereum._metamask.isUnlocked()) {
        setLoggedIn(true);
      }
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
      } catch (err) {
        console.error(error);
        setError(true);
        setErrorMessage(err.message);
      }                                               
    }
    fun();
  }, [])
  return (
    <div className='navbar-container'>
      <span>Storage3.0</span>
      {error 
        ? 
          <span>
            {errorMessage}
          </span> 
        : <span className="connect-span">
            {!loggedIn 
              ? <button className='connect-button'>Connect</button> 
              : address.substring(0, 6) + "..."
            }
          </span>
      }
      
      
    </div>
  )
}
