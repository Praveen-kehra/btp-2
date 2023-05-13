import React, { useState } from 'react'
import Web3 from 'web3';
import "./uploadData.css";
import axios from 'axios';

export default function UploadData(props) {
    // console.log(props);
    const [file, setFile] = useState(null);
    let reader;
    const [web3, setWeb3] = useState(null);
    useEffect(() => {
      const initWeb3 = async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          try {
            // Request account access if needed
            await window.ethereum.enable();
            setWeb3(web3Instance);
          } catch (error) {
            // User denied account access
            console.error('User denied account access');
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          const web3Instance = new Web3(window.web3.currentProvider);
          setWeb3(web3Instance);
        }
        // Non-dapp browsers...
        else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
      };
  
      initWeb3();
    }, []);
    
    const handleFileLoad = async (event) => {
        const text = reader.result;
        console.log(file.name)
        const res = await axios.post("/sendToServer", {
            textData: text,
            id: props.id,
            name: file.name
        })
        console.log(res)
    }
    const uploadHandler = async (e) => {
        e.preventDefault();
        // console.log(file);

        if(file!==null){
            reader = new FileReader();
            reader.onloadend = handleFileLoad;
            reader.readAsText(file);
            // setFile(null);
        }
        if (!web3) {
          console.error('Web3 is not initialized');
          return;
        }


        try {
          const accounts = await web3.eth.getAccounts();
          const from = accounts[0];
      
          const transaction = {
            from: from,
            to: '<recipient-address>',
            value: web3.utils.toWei('<amount-in-ether>', 'ether'),
            gas: 200000, 
          };
      
          // Send the transaction
          const transactionHash = await web3.eth.sendTransaction(transaction);
      
          console.log('Transaction sent:', transactionHash);
        } catch (error) {
          console.error('Error sending transaction:', error);
        }
    }

  return (
    <div className="upload-data-container">
        <form onSubmit={uploadHandler}>
            <label htmlFor="file">
              <span className="file-label">
                Select file
              </span>
              <input
                style={{ display: "none" }} 
                type="file" id="file" 
                accept=".txt" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
            </label>
            <button type="submit">Upload</button>
        </form>
    </div>
  )
}
